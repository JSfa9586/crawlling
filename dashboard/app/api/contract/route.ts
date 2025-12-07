
import { NextRequest, NextResponse } from 'next/server';

const G2B_API_KEY = process.env.G2B_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pageNo = searchParams.get('pageNo') || '1';

    if (!G2B_API_KEY) {
        return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
    }

    if (!keyword || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // G2B API URL construction
    const apiUrl = `http://apis.data.go.kr/1230000/ao/CntrcInfoService/getCntrctInfoListServcPPSSrch`;

    // Construct params
    // 'inqryDiv' = 1 (Contract Date based)
    // 'cntrctNm' (Contract Name based search)
    const queryParams = new URLSearchParams({
        serviceKey: G2B_API_KEY,
        numOfRows: '10',
        pageNo: pageNo,
        type: 'json',
        inqryDiv: '1',
        inqryBgnDt: startDate.replace(/-/g, ''),
        inqryEndDt: endDate.replace(/-/g, ''),
        cntrctNm: keyword
    });

    try {
        const response = await fetch(`${apiUrl}?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`G2B API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Check for logical API error (G2B returns 200 even for errors sometimes)
        if (data.response?.header?.resultCode !== '00') {
            const errorMsg = data.response?.header?.resultMsg;
            if (data.response?.header?.resultCode) {
                console.warn(`G2B API Logic Error: ${errorMsg}`, data.response.header);
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching from G2B:', error);
        return NextResponse.json({ error: 'Failed to fetch contract data' }, { status: 500 });
    }
}
