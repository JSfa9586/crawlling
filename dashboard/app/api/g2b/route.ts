import { NextRequest, NextResponse } from 'next/server';
import { getSpreadsheetData } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'bids';

    try {
        let sheetName: string;

        switch (type) {
            case 'pre_specs':
                sheetName = '나라장터_사전규격';
                break;
            case 'bids':
                sheetName = '나라장터_입찰공고';
                break;
            case 'combined':
                sheetName = '나라장터';
                break;
            default:
                sheetName = '나라장터_입찰공고';
        }

        // 기존 googleSheets 라이브러리 사용
        const rows = await getSpreadsheetData(sheetName);

        if (!rows || rows.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                count: 0,
                type,
            });
        }

        // 헤더와 데이터 분리
        const headers = rows[0] as string[];
        const data = rows.slice(1).map(row => {
            const item: Record<string, string> = {};
            headers.forEach((header, index) => {
                const cellValue = (row as string[])[index];
                item[header] = cellValue || '';
            });
            return item;
        });

        return NextResponse.json({
            success: true,
            data,
            count: data.length,
            type,
        });
    } catch (error) {
        console.error('G2B API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch G2B data' },
            { status: 500 }
        );
    }
}
