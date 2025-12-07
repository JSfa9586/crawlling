import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL 연결 풀
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'g2b_contracts',
    user: 'postgres',
    password: 'postgres123',
    max: 10,
});

interface YearlyData {
    year: number;
    count: number;
    total_amount: number;
    contracts: Array<{
        contract_no: string;
        contract_name: string;
        contract_amount: number;
        contract_date: string;
        contract_period: string;
        order_org_name: string;
        share_ratio: number;
        partner_type: string;
        detail_url: string;
    }>;
}

interface CompanyStats {
    company_name: string;
    total_count: number;
    total_amount: number;
    yearly_data: YearlyData[];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companiesParam = searchParams.get('companies') || '';

        if (!companiesParam) {
            return NextResponse.json({
                success: false,
                error: 'Companies parameter is required'
            }, { status: 400 });
        }

        const companies = companiesParam.split(',').map(c => c.trim()).filter(c => c.length > 0);

        if (companies.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'At least one company name is required'
            }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            const results: CompanyStats[] = [];

            for (const companyName of companies) {
                // 해당 업체가 참여한 모든 계약 조회 (중복 없이)
                // contract_partners 테이블에서 해당 업체의 실제 지분율을 항상 먼저 조회
                const contractsQuery = `
                    SELECT DISTINCT ON (c.contract_no)
                        c.contract_no,
                        c.contract_name,
                        c.contract_amount,
                        c.contract_date,
                        c.contract_period,
                        c.order_org_name,
                        c.detail_url,
                        EXTRACT(YEAR FROM c.contract_date) as contract_year,
                        -- 지분율: contract_partners에서 해당 업체의 실제 지분율 조회 (없으면 100%)
                        COALESCE(
                            (SELECT cp.share_ratio 
                             FROM contract_partners cp 
                             WHERE cp.contract_no = c.contract_no 
                             AND cp.partner_name ILIKE $1
                             ORDER BY cp.share_ratio DESC
                             LIMIT 1),
                            -- contract_partners에 없으면 contractor_name으로 다시 확인
                            (SELECT cp2.share_ratio
                             FROM contract_partners cp2
                             WHERE cp2.contract_no = c.contract_no
                             AND c.contractor_name ILIKE $1
                             AND cp2.partner_name ILIKE c.contractor_name
                             LIMIT 1),
                            100.00
                        ) as share_ratio,
                        -- 파트너 유형
                        COALESCE(
                            (SELECT cp.partner_type 
                             FROM contract_partners cp 
                             WHERE cp.contract_no = c.contract_no 
                             AND cp.partner_name ILIKE $1
                             LIMIT 1),
                            CASE WHEN c.contractor_name ILIKE $1 THEN '주계약업체' ELSE '공동수급' END
                        ) as partner_type
                    FROM contracts c
                    WHERE c.contractor_name ILIKE $1
                       OR EXISTS (
                           SELECT 1 FROM contract_partners cp 
                           WHERE cp.contract_no = c.contract_no 
                           AND cp.partner_name ILIKE $1
                       )
                    ORDER BY c.contract_no, c.contract_date DESC
                `;

                const contractsResult = await client.query(contractsQuery, [`%${companyName}%`]);

                if (contractsResult.rows.length === 0) {
                    results.push({
                        company_name: companyName,
                        total_count: 0,
                        total_amount: 0,
                        yearly_data: []
                    });
                    continue;
                }

                // 연도별로 그룹핑
                const yearlyMap = new Map<number, YearlyData>();
                let totalAmount = 0;

                for (const row of contractsResult.rows) {
                    const year = parseInt(row.contract_year) || new Date().getFullYear();
                    const shareRatio = parseFloat(row.share_ratio) || 100;
                    // 지분율에 따른 수주금액 계산
                    const contractAmount = (row.contract_amount || 0) * (shareRatio / 100);

                    if (!yearlyMap.has(year)) {
                        yearlyMap.set(year, {
                            year,
                            count: 0,
                            total_amount: 0,
                            contracts: []
                        });
                    }

                    const yearData = yearlyMap.get(year)!;
                    yearData.count += 1;
                    yearData.total_amount += contractAmount;
                    yearData.contracts.push({
                        contract_no: row.contract_no,
                        contract_name: row.contract_name,
                        contract_amount: row.contract_amount || 0,
                        contract_date: row.contract_date,
                        contract_period: row.contract_period || '',
                        order_org_name: row.order_org_name,
                        share_ratio: shareRatio,
                        partner_type: row.partner_type,
                        detail_url: row.detail_url
                    });

                    totalAmount += contractAmount;
                }

                // 연도 내림차순 정렬
                const yearlyData = Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year);

                results.push({
                    company_name: companyName,
                    total_count: contractsResult.rows.length,
                    total_amount: totalAmount,
                    yearly_data: yearlyData
                });
            }

            return NextResponse.json({
                success: true,
                data: results
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { success: false, error: 'Database connection failed' },
            { status: 500 }
        );
    }
}
