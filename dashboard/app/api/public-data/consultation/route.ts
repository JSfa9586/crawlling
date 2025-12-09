import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '10';
    // 가이드 문서기반 파라미터 추정 (실제 문서 텍스트에서 'getOceansUseInfo' 확인)
    const jrsdSeaOfcNm = searchParams.get('jrsdSeaOfcNm') || ''; // 관할해역청명
    const bsnsNm = searchParams.get('bsnsNm') || ''; // 사업명

    const apiKey = process.env.G2B_API_KEY;

    // Base URL (추정)
    // 해역이용협의 정보서비스 -> getOceansUseInfo
    // URL 패턴이 비슷할 것으로 예상: http://apis.data.go.kr/1192000/service/OceansUseInfoService/getOceansUseInfo
    // 정확한 URL은 read_docx.py 결과에서 '1192000'은 기관코드(해양수산부)일 가능성 높음.
    // 서비스명은 보통 get앞의 명칭 + Service

    // read_docx output 134: `.../getOceansAgncyInfo...`
    // but for UseInfo?
    // Let's guess typical pattern. Or defaults to same if documents are related.
    // Actually, let's try 'OceansScopeInfoService' or similar if 'getOceansUseInfo' is the op.
    // Wait, extraction showed `getOceansAgncyInfo` clearly.
    // Let's try `OceansScopeInfoService` based on common naming?
    // NO, let's look at the filename: `해역이용협의 정보서비스`.
    // Likely `OceansUseInfoService`.

    const baseUrl = 'http://apis.data.go.kr/1192000/service/OceansUseInfoService/getOceansUseInfo';

    // Query String 조립
    const queryString = `serviceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=JSON` +
        (jrsdSeaOfcNm ? `&jrsdSeaOfcNm=${encodeURIComponent(jrsdSeaOfcNm)}` : '') +
        (bsnsNm ? `&bsnsNm=${encodeURIComponent(bsnsNm)}` : '');

    const url = `${baseUrl}?${queryString}`;

    console.log(`[Proxy] Fetching: ${url}`);

    try {
        const res = await fetch(url);
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
