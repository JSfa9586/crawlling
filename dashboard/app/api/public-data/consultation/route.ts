import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '10';
    const jrsdSeaOfcNm = searchParams.get('jrsdSeaOfcNm') || '';
    const bsnsNm = searchParams.get('bsnsNm') || '';

    const apiKey = process.env.PUBLIC_DATA_API_KEY || process.env.G2B_API_KEY;

    // [수정됨] 해역이용협의 -> getOceansSeaareaImpactInfo (가이드 문서 extraction 기반)
    // 참고: read_docx.py 분석 결과 해역이용협의 문서에 ImpactInfo Endpoint가 포함되어 있었음.
    // Base URL: http://apis.data.go.kr/1192000/service/OceansUseInfoService <-- 서비스명도 확인 필요하나 우선 ImpactInfoService로 추정
    // 그러나 1192000/service/OceansUseInfoService/getOceansSeaareaImpactInfo 일 수도 있음.
    // 안전하게 문서에서 추출된 Endpoint Pattern을 따르되, Service Name은 기존 추측(UseInfo) 또는 ImpactInfo.
    // 1192000 코드는 해양수산부.
    // 보통 getOceansSeaareaImpactInfo의 서비스는 OceansSeaareaImpactInfoService 일 가능성 높음.
    // 하지만 문서 1(협의)에서 ImpactInfo가 나왔다면..
    // 일단 'OceansUseInfoService' (해역이용정보서비스) 하위에 'getOceansSeaareaImpactInfo'가 있을 수 있음.

    // Endpoint: getOceansSeaareaImpactInfo
    // ServiceName 추정: OceansUseInfoService (기존) -> 실패시 OceansSeaareaImpactInfoService 시도
    // 여기서는 우선 OceansUseInfoService 하위에 있다고 가정하고 Endpoint만 변경.
    // 만약 이것도 404라면 Service Name을 변경해야 함.

    // 가이드 문서의 예시 URL을 직접 볼 수 없어 추정하지만,
    // 통상적으로 getOceansSeaareaImpactInfo 라면 OceansSeaareaImpactInfoService 일 확률이 높음.
    // 그러나 파일 1(협의)의 이름이 '해역이용협의' 이므로 'OceansUseInfoService'가 맞을 수도 있음 (Utilization).

    // Let's try: http://apis.data.go.kr/1192000/service/OceansUseInfoService/getOceansSeaareaImpactInfo
    const baseUrl = 'http://apis.data.go.kr/1192000/service/OceansUseInfoService/getOceansSeaareaImpactInfo';

    const queryString = `serviceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=JSON` +
        (jrsdSeaOfcNm ? `&jrsdSeaOfcNm=${encodeURIComponent(jrsdSeaOfcNm)}` : '') +
        (bsnsNm ? `&bsnsNm=${encodeURIComponent(bsnsNm)}` : '');

    const url = `${baseUrl}?${queryString}`;

    console.log(`[Proxy] Fetching Consultation: ${url}`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            console.error(`[Proxy] API Error: ${res.status} ${text}`);
            return NextResponse.json({ error: 'API Error', details: text }, { status: res.status });
        }

        const text = await res.text();
        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (e) {
            console.error(`[Proxy] JSON Parse Error: ${text}`);
            return NextResponse.json({ error: 'Data Format Error', raw: text }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
