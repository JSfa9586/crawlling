import { NextRequest, NextResponse } from 'next/server';
import { listFiles, uploadFile, deleteFile } from '@/lib/googleDrive';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');

    if (!folderId) {
        return NextResponse.json({ success: false, error: 'Folder ID is required' }, { status: 400 });
    }

    try {
        const files = await listFiles(folderId);
        return NextResponse.json({ success: true, data: files });
    } catch (error) {
        console.error('Drive API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch files' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;

        if (!file || !folderId) {
            return NextResponse.json({ success: false, error: 'File and Folder ID are required' }, { status: 400 });
        }

        const uploadedFile = await uploadFile(folderId, file);
        return NextResponse.json({ success: true, data: uploadedFile });
    } catch (error) {
        console.error('Drive Upload Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return NextResponse.json({ success: false, error: 'File ID is required' }, { status: 400 });
    }

    try {
        await deleteFile(fileId);
        return NextResponse.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Drive Delete Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
    }
}
