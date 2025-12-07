
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

    // G2B Bid Search API URL (Using Bid API as proxy for Contract Search due to API limitations)
    const apiUrl = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch`;

    // Construct params
    // 'inqryDiv' = 1 (Date based)
    // 'bidNtceNm' = keyword (Bid Name search)
    const queryParams = new URLSearchParams({
        serviceKey: G2B_API_KEY,
        numOfRows: '20', // Increased row count
        pageNo: pageNo,
        type: 'json',
        inqryDiv: '1',
        inqryBgnDt: startDate.replace(/-/g, '') + '0000', // Add HHMM
        inqryEndDt: endDate.replace(/-/g, '') + '2359',   // Add HHMM
        bidNtceNm: keyword
    });

    try {
        // Log the actual URL for debugging (server-side only)
        // console.log(`Fetching: ${apiUrl}?${queryParams.toString()}`);

        const response = await fetch(`${apiUrl}?${queryParams.toString()}`);

        if (!response.ok) {
            throw new Error(`G2B API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Check for logical API error
        if (data.response?.header?.resultCode !== '00') {
            const errorMsg = data.response?.header?.resultMsg;
            if (data.response?.header?.resultCode) {
                console.warn(`G2B API Logic Error: ${errorMsg}`, data.response.header);
            }
        }

        // Transform Data to match frontend "Contract" interface
        // Frontend expects: cntrctNm, cntrctAmt, orderInsttNm, cntrctCnclsDt
        // Bid API provides: bidNtceNm, presmptPrce, ntceInsttNm, bidNtceDt

        const rawItems = data.response?.body?.items;
        let items: any[] = [];

        if (Array.isArray(rawItems)) {
            items = rawItems;
        } else if (rawItems?.item) {
            items = Array.isArray(rawItems.item) ? rawItems.item : [rawItems.item];
        }

        const transformedItems = items.map((item: any) => ({
            cntrctNm: item.bidNtceNm,
            cntrctAmt: item.presmptPrce,
            orderInsttNm: item.ntceInsttNm,
            cntrctCnclsDt: item.bidNtceDt ? item.bidNtceDt.substring(0, 10) : '', // YYYY-MM-DD HH:MM... -> YYYY-MM-DD roughly
            link: item.bidNtceUrl // Optional extra
        }));

        // Replace original items with transformed items in the response structure
        // We do this to keep the "body.totalCount" and structure intact for the frontend
        if (data.response?.body?.items) {
            // Force structure to { item: [...] } to match frontend expectation
            data.response.body.items = { item: transformedItems };
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching from G2B:', error);
        return NextResponse.json({ error: 'Failed to fetch contract data' }, { status: 500 });
    }
}
