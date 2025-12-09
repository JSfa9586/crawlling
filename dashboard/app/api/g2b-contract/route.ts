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


        // 필터가 있으면 더 많은 데이터를 가져와서 클라이언트 필터링
        const hasFilter = contractName || orgName;
        const fetchRows = hasFilter ? '1000' : numOfRows;

        // API 요청 파라미터 구성
        const params = new URLSearchParams({
            serviceKey: API_KEY,
            pageNo: hasFilter ? '1' : page,  // 필터 시 첫 페이지부터
            numOfRows: fetchRows,
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

        let items = body.items || [];
        // items가 배열이 아닌 경우 (item 속성이 있는 객체인 경우)
        if (!Array.isArray(items) && items.item) {
            items = Array.isArray(items.item) ? items.item : [items.item];
        }
        // items 자체가 단일 객체인 경우
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

        // 필터 사용 시 클라이언트 페이지네이션
        const rowsPerPage = parseInt(numOfRows);
        const pageNum = parseInt(page);
        let resultItems = mappedItems;
        let resultTotalCount = hasFilter ? mappedItems.length : totalCount;
        let resultTotalPages = Math.ceil(resultTotalCount / rowsPerPage);

        if (hasFilter) {
            // 필터된 결과를 페이지네이션
            const startIdx = (pageNum - 1) * rowsPerPage;
            resultItems = mappedItems.slice(startIdx, startIdx + rowsPerPage);
        }

        return NextResponse.json({
            success: true,
            data: resultItems,
            pagination: {
                page: pageNum,
                numOfRows: rowsPerPage,
                totalCount: resultTotalCount,
                totalPages: resultTotalPages
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
