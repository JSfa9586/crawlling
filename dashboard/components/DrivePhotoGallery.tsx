'use client';

import { useState } from 'react';
import { DriveFile } from '@/lib/googleDrive';

interface DrivePhotoGalleryProps {
    files: DriveFile[];
    onDelete?: (fileId: string) => void;
}

export function DrivePhotoGallery({ files, onDelete }: DrivePhotoGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<DriveFile | null>(null);

    if (files.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                등록된 사진이 없습니다.
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                    <div key={file.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Thumbnail */}
                        {file.thumbnailLink ? (
                            <img
                                src={file.thumbnailLink.replace('=s220', '=s400')} // Request larger thumbnail
                                alt={file.name}
                                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                onClick={() => setSelectedImage(file)}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Preview';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-4xl">🖼️</span>
                            </div>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedImage(file)}
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 shadow-sm"
                                    title="크게 보기"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </button>
                                <a
                                    href={file.webContentLink}
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-green-600 shadow-sm"
                                    title="다운로드"
                                    download
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('정말 삭제하시겠습니까?')) {
                                                onDelete(file.id);
                                            }
                                        }}
                                        className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                                        title="삭제"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs truncate">{file.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full max-h-screen flex flex-col items-center">
                        <img
                            src={selectedImage.webContentLink?.replace('&export=download', '')} // Try to get viewable link
                            alt={selectedImage.name}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-4 text-white text-center">
                            <h3 className="text-xl font-medium mb-2">{selectedImage.name}</h3>
                            <a
                                href={selectedImage.webContentLink}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                원본 다운로드
                            </a>
                        </div>
                        <button
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
