import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'bids';

    try {
        if (type === 'pre_specs') {
            // 사전규격 데이터 조회 (최신 1000건) - 등록일 기준
            const { data, error } = await supabase
                .from('g2b_pre_specs')
                .select('*')
                .order('reg_date', { ascending: false })
                .limit(1000);

            if (error) throw error;

            // 프론트엔드 호환 포맷 매핑
            const formattedData = data.map((item: any) => ({
                구분: '사전규격',
                카테고리: item.category,
                등록번호: item.reg_no,
                공고명: item.title,
                발주기관: item.publisher,
                수요기관: item.demand_org,
                배정예산: item.budget,
                등록일: item.reg_date, // Timestamp format
                규격공개종료일: item.end_date,
                상태: item.status,
                링크: item.link
            }));

            return NextResponse.json({ success: true, count: formattedData.length, data: formattedData, type });

        } else if (type === 'bids') {
            // 입찰공고 데이터 조회 (최신 1000건) - 공고일 기준
            const { data, error } = await supabase
                .from('g2b_bids')
                .select('*')
                .order('notice_date', { ascending: false })
                .limit(1000);

            if (error) throw error;

            const formattedData = data.map((item: any) => ({
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
            }));

            return NextResponse.json({ success: true, count: formattedData.length, data: formattedData, type });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid type parameter' }, { status: 400 });
        }

    } catch (error) {
        console.error('G2B API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch G2B data' }, { status: 500 });
    }
}
