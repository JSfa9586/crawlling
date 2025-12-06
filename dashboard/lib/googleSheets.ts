import { logger } from './logger';

/**
 * Google Sheets API를 통해 스프레드시트 데이터를 조회합니다.
 * @returns 스프레드시트의 모든 데이터 (행 배열)
 */
export async function getSpreadsheetData(sheetName: string = '크롤링 결과'): Promise<string[][]> {
  const timer = logger.startTimer();

  try {
    // 환경 변수 검증
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!credentialsJson) {
      throw new Error('GOOGLE_CREDENTIALS_JSON environment variable is not set');
    }

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable is not set');
    }

    // Node.js 환경에서만 googleapis 사용
    const { google } = require('googleapis');

    // Credentials 파싱
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (error) {
      throw new Error(`Invalid GOOGLE_CREDENTIALS_JSON format: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Google Auth 설정
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Sheets API 클라이언트 생성
    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    logger.info('Fetching spreadsheet data', {
      spreadsheetId: spreadsheetId.substring(0, 20) + '...',
      sheetName,
    });

    // 데이터 조회 (A:G 범위)
    // 시트 이름에 공백이나 특수문자가 있을 수 있으므로 작은따옴표로 감쌈
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!A:Z`,
    });

    const duration = timer();
    const values = response.data.values || [];

    logger.info('Spreadsheet data retrieved', {
      rowCount: values.length,
      duration,
    });

    return values;
  } catch (error) {
    const duration = timer();
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error('Failed to fetch spreadsheet data', err, {
      duration,
    });

    throw err;
  }
}

/**
 * 여러 행을 데이터 배열로 변환합니다. (헤더 기반 동적 매핑)
 * @param rows - 스프레드시트의 모든 행 (2D 배열)
 * @param skipHeader - 첫 행을 헤더로 스킵할지 여부 (기본값: true)
 * @returns 변환된 데이터 배열
 */
export function transformRowsToData(rows: string[][], skipHeader = true): any[] {
  if (rows.length === 0) return [];

  const headers = rows[0];
  const startIndex = skipHeader ? 1 : 0;

  // 헤더 인덱스 매핑
  const mapIndex = {
    기관구분: headers.indexOf('기관구분'),
    기관명: headers.indexOf('기관명') !== -1 ? headers.indexOf('기관명') : headers.indexOf('기관'),
    게시판: headers.indexOf('게시판') !== -1 ? headers.indexOf('게시판') : headers.indexOf('구분'),
    제목: headers.indexOf('제목'),
    작성일: headers.indexOf('작성일') !== -1 ? headers.indexOf('작성일') : headers.indexOf('등록일'),
    링크: headers.indexOf('링크'),
    수집일시: headers.indexOf('수집일시') !== -1 ? headers.indexOf('수집일시') : headers.indexOf('수집일'),
    내용: headers.indexOf('내용'),
    기간: headers.indexOf('기간'),
  };

  return rows.slice(startIndex).map((row) => ({
    기관구분: mapIndex.기관구분 !== -1 ? row[mapIndex.기관구분] : null,
    기관명: mapIndex.기관명 !== -1 ? row[mapIndex.기관명] : null,
    게시판: mapIndex.게시판 !== -1 ? row[mapIndex.게시판] : null,
    제목: mapIndex.제목 !== -1 ? row[mapIndex.제목] : null,
    작성일: mapIndex.작성일 !== -1 ? row[mapIndex.작성일] : null,
    링크: mapIndex.링크 !== -1 ? row[mapIndex.링크] : null,
    수집일시: mapIndex.수집일시 !== -1 ? row[mapIndex.수집일시] : null,
    내용: mapIndex.내용 !== -1 ? row[mapIndex.내용] : null,
    기간: mapIndex.기간 !== -1 ? row[mapIndex.기간] : null,
  }));
}

/**
 * 스프레드시트의 헤더를 추출합니다.
 * @param rows - 스프레드시트의 모든 행 (2D 배열)
 * @returns 헤더 배열
 */
export function extractHeaders(rows: string[][]): string[] {
  if (rows.length === 0) return [];
  return rows[0];
}

/**
 * 데이터 유효성을 검사합니다.
 * @param data - 검사할 데이터
 * @returns 유효성 여부
 */
export function validateData(data: any): boolean {
  if (!data) return false;

  // 필수 필드 확인
  const requiredFields = ['제목', '링크'];
  const hasRequiredFields = requiredFields.every(field => data[field]);

  return hasRequiredFields;
}

/**
 * 메타데이터 시트에서 크롤링 실행 시간을 조회합니다.
 * @returns 마지막 크롤링 실행 시간 (없으면 빈 문자열)
 */
export async function getLastExecutionTime(): Promise<string> {
  const timer = logger.startTimer();

  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!credentialsJson || !spreadsheetId) {
      return '';
    }

    const { google } = require('googleapis');
    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({
      version: 'v4',
      auth,
    });

    logger.info('Fetching metadata from Metadata sheet');

    // Metadata 시트에서 데이터 조회
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Metadata!A:B',
    });

    const duration = timer();
    const values = response.data.values || [];

    // '마지막_크롤링_실행시간' 찾기
    for (const row of values) {
      if (row[0] === '마지막_크롤링_실행시간' && row[1]) {
        logger.info('Last execution time found', {
          time: row[1],
          duration,
        });
        return row[1];
      }
    }

    logger.warn('Last execution time not found', { duration });
    return '';

  } catch (error) {
    const duration = timer();
    const err = error instanceof Error ? error : new Error(String(error));

    logger.warn('Failed to fetch last execution time', {
      duration,
      error: err.message,
    });

    return '';
  }
}
