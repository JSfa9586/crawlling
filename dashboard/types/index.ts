// 크롤링 데이터 타입
export interface CrawlingData {
  기관구분: string;
  기관명: string;
  게시판: string;
  제목: string;
  작성일: string;
  링크: string;
  수집일시: string;
  내용?: string; // 법령분야, 행정규칙, 공고번호 등
  기간?: string; // 접수기간, 공고일자 등
}

// 대시보드 통계 타입
export interface DashboardStats {
  총게시물수: number;
  기관수: number;
  최근업데이트: string;
}

// 필터 옵션 타입
export interface FilterOptions {
  기관?: string;
  게시판?: string;
  시작일?: string;
  종료일?: string;
  검색어?: string;
}

// 테이블 컬럼 정의
export interface TableColumn {
  key: keyof CrawlingData;
  label: string;
  width?: string;
  sortable?: boolean;
}
