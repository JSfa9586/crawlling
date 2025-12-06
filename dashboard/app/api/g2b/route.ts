import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Sheets 인증
async function getGoogleSheetsClient() {
    const credentials = JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'
    );

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
}

// 나라장터 데이터 가져오기
async function getG2BData(sheetName: string) {
    try {
        const sheets = await getGoogleSheetsClient();
        const spreadsheetId = process.env.SPREADSHEET_ID;

        if (!spreadsheetId) {
            throw new Error('SPREADSHEET_ID not configured');
        }

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];

        if (rows.length < 2) {
            return [];
        }

        const headers = rows[0];
        const data = rows.slice(1).map(row => {
            const item: Record<string, string> = {};
            headers.forEach((header: string, index: number) => {
                item[header] = row[index] || '';
            });
            return item;
        });

        return data;
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        return [];
    }
}

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

        const data = await getG2BData(sheetName);

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
