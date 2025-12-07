
import { NextRequest, NextResponse } from 'next/server';

const G2B_API_KEY = process.env.G2B_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pageNo = searchParams.get('pageNo') || '1';

    // Log for debugging
    console.log('[API Debug] Env Key Present:', !!G2B_API_KEY);

    if (!keyword || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // G2B Standard Contract Search API URL
    const apiUrl = `http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc`;
    // Note: Standard API uses 'prdctNm' for keyword search in many cases, or 'cntrctNm'.
    // Debug showed 'prdctNm' works well.

    // Use fallback key if env var is missing (Encoded Key) typically used in Korean Open APIs
    const effectiveKey = G2B_API_KEY || "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE%2FmQLxG5XmvzCSqdQ%3D%3D";

    // Construct params WITHOUT serviceKey to avoid double encoding if key is already encoded
    const queryParams = new URLSearchParams({
        numOfRows: '20',
        pageNo: pageNo,
        type: 'json',
        inqryDiv: '1', // Date
        inqryBgnDt: startDate.replace(/-/g, '') + '0000',
        inqryEndDt: endDate.replace(/-/g, '') + '2359',
        prdctNm: keyword // Keyword (Product Name Search)
    });

    try {
        // Manually append encoded serviceKey
        const fullUrl = `${apiUrl}?${queryParams.toString()}&serviceKey=${effectiveKey}`;
        console.log(`[API Call] Fetching: ${fullUrl}`);

        const response = await fetch(fullUrl);
        const textData = await response.text();

        console.log(`[API Response] Status: ${response.status}, Body Preview: ${textData.substring(0, 500)}`);

        if (!response.ok) {
            console.error(`[API Error] HTTP Status: ${response.status}`);
            throw new Error(`G2B API responded with status: ${response.status}`);
        }

        let data;
        try {
            data = JSON.parse(textData);
        } catch (e) {
            console.error('[API Error] JSON Parse Failed. Response might be XML.', textData);
            return NextResponse.json({ error: 'External API returned invalid JSON (likely XML Error)' }, { status: 502 });
        }

        // Check for logical API error
        if (data.response?.header?.resultCode !== '00') {
            const errorMsg = data.response?.header?.resultMsg;
            console.warn(`[API Logic Error] ResultCode: ${data.response?.header?.resultCode}, Msg: ${errorMsg}`);
            // If No Results, data might be empty or specific code.
        }

        // Transform Data to match frontend "Contract" interface
        const rawItems = data.response?.body?.items;
        let items: any[] = [];

        if (Array.isArray(rawItems)) {
            items = rawItems;
        } else if (rawItems?.item) {
            items = Array.isArray(rawItems.item) ? rawItems.item : [rawItems.item];
        }

        // Map Standard Contract API fields to Frontend fields
        const transformedItems = items.map((item: any) => ({
            cntrctNm: item.cntrctNm || item.prdctNm || '계약명 없음',
            cntrctAmt: item.thtmCntrctAmt || item.cntrctAmt,
            orderInsttNm: item.cntrctInsttNm || item.ntceInsttNm,
            cntrctCnclsDt: item.cntrctCnclsDate ? item.cntrctCnclsDate : (item.cntrctDate || ''),
            // Use the native URL provided by the API which matches user request format
            // e.g., https://www.g2b.go.kr/link/FIUA027_01/single/?ctrtNo=...
            link: item.cntrctDtlInfoUrl
        }));

        // Wrap response structure
        const finalData = {
            response: {
                body: {
                    items: {
                        item: transformedItems
                    },
                    totalCount: data.response?.body?.totalCount,
                    pageNo: data.response?.body?.pageNo,
                    numOfRows: data.response?.body?.numOfRows
                }
            }
        };

        return NextResponse.json(finalData);

    } catch (error) {
        console.error('Error fetching from G2B:', error);
        return NextResponse.json({ error: 'Failed to fetch contract data' }, { status: 500 });
    }
}
