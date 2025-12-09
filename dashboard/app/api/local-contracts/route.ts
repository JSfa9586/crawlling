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

        // 금액 필터
        const minAmount = searchParams.get('minAmount') || '';
        const maxAmount = searchParams.get('maxAmount') || '';

        const client = await pool.connect();

        try {
            // 동적으로 WHERE 조건 구성
            let conditions: string[] = [];
            let paramIndex = 1;
            let queryParams: any[] = [];

            // 년도 필터 조건
            if (startYear) {
                conditions.push(`EXTRACT(YEAR FROM c.contract_date) >= $${paramIndex}`);
                queryParams.push(parseInt(startYear));
                paramIndex++;
            }
            if (endYear) {
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

            // 데이터 조회 쿼리
            const query = `
                SELECT DISTINCT
                    c.contract_no,
                    c.contract_name,
                    c.product_name,
                    c.contract_amount,
                    c.contract_date,
                    c.order_org_name,
                    c.contractor_name,
                    c.detail_url,
                    (SELECT COUNT(*) FROM contract_partners cp2 WHERE cp2.contract_no = c.contract_no) as partner_count
                FROM contracts c
                LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
                ${whereClause}
                ORDER BY c.contract_date DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const dataParams = [...queryParams, limit, offset];

            // 카운트 쿼리
            const countQuery = `
                SELECT COUNT(DISTINCT c.contract_no) FROM contracts c
                LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
                ${whereClause}
            `;

            // 데이터 조회
            const result = await client.query(query, dataParams);

            // 총 개수 조회
            const countResult = await client.query(countQuery, queryParams);
            const totalCount = parseInt(countResult.rows[0].count);

            // 각 계약의 공동수급체 정보 조회
            const contractsWithPartners = await Promise.all(
                result.rows.map(async (contract) => {
                    if (parseInt(contract.partner_count) > 0) {
                        const partnersResult = await client.query(
                            `SELECT partner_name, partner_type, share_ratio 
                             FROM contract_partners 
                             WHERE contract_no = $1 
                             ORDER BY partner_order`,
                            [contract.contract_no]
                        );
                        return { ...contract, partners: partnersResult.rows };
                    }
                    return { ...contract, partners: [] };
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
