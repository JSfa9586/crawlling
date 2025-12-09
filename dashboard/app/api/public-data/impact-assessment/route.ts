import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '10';
    const bsnsNm = searchParams.get('bsnsNm') || '';
    // 영향평가는 보통 사업명, 지역 등이 파라미터.
    // Extraction showed: getOceansUseInfo (from Impact Guide?)
    // If getOceansUseInfo is indeed Impact Assessment (very weird naming but ok per extraction),
    // we use it here.

    const apiKey = process.env.PUBLIC_DATA_API_KEY || process.env.G2B_API_KEY;

    // Endpoint: getOceansUseInfo
    // Service: OceansUseInfoService (High probability)
    const baseUrl = 'http://apis.data.go.kr/1192000/service/OceansUseInfoService/getOceansUseInfo';

    const queryString = `serviceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=JSON` +
        (bsnsNm ? `&bsnsNm=${encodeURIComponent(bsnsNm)}` : '');
    // 추가 파라미터가 있을 수 있으나(sidoNm 등), 우선 사업명 위주로.

    const url = `${baseUrl}?${queryString}`;

    console.log(`[Proxy] Fetching Impact Assessment: ${url}`);

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
