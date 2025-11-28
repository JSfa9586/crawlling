import { google } from 'googleapis';
import { logger } from './logger';
import { Readable } from 'stream';

// Google Drive API 클라이언트 초기화
export async function getDriveClient() {
    // 1. OAuth 2.0 (User Account) - Preferred for uploads (Quota belongs to user)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth: oauth2Client });
    }

    // 2. Service Account (Fallback) - Good for reads, bad for uploads (No quota)
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJson) {
        throw new Error('GOOGLE_CREDENTIALS_JSON or OAuth credentials are not set');
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

// 파일 업로드 (서버 경유)
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

// 폴더 생성
export async function createFolder(folderName: string, parentId: string): Promise<DriveFile> {
    const drive = await getDriveClient();
    const timer = logger.startTimer();

    try {
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, mimeType, webViewLink, webContentLink, createdTime',
        });

        const duration = timer();
        logger.info('Folder created in Drive', { parentId, folderId: response.data.id, duration });

        return response.data as DriveFile;
    } catch (error) {
        const duration = timer();
        logger.error('Failed to create folder in Drive', error instanceof Error ? error : new Error(String(error)), { parentId, duration });
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

// 리저머블 업로드 URL 생성
export async function getResumableUploadUrl(folderId: string, fileName: string, mimeType: string): Promise<string> {
    const drive = await getDriveClient();
    const auth = drive.context._options.auth as any;
    const token = await auth.getAccessToken();

    const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType,
    };

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });

    if (!response.ok) {
        throw new Error(`Failed to initiate upload: ${response.statusText}`);
    }

    const location = response.headers.get('Location');
    if (!location) {
        throw new Error('No upload location returned');
    }

    return location;
}
