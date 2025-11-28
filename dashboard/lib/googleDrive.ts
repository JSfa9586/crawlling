import { google } from 'googleapis';
import { logger } from './logger';
import { Readable } from 'stream';

// Google Drive API 클라이언트 초기화
export async function getDriveClient() {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
        throw new Error('GOOGLE_CREDENTIALS_JSON environment variable is not set');
    }

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    });

    return google.drive({ version: 'v3', auth });
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    webContentLink?: string;
    thumbnailLink?: string;
    createdTime?: string;
    size?: string;
}

// 파일 목록 조회
export async function listFiles(folderId: string): Promise<DriveFile[]> {
    const drive = await getDriveClient();
    const timer = logger.startTimer();

    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, size)',
            orderBy: 'createdTime desc',
            pageSize: 100,
        });

        const duration = timer();
        logger.info('Drive files retrieved', { folderId, count: response.data.files?.length, duration });

        return (response.data.files as DriveFile[]) || [];
    } catch (error) {
        const duration = timer();
        logger.error('Failed to list drive files', error instanceof Error ? error : new Error(String(error)), { folderId, duration });
        throw error;
    }
}

// 파일 업로드
export async function uploadFile(folderId: string, file: File, fileName?: string): Promise<DriveFile> {
    const drive = await getDriveClient();
    const timer = logger.startTimer();

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const fileMetadata = {
            name: fileName || file.name,
            parents: [folderId],
        };

        const media = {
            mimeType: file.type,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, size',
        });

        const duration = timer();
        logger.info('File uploaded to Drive', { folderId, fileId: response.data.id, duration });

        return response.data as DriveFile;
    } catch (error) {
        const duration = timer();
        logger.error('Failed to upload file to Drive', error instanceof Error ? error : new Error(String(error)), { folderId, duration });
        throw error;
    }
}

// 파일 삭제
export async function deleteFile(fileId: string): Promise<void> {
    const drive = await getDriveClient();
    const timer = logger.startTimer();

    try {
        await drive.files.delete({
            fileId: fileId,
        });

        const duration = timer();
        logger.info('File deleted from Drive', { fileId, duration });
    } catch (error) {
        const duration = timer();
        logger.error('Failed to delete file from Drive', error instanceof Error ? error : new Error(String(error)), { fileId, duration });
        throw error;
    }
}
