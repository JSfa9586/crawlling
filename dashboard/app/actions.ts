'use server';

import { uploadFile, getResumableUploadUrl } from '@/lib/googleDrive';

export async function uploadFileAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;

        if (!file || !folderId) {
            return { success: false, error: 'File and Folder ID are required' };
        }

        const uploadedFile = await uploadFile(folderId, file);

        // Return a plain object that can be serialized
        return {
            success: true,
            data: {
                id: uploadedFile.id,
                name: uploadedFile.name,
                mimeType: uploadedFile.mimeType,
                webViewLink: uploadedFile.webViewLink,
                thumbnailLink: uploadedFile.thumbnailLink
            }
        };
    } catch (error) {
        console.error('Server Action Upload Error:', error);
        return { success: false, error: 'Failed to upload file' };
    }
}

export async function getUploadUrlAction(folderId: string, fileName: string, mimeType: string) {
    try {
        const uploadUrl = await getResumableUploadUrl(folderId, fileName, mimeType);
        return { success: true, data: { uploadUrl } };
    } catch (error) {
        console.error('Server Action Get Upload URL Error:', error);
        return { success: false, error: 'Failed to get upload URL' };
    }
}

export async function uploadChunkAction(uploadUrl: string, chunkFormData: FormData, contentRange: string) {
    try {
        const chunk = chunkFormData.get('chunk') as Blob;
        if (!chunk) {
            return { success: false, error: 'No chunk data provided' };
        }

        const buffer = Buffer.from(await chunk.arrayBuffer());

        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Length': buffer.length.toString(),
                'Content-Range': contentRange,
            },
            body: buffer,
        });

        // 308 Resume Incomplete is a success status for chunks
        if (response.status === 308) {
            return { success: true, status: 308 };
        }

        // 200/201 Created means upload complete
        if (response.status === 200 || response.status === 201) {
            const data = await response.json();
            return { success: true, status: response.status, data };
        }

        const text = await response.text();
        return { success: false, error: `Upload failed: ${response.status} ${text}` };

    } catch (error) {
        console.error('Server Action Upload Chunk Error:', error);
        return { success: false, error: 'Failed to upload chunk' };
    }
}
