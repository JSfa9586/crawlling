'use client';

import { DriveFile } from '@/lib/googleDrive';

interface DriveFileListProps {
    files: DriveFile[];
    onDelete?: (fileId: string) => void;
}

export function DriveFileList({ files, onDelete }: DriveFileListProps) {
    const formatSize = (bytes?: string) => {
        if (!bytes) return '-';
        const size = parseInt(bytes);
        if (size < 1024) return size + ' B';
        if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
        if (mimeType.includes('image')) return '🖼️';
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
        return '📁';
    };

    if (files.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                등록된 파일이 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                    <li key={file.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                                <span className="text-2xl mr-4">{getFileIcon(file.mimeType)}</span>
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={file.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                                    >
                                        {file.name}
                                    </a>
                                    <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                                        <span>{formatSize(file.size)}</span>
                                        <span>{formatDate(file.createdTime)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 ml-4">
                                <a
                                    href={file.webContentLink}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="다운로드"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                                {onDelete && (
                                    <button
                                        onClick={() => onDelete(file.id)}
                                        className="text-red-400 hover:text-red-600"
                                        title="삭제"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
