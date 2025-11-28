'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DriveFile } from '@/lib/googleDrive';
import Link from 'next/link';

const FOLDER_ID = '1Lj2_fppKOWR0DOwBzlywSy_IzyUfGpKS';

export default function PhotoAlbumPage() {
    const [items, setItems] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const fetchItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/drive?folderId=${FOLDER_ID}`);
            const result = await response.json();

            if (result.success) {
                // 폴더만 필터링 (게시물 = 폴더)
                const folders = (result.data as DriveFile[]).filter(item =>
                    item.mimeType === 'application/vnd.google-apps.folder'
                );
                setItems(folders);
            } else {
                throw new Error(result.error || 'Failed to fetch items');
            }
        } catch (err) {
            console.error('Error fetching items:', err);
            setError('게시물 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            const formData = new FormData();
            formData.append('type', 'folder');
            formData.append('name', newFolderName);
            formData.append('parentId', FOLDER_ID);

            const response = await fetch('/api/drive', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                setNewFolderName('');
                setIsCreating(false);
                fetchItems();
            } else {
                throw new Error(result.error || 'Failed to create folder');
            }
        } catch (err) {
            console.error('Error creating folder:', err);
            alert('게시물 생성에 실패했습니다.');
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
                        <span className="text-gray-900">테스트 포토</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">테스트 포토</h1>
                    <p className="mt-2 text-gray-600">사진을 게시물(폴더) 단위로 관리합니다.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 앨범 만들기
                </button>
            </div>

            {/* 앨범 생성 모달 */}
            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">새 앨범 만들기</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="앨범 제목을 입력하세요"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    생성
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 앨범 목록 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="col-span-full p-4 text-red-600">{error}</div>
                ) : items.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-500">등록된 앨범이 없습니다.</div>
                ) : (
                    items.map((item) => (
                        <Link key={item.id} href={`/dashboard/test/photos/${item.id}?name=${encodeURIComponent(item.name)}`} className="group block">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                                <div className="aspect-video bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <span className="text-4xl">🖼️</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors truncate">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(item.createdTime!).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
