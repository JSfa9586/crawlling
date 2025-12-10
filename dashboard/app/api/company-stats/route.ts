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
        start_date?: string;
        contract_period: string;
        order_org_name: string;
        share_ratio: number;
        partner_type: string;
        detail_url: string;
        is_modified_contract?: boolean;
        joint_type?: string;  // 분담이행 / 공동이행
        is_joint_contract?: boolean;  // 공동도급 여부
        partners?: Array<{ name: string; share_ratio: number }>;  // 공동수급 파트너 목록
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

        // 기간 파라미터 파싱
        const startYear = parseInt(searchParams.get('startYear') || '') || new Date().getFullYear();
        const startMonth = parseInt(searchParams.get('startMonth') || '') || 1;
        const endYear = parseInt(searchParams.get('endYear') || '') || new Date().getFullYear();
        const endMonth = parseInt(searchParams.get('endMonth') || '') || 12;

        // 분석 모드: 'order' = 수주 분석, 'revenue' = 매출 분석
        const analysisMode = searchParams.get('mode') || 'order';

        // 계약명 키워드 필터 (포함)
        const contractKeywordsParam = searchParams.get('contractKeywords') || '';
        const contractKeywords = contractKeywordsParam.split(',').map(k => k.trim()).filter(k => k.length > 0);

        // 계약명 키워드 필터 (제외)
        const excludeKeywordsParam = searchParams.get('excludeKeywords') || '';
        const excludeKeywords = excludeKeywordsParam.split(',').map(k => k.trim()).filter(k => k.length > 0);

        // 시작일, 종료일 계산
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-01`;
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-31`;

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
                // 해당 업체가 참여한 계약 조회 (계약명+계약일 기준 그룹화로 중복 제거)
                const contractsQuery = `
                    SELECT 
                        ARRAY_AGG(DISTINCT c.contract_no) as contract_nos,
                        c.contract_name,
                        MAX(c.contract_amount) as contract_amount,
                        MAX(c.total_contract_amount) as total_contract_amount,
                        c.contract_date,
                        MAX(c.start_date) as start_date,
                        MAX(c.current_complete_date) as current_complete_date,
                        MAX(c.contract_period) as contract_period,
                        c.order_org_name,
                        MAX(c.detail_url) as detail_url,
                        -- 수주 분석: 착수일 기준 연도 (없으면 계약일)
                        COALESCE(EXTRACT(YEAR FROM MAX(c.start_date)), EXTRACT(YEAR FROM c.contract_date)) as effective_year,
                        EXTRACT(YEAR FROM c.contract_date) as contract_year,
                        -- 지분율: contract_partners에서 해당 업체의 실제 지분율 조회 (없으면 100%)
                        COALESCE(
                            MAX((SELECT cp.share_ratio 
                             FROM contract_partners cp 
                             WHERE cp.contract_no = c.contract_no 
                             AND cp.partner_name ILIKE $1
                             ORDER BY cp.share_ratio DESC
                             LIMIT 1)),
                            100.00
                        ) as share_ratio,
                        -- 공동도급 방식 (분담이행인지 확인)
                        MAX((SELECT cp.joint_type 
                             FROM contract_partners cp 
                             WHERE cp.contract_no = c.contract_no 
                             LIMIT 1)) as joint_type,
                        -- 공동도급 여부
                        (SELECT COUNT(*) > 1 FROM contract_partners cp WHERE cp.contract_no = ANY(ARRAY_AGG(c.contract_no))) as is_joint_contract,
                        -- 파트너 유형
                        COALESCE(
                            MAX((SELECT cp.partner_type 
                             FROM contract_partners cp 
                             WHERE cp.contract_no = c.contract_no 
                             AND cp.partner_name ILIKE $1
                             LIMIT 1)),
                            CASE WHEN c.contractor_name ILIKE $1 THEN '주계약업체' ELSE '공동수급' END
                        ) as partner_type
                    FROM contracts c
                    WHERE (
                        c.contractor_name ILIKE $1
                        OR EXISTS (
                            SELECT 1 FROM contract_partners cp 
                            WHERE cp.contract_no = c.contract_no 
                            AND cp.partner_name ILIKE $1
                        )
                    )
                    AND (
                        -- 수주 분석: 계약일 또는 착수일 기준
                        CASE WHEN $4 = 'order' THEN
                            (c.contract_date >= $2::date AND c.contract_date <= $3::date)
                            OR (c.start_date >= $2::date AND c.start_date <= $3::date)
                        -- 매출 분석: 완수일(current_complete_date) 기준
                        ELSE
                            c.current_complete_date >= $2::date AND c.current_complete_date <= $3::date
                        END
                    )
                    ${contractKeywords.length > 0
                        ? `AND (${contractKeywords.map((_, i) => `c.contract_name ILIKE $${5 + i}`).join(' OR ')})`
                        : ''}
                    ${excludeKeywords.length > 0
                        ? `AND NOT (${excludeKeywords.map((_, i) => `c.contract_name ILIKE $${5 + contractKeywords.length + i}`).join(' OR ')})`
                        : ''}
                    GROUP BY c.contract_name, c.contract_date, c.order_org_name, c.contractor_name
                    ORDER BY c.contract_date DESC
                `;

                const queryParams = [
                    `%${companyName}%`,
                    startDate,
                    endDate,
                    analysisMode,
                    ...contractKeywords.map(k => `%${k}%`),
                    ...excludeKeywords.map(k => `%${k}%`)
                ];
                const contractsResult = await client.query(contractsQuery, queryParams);

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
                    // 수주 분석: 착수일 기준 연도, 매출 분석: 계약일 기준 연도
                    const year = analysisMode === 'order'
                        ? (parseInt(row.effective_year) || parseInt(row.contract_year) || new Date().getFullYear())
                        : (parseInt(row.contract_year) || new Date().getFullYear());
                    const shareRatio = parseFloat(row.share_ratio) || 100;

                    // 분석 모드에 따른 금액 선택
                    // 수주 분석: total_contract_amount (총계약금액), 없으면 contract_amount
                    // 매출 분석: contract_amount (금차금액)
                    const baseAmount = analysisMode === 'order'
                        ? (row.total_contract_amount || row.contract_amount || 0)
                        : (row.contract_amount || 0);

                    // 지분율에 따른 금액 계산
                    const calculatedAmount = baseAmount * (shareRatio / 100);

                    if (!yearlyMap.has(year)) {
                        yearlyMap.set(year, {
                            year,
                            count: 0,
                            total_amount: 0,
                            contracts: []
                        });
                    }

                    const yearData = yearlyMap.get(year)!;

                    // 분담이행인 경우 금액 산정에서 제외 (is_excluded로 표시)
                    const isDivisionContract = row.joint_type === '분담이행';

                    if (!isDivisionContract) {
                        yearData.count += 1;
                        yearData.total_amount += calculatedAmount;
                    }

                    // 착수일과 계약일의 연도가 다르면 변경계약으로 표시
                    const startYear = row.start_date ? new Date(row.start_date).getFullYear() : null;
                    const contractYear = row.contract_date ? new Date(row.contract_date).getFullYear() : null;
                    const isModifiedContract = startYear && contractYear && startYear !== contractYear;

                    yearData.contracts.push({
                        contract_no: row.contract_nos?.[0] || row.contract_name,
                        contract_name: row.contract_name,
                        contract_amount: analysisMode === 'order'
                            ? (row.total_contract_amount || row.contract_amount || 0)
                            : (row.contract_amount || 0),
                        contract_date: row.contract_date,
                        start_date: row.start_date,
                        contract_period: row.contract_period || '',
                        order_org_name: row.order_org_name,
                        share_ratio: shareRatio,
                        partner_type: row.partner_type,
                        detail_url: row.detail_url,
                        is_modified_contract: !!isModifiedContract,
                        joint_type: row.joint_type || null,
                        is_joint_contract: !!row.is_joint_contract
                    });

                    if (!isDivisionContract) {
                        totalAmount += calculatedAmount;
                    }
                }

                // 연도 내림차순 정렬
                const yearlyData = Array.from(yearlyMap.values()).sort((a, b) => b.year - a.year);

                // 공동도급 파트너 목록 조회 (각 계약별로)
                for (const yearData of yearlyData) {
                    for (const contract of yearData.contracts) {
                        if (contract.is_joint_contract) {
                            const partnersQuery = `
                                SELECT partner_name, share_ratio 
                                FROM contract_partners 
                                WHERE contract_no = $1
                                ORDER BY share_ratio DESC
                            `;
                            const partnersResult = await client.query(partnersQuery, [contract.contract_no]);
                            contract.partners = partnersResult.rows.map(p => ({
                                name: p.partner_name,
                                share_ratio: parseFloat(p.share_ratio) || 0
                            }));
                        }
                    }
                }

                results.push({
                    company_name: companyName,
                    total_count: contractsResult.rows.filter(r => r.joint_type !== '분담이행').length,
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
