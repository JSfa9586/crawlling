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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyword = searchParams.get('keyword') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // 년도 필터
        const startYear = searchParams.get('startYear') || '';
        const endYear = searchParams.get('endYear') || '';

        // 월 필터
        const startMonth = searchParams.get('startMonth') || '';
        const endMonth = searchParams.get('endMonth') || '';

        // 금액 필터
        const minAmount = searchParams.get('minAmount') || '';
        const maxAmount = searchParams.get('maxAmount') || '';

        const client = await pool.connect();

        try {
            // 동적으로 WHERE 조건 구성
            let conditions: string[] = [];
            let paramIndex = 1;
            let queryParams: any[] = [];

            // 년도/월 필터 조건
            if (startYear && startMonth) {
                conditions.push(`c.contract_date >= $${paramIndex}`);
                queryParams.push(`${startYear}-${startMonth.padStart(2, '0')}-01`);
                paramIndex++;
            } else if (startYear) {
                conditions.push(`EXTRACT(YEAR FROM c.contract_date) >= $${paramIndex}`);
                queryParams.push(parseInt(startYear));
                paramIndex++;
            }

            if (endYear && endMonth) {
                // 해당 월의 마지막 날 계산
                const lastDay = new Date(parseInt(endYear), parseInt(endMonth), 0).getDate();
                conditions.push(`c.contract_date <= $${paramIndex}`);
                queryParams.push(`${endYear}-${endMonth.padStart(2, '0')}-${lastDay}`);
                paramIndex++;
            } else if (endYear) {
                conditions.push(`EXTRACT(YEAR FROM c.contract_date) <= $${paramIndex}`);
                queryParams.push(parseInt(endYear));
                paramIndex++;
            }

            // 금액 필터 조건
            if (minAmount) {
                conditions.push(`c.contract_amount >= $${paramIndex}`);
                queryParams.push(parseInt(minAmount));
                paramIndex++;
            }
            if (maxAmount) {
                conditions.push(`c.contract_amount <= $${paramIndex}`);
                queryParams.push(parseInt(maxAmount));
                paramIndex++;
            }

            // 키워드 필터 조건
            let keywordCondition = '';
            if (keyword) {
                keywordCondition = `(
                    c.contract_name ILIKE $${paramIndex}
                    OR c.product_name ILIKE $${paramIndex}
                    OR c.contractor_name ILIKE $${paramIndex}
                    OR c.order_org_name ILIKE $${paramIndex}
                    OR cp.partner_name ILIKE $${paramIndex}
                )`;
                queryParams.push(`%${keyword}%`);
                paramIndex++;
            }

            // 전체 WHERE 절 구성
            let whereClause = '';
            if (conditions.length > 0 || keywordCondition) {
                const allConditions = [...conditions];
                if (keywordCondition) allConditions.push(keywordCondition);
                whereClause = 'WHERE ' + allConditions.join(' AND ');
            }

            // 데이터 조회 쿼리 - 동일 계약명+계약일 그룹화
            const query = `
                SELECT 
                    ARRAY_AGG(DISTINCT c.contract_no) as contract_nos,
                    ARRAY_AGG(DISTINCT c.detail_url) as detail_urls,
                    c.contract_name,
                    c.product_name,
                    MAX(c.contract_amount) as contract_amount,
                    MAX(c.total_contract_amount) as total_contract_amount,
                    c.contract_date,
                    MAX(c.start_date) as start_date,
                    MAX(c.current_complete_date) as current_complete_date,
                    MAX(c.total_complete_date) as total_complete_date,
                    c.order_org_name,
                    c.contractor_name,
                    COUNT(DISTINCT c.contract_no) as duplicate_count
                FROM contracts c
                LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
                ${whereClause}
                GROUP BY c.contract_name, c.contract_date, c.order_org_name, c.contractor_name, c.product_name
                ORDER BY c.contract_date DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const dataParams = [...queryParams, limit, offset];

            // 카운트 쿼리 - 그룹 수 카운트
            const countQuery = `
                SELECT COUNT(*) FROM (
                    SELECT 1 FROM contracts c
                    LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
                    ${whereClause}
                    GROUP BY c.contract_name, c.contract_date, c.order_org_name, c.contractor_name, c.product_name
                ) as grouped
            `;

            // 데이터 조회
            const result = await client.query(query, dataParams);

            // 총 개수 조회
            const countResult = await client.query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0].count);

            // 각 계약의 공동수급체 정보 조회 (첫 번째 계약번호 기준)
            const contractsWithPartners = await Promise.all(
                result.rows.map(async (contract) => {
                    const contractNos = contract.contract_nos || [];
                    const primaryContractNo = contractNos[0];

                    if (primaryContractNo) {
                        const partnersResult = await client.query(
                            `SELECT partner_name, partner_type, share_ratio 
                             FROM contract_partners 
                             WHERE contract_no = $1 
                             ORDER BY partner_order`,
                            [primaryContractNo]
                        );
                        return {
                            ...contract,
                            contract_no: primaryContractNo,  // 대표 계약번호
                            detail_url: contract.detail_urls?.[0] || null,
                            partner_count: partnersResult.rows.length,
                            partners: partnersResult.rows
                        };
                    }
                    return {
                        ...contract,
                        contract_no: primaryContractNo,
                        detail_url: contract.detail_urls?.[0] || null,
                        partner_count: 0,
                        partners: []
                    };
                })
            );

            return NextResponse.json({
                success: true,
                data: contractsWithPartners,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
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
