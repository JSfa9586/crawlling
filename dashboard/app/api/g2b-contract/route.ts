import { NextRequest, NextResponse } from 'next/server';

// G2B 계약정보 API
const API_URL = "https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListServc";
const API_KEY = process.env.G2B_API_KEY || "";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 파라미터 추출
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';
        const contractName = searchParams.get('contractName') || '';
        const orgName = searchParams.get('orgName') || '';
        const page = searchParams.get('page') || '1';
        const numOfRows = searchParams.get('numOfRows') || '20';

        if (!API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'API 키가 설정되지 않았습니다.'
            }, { status: 500 });
        }

        // API 요청 파라미터 구성
        const params = new URLSearchParams({
            serviceKey: API_KEY,
            pageNo: page,
            numOfRows: numOfRows,
            type: 'json',
            inqryDiv: '1',  // 날짜 기반 조회
            bsnsDivCd: '5', // 용역
        });

        // 날짜 조건
        if (startDate) {
            params.append('inqryBgnDt', startDate.replace(/-/g, '') + '0000');
        }
        if (endDate) {
            params.append('inqryEndDt', endDate.replace(/-/g, '') + '2359');
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: `API 요청 실패: ${response.status}`
            }, { status: response.status });
        }

        const data = await response.json();

        // 에러 체크
        if (data['nkoneps.com.response.ResponseError']) {
            const error = data['nkoneps.com.response.ResponseError']['header'];
            return NextResponse.json({
                success: false,
                error: `${error.resultCode} - ${error.resultMsg}`
            });
        }

        const body = data.response?.body || {};
        const totalCount = parseInt(body.totalCount || '0');

        let items = body.items?.item || [];
        if (!Array.isArray(items)) {
            items = items ? [items] : [];
        }

        // 클라이언트 필터링 (계약명, 기관명)
        let filteredItems = items;
        if (contractName) {
            const keyword = contractName.toLowerCase();
            filteredItems = filteredItems.filter((item: any) =>
                item.cntrctNm?.toLowerCase().includes(keyword)
            );
        }
        if (orgName) {
            const keyword = orgName.toLowerCase();
            filteredItems = filteredItems.filter((item: any) =>
                item.cntrctInsttNm?.toLowerCase().includes(keyword) ||
                item.dmndInsttNm?.toLowerCase().includes(keyword)
            );
        }

        // 응답 매핑
        const mappedItems = filteredItems.map((item: any) => ({
            contractNo: item.untyCntrctNo || '',
            contractName: item.cntrctNm || '',
            contractAmount: parseInt(item.thtmCntrctAmt || '0'),
            totalAmount: parseInt(item.totCntrctAmt || '0'),
            contractDate: item.cntrctCnclsDate || item.cntrctDate || '',
            contractPeriod: item.cntrctPrd || '',
            orderOrgName: item.cntrctInsttNm || '',
            demandOrgName: item.dmndInsttNm || '',
            noticeNo: item.ntceNo || '',
            requestNo: item.reqNo || '',
            startDate: item.wbgnDate || '',
            completeDate: item.ttalScmpltDate || '',
            jointContract: item.cmmnCntrctYn || 'N',
            contractMethod: item.cntrctCnclsMthdNm || '',
            detailUrl: item.cntrctDtlInfoUrl || '',
            corpList: item.corpList || '',
        }));

        return NextResponse.json({
            success: true,
            data: mappedItems,
            pagination: {
                page: parseInt(page),
                numOfRows: parseInt(numOfRows),
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / parseInt(numOfRows))
            }
        });

    } catch (error) {
        console.error('API 에러:', error);
        return NextResponse.json({
            success: false,
            error: '서버 오류가 발생했습니다.'
        }, { status: 500 });
    }
}
