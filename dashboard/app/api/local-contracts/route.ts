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

        const client = await pool.connect();

        try {
            // 검색 쿼리
            let query: string;
            let countQuery: string;
            let queryParams: any[];

            if (keyword) {
                // 공동수급체(partner_name)도 검색 대상에 포함
                query = `
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
                    WHERE 
                        c.contract_name ILIKE $1
                        OR c.product_name ILIKE $1
                        OR c.contractor_name ILIKE $1
                        OR c.order_org_name ILIKE $1
                        OR cp.partner_name ILIKE $1
                    ORDER BY c.contract_date DESC
                    LIMIT $2 OFFSET $3
                `;
                countQuery = `
                    SELECT COUNT(DISTINCT c.contract_no) FROM contracts c
                    LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
                    WHERE 
                        c.contract_name ILIKE $1
                        OR c.product_name ILIKE $1
                        OR c.contractor_name ILIKE $1
                        OR c.order_org_name ILIKE $1
                        OR cp.partner_name ILIKE $1
                `;
                queryParams = [`%${keyword}%`, limit, offset];
            } else {
                query = `
                    SELECT 
                        c.contract_no,
                        c.contract_name,
                        c.product_name,
                        c.contract_amount,
                        c.contract_date,
                        c.order_org_name,
                        c.contractor_name,
                        c.detail_url,
                        (SELECT COUNT(*) FROM contract_partners cp WHERE cp.contract_no = c.contract_no) as partner_count
                    FROM contracts c
                    ORDER BY c.contract_date DESC
                    LIMIT $1 OFFSET $2
                `;
                countQuery = `SELECT COUNT(*) FROM contracts`;
                queryParams = [limit, offset];
            }

            // 데이터 조회
            const result = await client.query(query, queryParams);

            // 총 개수 조회
            const countResult = await client.query(
                countQuery,
                keyword ? [`%${keyword}%`] : []
            );
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
