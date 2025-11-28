'use client';

import Link from 'next/link';
import type { CrawlingData } from '@/types';

interface RecentPostsProps {
    title: string;
    data: CrawlingData[];
    moreLink: string;
    isLoading?: boolean;
    icon?: string;
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}

export function RecentPosts({
    title,
    data,
    moreLink,
    isLoading = false,
    icon,
    color = 'primary',
}: RecentPostsProps) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-700 border-primary-200',
        secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full flex flex-col">
            <div className={`px-6 py-4 border-b flex justify-between items-center ${colorClasses[color]}`}>
                <div className="flex items-center gap-2">
                    {icon && <span className="text-xl">{icon}</span>}
                    <h2 className="text-lg font-bold">{title}</h2>
                </div>
                <Link
                    href={moreLink}
                    className="text-sm font-medium hover:underline opacity-80 hover:opacity-100 transition-opacity"
                >
                    더보기 →
                </Link>
            </div>

            <div className="flex-1 p-0">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2"></div>
                        <p className="text-sm">로딩 중...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        게시물이 없습니다.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {data.slice(0, 5).map((item, index) => (
                            <li key={index} className="hover:bg-gray-50 transition-colors">
                                <a
                                    href={item.링크}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-6 py-3"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                                            {item.게시판 || '공지'}
                                        </span>
                                        <span className="text-xs text-gray-400 shrink-0">
                                            {item.작성일}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1" title={item.제목}>
                                        {item.제목}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {item.기관명}
                                    </p>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
