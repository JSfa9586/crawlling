-- G2B 용역 계약 데이터베이스 스키마
-- PostgreSQL 18+

-- 계약 메인 테이블
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    contract_no VARCHAR(50) UNIQUE NOT NULL,
    contract_name TEXT NOT NULL,
    product_name TEXT,
    contract_amount BIGINT,
    total_contract_amount BIGINT,
    contract_date DATE,
    contract_period VARCHAR(100),
    order_org_code VARCHAR(50),
    order_org_name VARCHAR(200),
    demand_org_code VARCHAR(50),
    demand_org_name VARCHAR(200),
    contractor_name VARCHAR(200),
    contractor_bizno VARCHAR(20),
    contractor_ceo VARCHAR(100),
    detail_url TEXT,
    corp_list_raw TEXT,
    base_law_name TEXT,
    contract_method VARCHAR(100),
    bid_notice_no VARCHAR(50),
    request_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 공동수급체 테이블
CREATE TABLE IF NOT EXISTS contract_partners (
    id SERIAL PRIMARY KEY,
    contract_no VARCHAR(50) NOT NULL,
    partner_order INT,
    partner_type VARCHAR(50),
    joint_type VARCHAR(50),
    partner_name VARCHAR(200),
    ceo_name VARCHAR(100),
    nationality VARCHAR(50),
    share_ratio DECIMAL(6,2),
    bizno VARCHAR(20),
    FOREIGN KEY (contract_no) REFERENCES contracts(contract_no) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contract_date ON contracts(contract_date DESC);
CREATE INDEX IF NOT EXISTS idx_contractor_name ON contracts(contractor_name);
CREATE INDEX IF NOT EXISTS idx_order_org_name ON contracts(order_org_name);
CREATE INDEX IF NOT EXISTS idx_partners_contract_no ON contract_partners(contract_no);
CREATE INDEX IF NOT EXISTS idx_partners_name ON contract_partners(partner_name);

-- 검색 함수
CREATE OR REPLACE FUNCTION search_contracts(keyword TEXT)
RETURNS TABLE (
    contract_no VARCHAR,
    contract_name TEXT,
    contract_amount BIGINT,
    contract_date DATE,
    order_org_name VARCHAR,
    contractor_name VARCHAR,
    detail_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.contract_no,
        c.contract_name,
        c.contract_amount,
        c.contract_date,
        c.order_org_name,
        c.contractor_name,
        c.detail_url
    FROM contracts c
    WHERE 
        c.contract_name ILIKE '%' || keyword || '%'
        OR c.product_name ILIKE '%' || keyword || '%'
        OR c.contractor_name ILIKE '%' || keyword || '%'
        OR c.order_org_name ILIKE '%' || keyword || '%'
    ORDER BY c.contract_date DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contracts_update_timestamp ON contracts;
CREATE TRIGGER contracts_update_timestamp
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- 요약 뷰
CREATE OR REPLACE VIEW v_contract_summary AS
SELECT 
    c.contract_no,
    c.contract_name,
    c.contract_amount,
    c.contract_date,
    c.order_org_name,
    c.contractor_name,
    COUNT(cp.id) as partner_count,
    c.detail_url
FROM contracts c
LEFT JOIN contract_partners cp ON c.contract_no = cp.contract_no
GROUP BY c.contract_no, c.contract_name, c.contract_amount, c.contract_date, 
         c.order_org_name, c.contractor_name, c.detail_url
ORDER BY c.contract_date DESC;
