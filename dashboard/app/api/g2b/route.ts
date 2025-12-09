import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { G2BData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'bids';

    // 필터 파라미터 추출
    const term = searchParams.get('term') || '';
    const agency = searchParams.get('agency') || '전체';
    const category = searchParams.get('category') || '전체';
    const days = parseInt(searchParams.get('days') || '999', 10);
    const priceMin = parseInt(searchParams.get('price_min') || '0', 10);
    const priceMax = parseInt(searchParams.get('price_max') || '0', 10);
    const limitParams = parseInt(searchParams.get('limit') || '2000', 10);

    // 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    // ISO String format (KST adjustment roughly or just UTC date part)
    // Supabase date comparison works with ISO string
    const startDateStr = startDate.toISOString();

    try {
        if (type === 'stats') {
            // 통계 데이터 조회
            // 1. 모니터링 실행 시간 (g2b_crawler_status)
            const { data: statusData } = await supabase
                .from('g2b_crawler_status')
                .select('last_run_at')
                .eq('service_name', 'g2b_crawler')
                .single();

            // 2. 신규 게시물 시간 (사전규격/입찰공고 중 가장 최신)
            const { data: latestPre } = await supabase
                .from('g2b_pre_specs')
                .select('reg_date')
                .order('reg_date', { ascending: false })
                .limit(1)
                .single();

            const { data: latestBid } = await supabase
                .from('g2b_bids')
                .select('notice_date')
                .order('notice_date', { ascending: false })
                .limit(1)
                .single();

            // 최신 날짜 비교
            let latestTime = '';
            const preTime = latestPre?.reg_date ? new Date(latestPre.reg_date).getTime() : 0;
            const bidTime = latestBid?.notice_date ? new Date(latestBid.notice_date).getTime() : 0;

            if (preTime > bidTime && latestPre?.reg_date) {
                latestTime = latestPre.reg_date;
            } else if (latestBid?.notice_date) {
                latestTime = latestBid.notice_date;
            }

            return NextResponse.json({
                success: true,
                data: {
                    lastExecutionTime: statusData?.last_run_at || '',
                    latestCrawlTime: latestTime
                }
            });
        }

        let query;
        let dateColumn = '';

        if (type === 'pre_specs') {
            query = supabase.from('g2b_pre_specs').select('*', { count: 'exact' });
            dateColumn = 'reg_date';
        } else if (type === 'bids') {
            query = supabase.from('g2b_bids').select('*', { count: 'exact' });
            dateColumn = 'notice_date';
        } else {
            return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
        }


        // 1. 날짜 필터
        if (days !== 999) {
            query = query.gte(dateColumn, startDateStr);
        }

        // 2. 검색어 필터 (공고명 or 발주기관)
        if (term) {
            // 다중 검색어 지원 (comma separated) -> OR 조건
            const keywords = term.split(',').map(t => t.trim()).filter(t => t);
            if (keywords.length > 0) {
                // 각 키워드에 대해 title 또는 publisher가 일치하는 조건 생성
                // 예: term="A,B" -> "title.ilike.%A%,publisher.ilike.%A%,title.ilike.%B%,publisher.ilike.%B%"
                const conditions = keywords.map(k => `title.ilike.%${k}%,publisher.ilike.%${k}%`).join(',');
                query = query.or(conditions);
            }
        }

        // 3. 발주기관 필터
        if (agency !== '전체') {
            if (agency.includes(',')) {
                // 다중 키워드 지원 (예: "수자원공사,K-water")
                // Supabase .or() syntax: "publisher.ilike.%A%,publisher.ilike.%B%"
                const conditions = agency.split(',').map(k => `publisher.ilike.%${k.trim()}%`).join(',');
                query = query.or(conditions);
            } else {
                query = query.ilike('publisher', `%${agency}%`);
            }
        }

        // 4. 카테고리 필터
        if (category !== '전체') {
            query = query.eq('category', category);
        }

        // 5. 정렬 및 제한 (Hard limit for search pool)
        // User 요청: 1000건 정도만 보이게 함.
        const searchLimit = limitParams || 1000;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('per_page') || '20', 10);

        const { data, error, count } = await query
            .order(dateColumn, { ascending: false })
            .limit(searchLimit);

        if (error) throw error;

        // 데이터 포맷팅
        let formattedData = data.map((item: any) => {
            if (type === 'pre_specs') {
                return {
                    구분: '사전규격',
                    카테고리: item.category,
                    등록번호: item.reg_no,
                    공고명: item.title,
                    발주기관: item.publisher,
                    수요기관: item.demand_org,
                    배정예산: item.budget,
                    등록일: item.reg_date,
                    규격공개종료일: item.end_date,
                    상태: item.status,
                    링크: item.link
                } as G2BData;
            } else {
                return {
                    구분: '입찰공고',
                    카테고리: item.category,
                    공고번호: item.bid_no,
                    공고차수: item.bid_seq,
                    공고명: item.title,
                    발주기관: item.publisher,
                    수요기관: item.demand_org,
                    추정가격: item.est_price,
                    기초금액: item.base_price,
                    입찰방식: item.method,
                    공고일: item.notice_date,
                    입찰마감: item.bid_end_date,
                    개찰일: item.open_date,
                    상태: item.status,
                    링크: item.link
                } as G2BData;
            }
        });

        // 6. 가격 필터 (메모리 필터링)
        // DB 컬럼이 string('50,000,000원')일 가능성이 높아 SQL 크기비교 불가.
        if (priceMin > 0 || priceMax > 0) {
            formattedData = formattedData.filter((item: any) => {
                let priceStr = type === 'pre_specs' ? item.배정예산 : (item.추정가격 || item.기초금액);
                if (!priceStr) return false;
                // 숫자만 추출
                const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
                if (isNaN(price)) return false;

                if (priceMax > 0 && price >= priceMax) return false;
                if (priceMin > 0 && price < priceMin) return false;
                return true;
            });
        }

        // 7. 페이지네이션 (Slice)
        const totalItems = formattedData.length;
        const startIdx = (page - 1) * perPage;
        const endIdx = startIdx + perPage;
        const paginatedData = formattedData.slice(startIdx, endIdx);

        // API 응답: count는 DB 전체 개수(DB 필터 적용 시)를 우선 사용하고, 
        // 메모리 필터(가격)가 적용된 경우에는 어쩔 수 없이 totalItems(limit 내 개수) 사용.
        // 하지만 사용자는 "전체 DB 검색" 느낌을 원하므로, 가격 필터가 없을 땐 count를 그대로 보냄.
        const effectiveTotalCount = (priceMin > 0 || priceMax > 0) ? totalItems : (count || totalItems);

        return NextResponse.json({
            success: true,
            count: effectiveTotalCount,
            data: paginatedData,
            type
        });

    } catch (error) {
        console.error('G2B API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch G2B data' }, { status: 500 });
    }
}
