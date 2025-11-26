import { CrawlingData, FilterOptions } from '@/types';

/**
 * 크롤링 데이터 필터링
 * @param data - 필터링할 데이터 배열
 * @param filters - 필터 옵션
 * @returns 필터링된 데이터 배열
 */
export function filterData(data: CrawlingData[], filters: FilterOptions): CrawlingData[] {
  let filtered = [...data];

  // 기관별 필터링
  if (filters.기관 && filters.기관.trim()) {
    filtered = filtered.filter(item => item.기관명 === filters.기관);
  }

  // 게시판별 필터링
  if (filters.게시판 && filters.게시판.trim()) {
    filtered = filtered.filter(item => item.게시판 === filters.게시판);
  }

  // 날짜 범위 필터링
  if (filters.시작일) {
    const startDate = new Date(filters.시작일);
    filtered = filtered.filter(item => {
      try {
        return new Date(item.작성일) >= startDate;
      } catch {
        return false;
      }
    });
  }

  if (filters.종료일) {
    const endDate = new Date(filters.종료일);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(item => {
      try {
        return new Date(item.작성일) <= endDate;
      } catch {
        return false;
      }
    });
  }

  // 검색어 필터링
  if (filters.검색어 && filters.검색어.trim()) {
    const searchQuery = filters.검색어.toLowerCase();
    filtered = filtered.filter(item =>
      item.제목.toLowerCase().includes(searchQuery) ||
      item.기관명.toLowerCase().includes(searchQuery)
    );
  }

  // 정렬 (기본: 최신순)
  filtered.sort((a, b) => {
    try {
      return new Date(b.작성일).getTime() - new Date(a.작성일).getTime();
    } catch {
      return 0;
    }
  });

  // 페이지네이션 (하지만 API 응답에서 처리할 예정)
  const page = (filters as any).페이지 || 1;
  const pageSize = (filters as any).페이지크기 || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return filtered.slice(startIndex, endIndex);
}

/**
 * 데이터 정렬
 * @param data - 정렬할 데이터
 * @param sortType - 정렬 타입
 * @returns 정렬된 데이터
 */
export function sortData(
  data: CrawlingData[],
  sortType: 'date' | 'views' | 'relevance'
): CrawlingData[] {
  const sorted = [...data];

  switch (sortType) {
    case 'date':
      sorted.sort((a, b) => {
        try {
          return new Date(b.작성일).getTime() - new Date(a.작성일).getTime();
        } catch {
          return 0;
        }
      });
      break;

    case 'views':
      // 조회수 정렬 (미구현)
      break;

    case 'relevance':
      // 기본 정렬 유지
      break;
  }

  return sorted;
}

/**
 * 필터링된 데이터의 총 페이지 수 계산
 * @param totalCount - 전체 데이터 수
 * @param pageSize - 페이지 크기
 * @returns 총 페이지 수
 */
export function getTotalPages(totalCount: number, pageSize: number = 20): number {
  return Math.ceil(totalCount / pageSize);
}

/**
 * 사용 가능한 기관 목록 추출
 * @param data - 크롤링 데이터
 * @returns 기관 목록
 */
export function getOrganizations(data: CrawlingData[]): string[] {
  const orgs = new Set(data.map(item => item.기관명).filter(Boolean));
  return Array.from(orgs).sort();
}

/**
 * 사용 가능한 게시판 목록 추출
 * @param data - 크롤링 데이터
 * @param 기관 - 특정 기관 (선택사항)
 * @returns 게시판 목록
 */
export function getBoards(data: CrawlingData[], 기관?: string): string[] {
  const filtered = 기관 ? data.filter(item => item.기관명 === 기관) : data;
  const boards = new Set(filtered.map(item => item.게시판).filter(Boolean));
  return Array.from(boards).sort();
}

/**
 * 페이지네이션 정보 계산
 * @param totalCount - 전체 데이터 수
 * @param page - 현재 페이지
 * @param pageSize - 페이지 크기
 * @returns 페이지네이션 정보
 */
export function getPaginationInfo(totalCount: number, page: number, pageSize: number) {
  const totalPages = getTotalPages(totalCount, pageSize);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  return {
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    displayText: `${startIndex + 1}-${endIndex} / ${totalCount}`,
  };
}
