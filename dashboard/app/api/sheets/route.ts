import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetData, transformRowsToData, extractHeaders, getLastExecutionTime } from '@/lib/googleSheets';
import { filterData } from '@/lib/filters';
import { logger } from '@/lib/logger';

// ISR 캐싱: 5분마다 자동 재검증
export const revalidate = 300;

/**
 * GET /api/sheets
 * Google Sheets 데이터 조회 API
 *
 * Query Parameters:
 * - type: 'data' (기본) | 'stats' | 'headers'
 * - 기관: 기관명으로 필터링
 * - 게시판: 게시판으로 필터링
 * - 검색어: 제목/기관명으로 검색
 * - 시작일: 작성일 범위 (YYYY-MM-DD)
 * - 종료일: 작성일 범위 (YYYY-MM-DD)
 * - 페이지: 페이지 번호 (기본값: 1)
 * - 페이지크기: 한 페이지 항목 수 (기본값: 20)
 */
export async function GET(request: NextRequest) {
  const timer = logger.startTimer();
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  logger.info('API Request: /api/sheets', {
    method: 'GET',
    query: queryParams,
  });

  try {
    // 데이터 유형 확인
    const type = url.searchParams.get('type') || 'data';
    // 시트 이름 확인 (기본값: '크롤링 결과')
    const sheetName = url.searchParams.get('sheet') || '크롤링 결과';

    // Google Sheets에서 데이터 조회
    const rows = await getSpreadsheetData(sheetName);

    if (rows.length === 0) {
      logger.warn('No data found in spreadsheet');
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 헤더 추출
    const headers = extractHeaders(rows);

    // 타입별 처리
    if (type === 'headers') {
      // 헤더만 반환
      logger.info('Returning headers only');
      return NextResponse.json({
        success: true,
        data: headers,
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'stats') {
      // 통계 정보만 반환
      const data = transformRowsToData(rows);
      const organizations = Array.from(new Set(data.map((d) => d.기관명)));
      const boards = Array.from(new Set(data.map((d) => d.게시판)));

      // 가장 최근 수집일시 찾기 (신규 게시물 수집 시간)
      let latestCrawlTime = '';
      if (data.length > 0 && data[0].수집일시) {
        const crawlTimes = data
          .map((d) => d.수집일시)
          .filter(Boolean)
          .sort()
          .reverse();
        latestCrawlTime = crawlTimes[0] || '';
      }

      // 마지막 크롤링 실행 시간 가져오기
      const lastExecutionTime = await getLastExecutionTime();

      logger.info('Returning statistics');
      return NextResponse.json({
        success: true,
        data: {
          totalCount: data.length,
          organizationCount: organizations.length,
          boardCount: boards.length,
          organizations,
          boards,
          latestCrawlTime, // 신규 게시물 수집 시간
          lastExecutionTime, // 크롤링 실행 시간 추가
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 기본: 필터링된 데이터 반환
    let data = transformRowsToData(rows);

    // 필터링 적용
    const filterOptions = {
      기관: url.searchParams.get('기관') || undefined,
      게시판: url.searchParams.get('게시판') || undefined,
      검색어: url.searchParams.get('검색어') || undefined,
      시작일: url.searchParams.get('시작일') || undefined,
      종료일: url.searchParams.get('종료일') || undefined,
      페이지: parseInt(url.searchParams.get('페이지') || '1', 10),
      페이지크기: parseInt(url.searchParams.get('페이지크기') || '20', 10),
    };

    const filteredData = filterData(data, filterOptions as any);

    const duration = timer();
    logger.info('API Response: /api/sheets', {
      status: 200,
      dataCount: filteredData.length,
      totalCount: data.length,
      duration,
    });

    return NextResponse.json({
      success: true,
      data: filteredData,
      meta: {
        total: data.length,
        count: filteredData.length,
        page: filterOptions.페이지,
        pageSize: filterOptions.페이지크기,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const duration = timer();
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error('API Error: /api/sheets', err, {
      duration,
      statusCode: 500,
    });

    // 환경 변수 오류 확인
    let errorMessage = '데이터 조회 실패';
    let statusCode = 500;

    if (err.message.includes('GOOGLE_CREDENTIALS_JSON')) {
      errorMessage = 'Google 인증 정보가 설정되지 않았습니다.';
      statusCode = 500;
    } else if (err.message.includes('SPREADSHEET_ID')) {
      errorMessage = '스프레드시트 ID가 설정되지 않았습니다.';
      statusCode = 500;
    } else if (err.message.includes('Permission denied')) {
      errorMessage = 'Google Sheets에 접근할 수 없습니다. 권한을 확인하세요.';
      statusCode = 403;
    } else if (err.message.includes('Not Found')) {
      errorMessage = '스프레드시트를 찾을 수 없습니다.';
      statusCode = 404;
    } else if (process.env.NODE_ENV === 'production') {
      errorMessage = '요청 처리 중 오류가 발생했습니다.';
    } else {
      errorMessage = err.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
      },
      { status: statusCode }
    );
  }
}
