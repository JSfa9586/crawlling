import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetData, transformRowsToData } from '@/lib/googleSheets';

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

    // 시트 이름 결정
    const sheetName = type === 'pre_specs' ? '나라장터_사전규격' : '나라장터_입찰공고';

    try {
        // Google Sheets에서 데이터 조회
        const rows = await getSpreadsheetData(sheetName);

        if (rows.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                data: [],
                type,
                source: 'google_sheets'
            });
        }

        // 데이터 변환
        let data = transformRowsToData(rows);

        // 날짜 필터링
        if (days !== 999) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            const dateColumn = type === 'pre_specs' ? '등록일' : '공고일';
            data = data.filter((item: any) => {
                const dateStr = item[dateColumn];
                if (!dateStr) return false;
                const itemDate = new Date(dateStr.split(' ')[0]);
                return itemDate >= startDate;
            });
        }

        // 검색어 필터 (공고명 or 발주기관)
        if (term) {
            const keywords = term.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
            if (keywords.length > 0) {
                data = data.filter((item: any) => {
                    const title = (item['공고명'] || '').toLowerCase();
                    const publisher = (item['발주기관'] || '').toLowerCase();
                    return keywords.some(k => title.includes(k) || publisher.includes(k));
                });
            }
        }

        // 발주기관 필터
        if (agency !== '전체') {
            const agencyKeywords = agency.split(',').map(k => k.trim().toLowerCase());
            data = data.filter((item: any) => {
                const publisher = (item['발주기관'] || '').toLowerCase();
                return agencyKeywords.some(k => publisher.includes(k));
            });
        }

        // 카테고리 필터
        if (category !== '전체') {
            data = data.filter((item: any) => item['카테고리'] === category);
        }

        // 데이터 포맷팅 (기존 UI 호환)
        let formattedData = data.map((item: any) => {
            if (type === 'pre_specs') {
                return {
                    구분: '사전규격',
                    카테고리: item['카테고리'] || '',
                    등록번호: item['등록번호'] || '',
                    공고명: item['공고명'] || '',
                    발주기관: item['발주기관'] || '',
                    수요기관: item['수요기관'] || '',
                    배정예산: item['배정예산'] || '',
                    등록일: item['등록일'] || '',
                    규격공개종료일: item['규격공개종료일'] || '',
                    상태: item['상태'] || '신규',
                    링크: item['링크'] || ''
                };
            } else {
                return {
                    구분: '입찰공고',
                    카테고리: item['카테고리'] || '',
                    공고번호: item['공고번호'] || '',
                    공고차수: item['공고차수'] || '00',
                    공고명: item['공고명'] || '',
                    발주기관: item['발주기관'] || '',
                    수요기관: item['수요기관'] || '',
                    추정가격: item['추정가격'] || '',
                    기초금액: item['기초금액'] || '',
                    입찰방식: item['입찰방식'] || '',
                    공고일: item['공고일'] || '',
                    입찰마감: item['입찰마감'] || '',
                    개찰일: item['개찰일'] || '',
                    상태: item['상태'] || '신규',
                    링크: item['링크'] || ''
                };
            }
        });

        // 가격 필터 (메모리 필터링)
        if (priceMin > 0 || priceMax > 0) {
            formattedData = formattedData.filter((item: any) => {
                let priceStr = type === 'pre_specs' ? item.배정예산 : (item.추정가격 || item.기초금액);
                if (!priceStr) return false;
                const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
                if (isNaN(price)) return false;

                if (priceMax > 0 && price >= priceMax) return false;
                if (priceMin > 0 && price < priceMin) return false;
                return true;
            });
        }

        // 날짜순 정렬 (최신순)
        const sortColumn = type === 'pre_specs' ? '등록일' : '공고일';
        formattedData.sort((a: any, b: any) => {
            const dateA = new Date(a[sortColumn] || '1970-01-01');
            const dateB = new Date(b[sortColumn] || '1970-01-01');
            return dateB.getTime() - dateA.getTime();
        });

        // 개수 제한
        if (formattedData.length > limitParams) {
            formattedData = formattedData.slice(0, limitParams);
        }

        return NextResponse.json({
            success: true,
            count: formattedData.length,
            data: formattedData,
            type,
            source: 'google_sheets'
        });

    } catch (error) {
        console.error('G2B API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch G2B data from Google Sheets',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
