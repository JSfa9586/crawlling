-- 사전규격 테이블
CREATE TABLE IF NOT EXISTS g2b_pre_specs (
    reg_no VARCHAR(50) PRIMARY KEY, -- 등록번호 (bfSpecRgstNo)
    category VARCHAR(20), -- 카테고리 (용역, 물품 등)
    title TEXT, -- 공고명
    publisher VARCHAR(100), -- 발주기관
    demand_org VARCHAR(100), -- 수요기관
    budget TEXT, -- 배정예산 (문자열로 저장 후 필요 시 형변환)
    reg_date TIMESTAMP WITH TIME ZONE, -- 등록일
    end_date TIMESTAMP WITH TIME ZONE, -- 규격공개종료일
    status VARCHAR(20), -- 상태
    link TEXT, -- 링크
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 입찰공고 테이블
CREATE TABLE IF NOT EXISTS g2b_bids (
    bid_no VARCHAR(50), -- 공고번호 (bidNtceNo)
    bid_seq VARCHAR(10), -- 공고차수 (bidNtceOrd)
    category VARCHAR(20),
    title TEXT,
    publisher VARCHAR(100),
    demand_org VARCHAR(100),
    est_price TEXT, -- 추정가격
    base_price TEXT, -- 기초금액
    method VARCHAR(50), -- 입찰방식
    notice_date TIMESTAMP WITH TIME ZONE, -- 공고일
    bid_end_date TIMESTAMP WITH TIME ZONE, -- 입찰마감
    open_date TIMESTAMP WITH TIME ZONE, -- 개찰일
    status VARCHAR(50), -- 상태
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (bid_no, bid_seq)
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pre_specs_category ON g2b_pre_specs(category);
CREATE INDEX IF NOT EXISTS idx_pre_specs_publisher ON g2b_pre_specs(publisher);
CREATE INDEX IF NOT EXISTS idx_pre_specs_reg_date ON g2b_pre_specs(reg_date DESC);

CREATE INDEX IF NOT EXISTS idx_bids_category ON g2b_bids(category);
CREATE INDEX IF NOT EXISTS idx_bids_publisher ON g2b_bids(publisher);
CREATE INDEX IF NOT EXISTS idx_bids_notice_date ON g2b_bids(notice_date DESC);
