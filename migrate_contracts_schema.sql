-- G2B 계약정보 DB 스키마 확장
-- 실행: psql -U postgres -d g2b_contracts -f migrate_contracts_schema.sql

-- 1. 계약 기본정보 추가 필드
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notice_no VARCHAR(50);           -- 공고번호
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS fixed_contract_no VARCHAR(50);   -- 확정계약번호
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_ref_no VARCHAR(50);     -- 계약참조번호
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS business_div_name VARCHAR(50);   -- 업무구분명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS joint_contract_yn VARCHAR(10);   -- 공동계약여부
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS long_term_div_name VARCHAR(50);  -- 장기계속구분명

-- 2. 금융 관련 필드
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS guarantee_rate DECIMAL(6,2);     -- 보증금률
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS delay_penalty_rate DECIMAL(6,2); -- 지체상금율
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS pay_div_name VARCHAR(50);        -- 지급구분명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS creditor_name VARCHAR(200);      -- 채권자명

-- 3. 일정 관련 필드
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;                 -- 착수일자
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS current_complete_date DATE;      -- 금차완수일자
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS total_complete_date DATE;        -- 총완수일자

-- 4. 계약기관 담당자 정보
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_jurisdiction VARCHAR(100);   -- 계약기관소관구분
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_dept_name VARCHAR(100);      -- 담당부서명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_officer_name VARCHAR(100);   -- 담당자명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_officer_tel VARCHAR(50);     -- 담당자전화
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS org_officer_fax VARCHAR(50);     -- 담당자팩스

-- 5. 추가 정보
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_info_url TEXT;          -- 계약정보URL
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS base_details TEXT;               -- 근거내역
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_method_name VARCHAR(100); -- 계약체결방법명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS demand_org_list TEXT;            -- 수요기관목록

-- 6. 분류 정보
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS classification_no VARCHAR(50);   -- 분류번호
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS classification_name VARCHAR(100);-- 분류명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS large_class_name VARCHAR(100);   -- 대분류명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS mid_class_name VARCHAR(100);     -- 중분류명
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS info_biz_yn VARCHAR(10);         -- 정보사업여부

-- 7. API 메타정보
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS api_rgst_dt TIMESTAMP;           -- API등록일시
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS api_chg_dt TIMESTAMP;            -- API변경일시

-- 8. 공동수급체 테이블에 사업자등록번호 추가 (이미 있으면 무시)
ALTER TABLE contract_partners ADD COLUMN IF NOT EXISTS bizno VARCHAR(20);

-- 9. 새 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_notice_no ON contracts(notice_no);
CREATE INDEX IF NOT EXISTS idx_fixed_contract_no ON contracts(fixed_contract_no);
CREATE INDEX IF NOT EXISTS idx_start_date ON contracts(start_date);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '스키마 마이그레이션 완료: contracts 테이블에 30개 컬럼 추가됨';
END $$;
