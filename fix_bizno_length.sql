-- bizno 필드 길이 확장 (VARCHAR(50) → VARCHAR(100))
-- 실행: psql -U postgres -d g2b_contracts -f fix_bizno_length.sql

ALTER TABLE contract_partners ALTER COLUMN bizno TYPE VARCHAR(100);

-- 확인
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'contract_partners' 
AND column_name = 'bizno';

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'bizno 필드 길이 확장 완료: VARCHAR(50) → VARCHAR(100)';
END $$;
