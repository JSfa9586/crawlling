export interface G2BData {
    구분: string;
    카테고리: string;
    공고명: string;
    발주기관: string;
    수요기관?: string;
    배정예산?: string; // 사전규격
    추정가격?: string; // 입찰공고
    기초금액?: string; // 입찰공고
    입찰마감?: string;
    개찰일?: string;
    규격공개종료일?: string;
    등록일?: string;
    공고일?: string;
    공고차수?: string;
    입찰방식?: string;
    상태?: string;
    링크: string;
    등록번호?: string;
    공고번호?: string;
    [key: string]: string | undefined;
}

export interface G2BStats {
    lastExecutionTime: string;
    latestCrawlTime: string;
}
