
import { NextRequest, NextResponse } from 'next/server';

const G2B_API_KEY = process.env.G2B_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pageNo = searchParams.get('pageNo') || '1';

    console.log('[API Debug] Env Key Present:', !!G2B_API_KEY);

    if (!keyword || !startDate || !endDate) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // G2B Standard Contract API URL
    // Using getCntrctInfoListServc + bsnsDivCd=5 for Service contracts only
    // API keyword search (prdctNm/cntrctNm) is unreliable, so we filter client-side
    const apiUrl = `http://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc`;

    const effectiveKey = G2B_API_KEY || "YFo89aWj6GcQ681F1E2wVyCGfASK4n0v4IMcaBpOrad0H6vkZsVqq2teDBi0umOLnKoMpE%2FmQLxG5XmvzCSqdQ%3D%3D";

    // Fetch more results to filter client-side (100 per page, filter to ~20)
    const queryParams = new URLSearchParams({
        numOfRows: '100', // Fetch more for client-side filtering
        pageNo: pageNo,
        type: 'json',
        inqryDiv: '1', // Date-based (most reliable)
        inqryBgnDt: startDate.replace(/-/g, '') + '0000',
        inqryEndDt: endDate.replace(/-/g, '') + '2359',
        bsnsDivCd: '5' // Service contracts only
    });

    try {
        const fullUrl = `${apiUrl}?${queryParams.toString()}&serviceKey=${effectiveKey}`;
        console.log(`[API Call] Fetching: ${fullUrl.substring(0, 200)}...`);

        const response = await fetch(fullUrl);
        const textData = await response.text();

        console.log(`[API Response] Status: ${response.status}, Body Preview: ${textData.substring(0, 300)}`);

        if (!response.ok) {
            console.error(`[API Error] HTTP Status: ${response.status}`);
            throw new Error(`G2B API responded with status: ${response.status}`);
        }

        let data;
        try {
            data = JSON.parse(textData);
        } catch (e) {
            console.error('[API Error] JSON Parse Failed.', textData);
            return NextResponse.json({ error: 'External API returned invalid JSON' }, { status: 502 });
        }

        if (data.response?.header?.resultCode !== '00') {
            const errorMsg = data.response?.header?.resultMsg;
            console.warn(`[API Logic Error] ResultCode: ${data.response?.header?.resultCode}, Msg: ${errorMsg}`);
        }

        // Extract items from API response
        const rawItems = data.response?.body?.items;
        let items: any[] = [];

        if (Array.isArray(rawItems)) {
            items = rawItems;
        } else if (rawItems?.item) {
            items = Array.isArray(rawItems.item) ? rawItems.item : [rawItems.item];
        }

        // CLIENT-SIDE KEYWORD FILTERING
        // Filter items where cntrctNm or prdctNm includes the search keyword
        const keywordLower = keyword.toLowerCase();
        const filteredItems = items.filter((item: any) => {
            const contractName = (item.cntrctNm || '').toLowerCase();
            const productName = (item.prdctNm || '').toLowerCase();
            return contractName.includes(keywordLower) || productName.includes(keywordLower);
        });

        console.log(`[Filter] Total API items: ${items.length}, After keyword filter: ${filteredItems.length}`);

        // Map to frontend fields
        const transformedItems = filteredItems.slice(0, 20).map((item: any) => ({ // Limit to 20
            cntrctNm: item.cntrctNm || item.prdctNm || '계약명 없음',
            cntrctAmt: item.thtmCntrctAmt || item.cntrctAmt,
            orderInsttNm: item.cntrctInsttNm || item.ntceInsttNm,
            cntrctCnclsDt: item.cntrctCnclsDate ? item.cntrctCnclsDate : (item.cntrctDate || ''),
            link: item.cntrctDtlInfoUrl
        }));

        const finalData = {
            response: {
                body: {
                    items: {
                        item: transformedItems
                    },
                    totalCount: filteredItems.length, // Filtered count
                    pageNo: data.response?.body?.pageNo,
                    numOfRows: transformedItems.length
                }
            }
        };

        return NextResponse.json(finalData);

    } catch (error) {
        console.error('Error fetching from G2B:', error);
        return NextResponse.json({ error: 'Failed to fetch contract data' }, { status: 500 });
    }
}

