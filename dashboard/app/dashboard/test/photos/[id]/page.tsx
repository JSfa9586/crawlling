'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { DrivePhotoGallery } from '@/components/DrivePhotoGallery';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DriveFile } from '@/lib/googleDrive';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function PhotoAlbumPostPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const folderId = params.id as string;
    const folderName = searchParams.get('name') || '앨범 상세';

    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/drive?folderId=${folderId}`);
            const result = await response.json();

            if (result.success) {
                // 이미지 파일만 필터링
                const imageFiles = (result.data as DriveFile[]).filter(file =>
                    file.mimeType.startsWith('image/')
                );
                setFiles(imageFiles);
            } else {
                throw new Error(result.error || 'Failed to fetch files');
            }
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('사진 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [folderId]);

    useEffect(() => {
        if (folderId) {
            fetchFiles();
        }
    }, [folderId, fetchFiles]);

    const handleDelete = async (fileId: string) => {
        try {
            const response = await fetch(`/api/drive?fileId=${fileId}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (result.success) {
                await fetchFiles(); // Refresh list
            } else {
                throw new Error(result.error || 'Failed to delete file');
            }
        } catch (err) {
            console.error('Error deleting file:', err);
            alert('파일 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Link href="/dashboard/test" className="hover:text-blue-600">테스트 섹션</Link>
                    <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/dashboard/test/photos" className="hover:text-blue-600">테스트 포토</Link>
                    <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-900 truncate max-w-[200px]">{folderName}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{folderName}</h1>
            </div>

            <div className="space-y-8">
                {/* 업로드 섹션 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">사진 추가</h2>
                    <FileUploader
                        folderId={folderId}
                        onUploadSuccess={fetchFiles}
                        acceptedFileTypes="image/*"
                    />
                </section>

                {/* 사진 목록 섹션 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">사진 갤러리 ({files.length})</h2>
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    ) : (
                        <DrivePhotoGallery files={files} onDelete={handleDelete} />
                    )}
                </section>
            </div>
        </div>
    );
}
