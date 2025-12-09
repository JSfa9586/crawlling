import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '10';
    const bsnsNm = searchParams.get('bsnsNm') || '';
    const acpYear = searchParams.get('acpYear') || ''; // Required from Client

    const apiKey = process.env.PUBLIC_DATA_API_KEY || process.env.G2B_API_KEY;

    // URL: http://apis.data.go.kr/1192000/service/OceansUseService2/getOceansUseInfo2
    const baseUrl = 'http://apis.data.go.kr/1192000/service/OceansUseService2/getOceansUseInfo2';

    if (!acpYear) {
        // Return error if year missing? Or default?
        // Guide says Mandatory.
        // Let's default to 2024 if missing for safety? Or let it fail.
    }

    const queryString = `ServiceKey=${apiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=JSON` +
        (acpYear ? `&ACP_YEAR=${encodeURIComponent(acpYear)}` : '') +
        (bsnsNm ? `&BIZ_NAM=${encodeURIComponent(bsnsNm)}` : '');

    const url = `${baseUrl}?${queryString}`;

    console.log(`[Proxy] Consultation: ${url}`);

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
