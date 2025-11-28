'use server';

import { uploadFile } from '@/lib/googleDrive';

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
