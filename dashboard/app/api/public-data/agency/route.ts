import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '10';
    const sggNm = searchParams.get('sggNm') || ''; // 시군구명
    const sidoNm = searchParams.get('sidoNm') || ''; // 시도명
    const cmpnyNm = searchParams.get('cmpnyNm') || ''; // 회사명

    // 환경변수에서 API 키 가져오기 (G2B 키 재사용 또는 별도 키)
    const apiKey = process.env.G2B_API_KEY;

    // Base URL (추정) - 문서에서 확인된 부분
    // http://apis.data.go.kr/1192000/service/OceansAgncyService/getOceansAgncyInfo
    const baseUrl = 'http://apis.data.go.kr/1192000/service/OceansAgncyService/getOceansAgncyInfo';

    const queryParams = new URLSearchParams();
    queryParams.append('serviceKey', apiKey || ''); // encoding된 키를 그대로 보내는 경우가 많음. requests는 다름.
    // Next.js fetch는 serviceKey를 자동으로 인코딩하지 않으므로 명시적으로 처리 필요.
    // 공공데이터포털은 "Encoding된 키"를 파라미터로 요구하는 경우가 많음.

    queryParams.append('pageNo', pageNo);
    queryParams.append('numOfRows', numOfRows);
    queryParams.append('resultType', 'JSON');
    if (sggNm) queryParams.append('sggNm', sggNm);
    if (sidoNm) queryParams.append('sidoNm', sidoNm);
    if (cmpnyNm) queryParams.append('cmpnyNm', cmpnyNm);

    // serviceKey는 이미 인코딩 되어있다고 가정하고 쿼리 스트링을 수동 조립하거나
    // URLSearchParams는 자동으로 인코딩하므로, Decoding된 키를 넣어야 함.
    // 환경변수에 저장된 키가 Encoding된 상태라면(함수 내에서 %가 있음), 이를 그대로 쓰려면 수동 조립 필요.

    // 안전한 방법: 수동 조립
    const queryString = `serviceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=JSON` +
        (sggNm ? `&sggNm=${encodeURIComponent(sggNm)}` : '') +
        (sidoNm ? `&sidoNm=${encodeURIComponent(sidoNm)}` : '') +
        (cmpnyNm ? `&cmpnyNm=${encodeURIComponent(cmpnyNm)}` : '');

    const url = `${baseUrl}?${queryString}`;

    console.log(`[Proxy] Fetching: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            // XML 에러일 수도 있음
            const text = await res.text();
            console.error(`[Proxy] API Error: ${res.status} ${text}`);
            return NextResponse.json({ error: 'API Error', details: text }, { status: res.status });
        }

        // JSON 파싱 시도
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            // XML로 왔을 경우 (에러 메시지 등)
            console.error(`[Proxy] JSON Parse Error. Response might be XML: ${text}`);
            return NextResponse.json({ error: 'Data Format Error', raw: text }, { status: 500 });
        }

    } catch (error) {
        console.error(`[Proxy] Network Error:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
