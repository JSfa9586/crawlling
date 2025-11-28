'use client';

import { useState, useRef } from 'react';
import { getUploadUrlAction, uploadChunkAction } from '@/app/actions';

interface FileUploaderProps {
    folderId: string;
    onUploadSuccess: () => void;
    acceptedFileTypes?: string; // e.g., "image/*" or ".pdf,.doc"
}

export function FileUploader({ folderId, onUploadSuccess, acceptedFileTypes }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await uploadFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFiles(e.target.files);
        }
    };

    const uploadFiles = async (files: FileList) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 1. Get Resumable Upload URL
                const urlResult = await getUploadUrlAction(folderId, file.name, file.type);

                if (!urlResult.success || !urlResult.data?.uploadUrl) {
                    throw new Error(urlResult.error || 'Failed to get upload URL');
                }

                const uploadUrl = urlResult.data.uploadUrl;
                const chunkSize = 2 * 1024 * 1024; // 2MB chunk size (safe for Vercel)
                const totalSize = file.size;
                let start = 0;

                // 2. Upload chunks via Server Action
                while (start < totalSize) {
                    const end = Math.min(start + chunkSize, totalSize);
                    const chunk = file.slice(start, end);

                    const formData = new FormData();
                    formData.append('chunk', chunk);

                    // Content-Range format: bytes start-end/total
                    // Note: end is inclusive in Content-Range, so end-1
                    const contentRange = `bytes ${start}-${end - 1}/${totalSize}`;

                    const chunkResult = await uploadChunkAction(uploadUrl, formData, contentRange);

                    if (!chunkResult.success) {
                        throw new Error(chunkResult.error || 'Failed to upload chunk');
                    }

                    start = end;
                    const percentComplete = Math.round((start / totalSize) * 100);
                    setUploadProgress(percentComplete);
                }
            }

            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                onUploadSuccess();
            }, 500);

        } catch (error) {
            console.error('Upload error:', error);
            setIsUploading(false);
            alert('파일 업로드 중 오류가 발생했습니다.');
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
            />

            {isUploading ? (
                <div className="space-y-3">
                    <div className="text-blue-600 font-medium">업로드 중... {uploadProgress}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="text-4xl mb-2">☁️</div>
                    <p className="text-gray-600 font-medium">
                        파일을 드래그하여 놓거나{' '}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:underline focus:outline-none"
                        >
                            클릭하여 선택
                        </button>
                    </p>
                    <p className="text-xs text-gray-400">
                        {acceptedFileTypes ? `지원 형식: ${acceptedFileTypes}` : '모든 파일 지원'}
                    </p>
                </div>
            )}
        </div>
    );
}
