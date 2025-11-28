'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { DriveFileList } from '@/components/DriveFileList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DriveFile } from '@/lib/googleDrive';
import Link from 'next/link';

const FOLDER_ID = '1gTw5DvpUshR0isvelgDWnAPkvE58NwPa';

export default function ReferenceRoomPage() {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/drive?folderId=${FOLDER_ID}`);
            const result = await response.json();

            if (result.success) {
                setFiles(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch files');
            }
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('파일 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleDelete = async (fileId: string) => {
        if (!confirm('정말 이 파일을 삭제하시겠습니까?')) return;

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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Link href="/dashboard/test" className="hover:text-blue-600">테스트 섹션</Link>
                        <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-gray-900">테스트 자료실</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">테스트 자료실</h1>
                    <p className="mt-2 text-gray-600">파일을 업로드하고 관리하는 공간입니다.</p>
                </div>
                <button
                    onClick={fetchFiles}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="새로고침"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="space-y-8">
                {/* 업로드 섹션 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">파일 업로드</h2>
                    <FileUploader
                        folderId={FOLDER_ID}
                        onUploadSuccess={fetchFiles}
                    />
                </section>

                {/* 파일 목록 섹션 */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">파일 목록 ({files.length})</h2>
                    {isLoading ? (
                        <div className="py-12 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    ) : (
                        <DriveFileList files={files} onDelete={handleDelete} />
                    )}
                </section>
            </div>
        </div>
    );
}
