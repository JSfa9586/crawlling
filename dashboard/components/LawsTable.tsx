'use client';

import { useState } from 'react';
import type { CrawlingData } from '@/types';

interface LawsTableProps {
    data: CrawlingData[];
    isLoading?: boolean;
    onRowClick?: (row: CrawlingData) => void;
}

export function LawsTable({
    data,
    isLoading = false,
    onRowClick,
}: LawsTableProps) {
    const [sortField, setSortField] = useState<keyof CrawlingData>('작성일'); // 작성일 대신 기간이나 수집일시 사용 가능
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const sortedData = [...data].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc'
                ? aVal.localeCompare(bVal, 'ko-KR')
                : bVal.localeCompare(aVal, 'ko-KR');
        }
        return 0;
    });

    const toggleSort = (field: keyof CrawlingData) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">로딩 중...</div>;
    }

    if (data.length === 0) {
        return <div className="text-center py-8 text-gray-500">데이터가 없습니다.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
                <thead className="bg-primary-50 border-b-2 border-primary-200">
                    <tr>
                        <th
                            className="w-[15%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-primary-100"
                            onClick={() => toggleSort('기관명')}
                        >
                            기관 {sortField === '기관명' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                            className="w-[15%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-primary-100"
                            onClick={() => toggleSort('게시판')}
                        >
                            구분 {sortField === '게시판' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="w-[40%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            제목
                        </th>
                        <th className="w-[15%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">
                            내용
                        </th>
                        <th
                            className="w-[15%] px-2 md:px-4 py-3 text-center md:text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-primary-100"
                            onClick={() => toggleSort('기간')}
                        >
                            기간 {sortField === '기간' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => {
                        return (
                            <tr
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                onClick={() => onRowClick?.(row)}
                            >
                                <td className="px-2 md:px-4 py-3 text-sm text-gray-900" title={row.기관명}>
                                    {(() => {
                                        const name = row.기관명;
                                        if (!name) return '-';
                                        const index = name.indexOf('(');
                                        if (index !== -1) {
                                            return (
                                                <div className="flex flex-col leading-tight">
                                                    <span>{name.substring(0, index)}</span>
                                                    <span className="text-xs text-gray-500">{name.substring(index)}</span>
                                                </div>
                                            );
                                        }
                                        return name;
                                    })()}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-gray-600 truncate" title={row.게시판}>
                                    {row.게시판}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-gray-900 font-medium" title={row.제목}>
                                    <div className="overflow-hidden" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: '1.5em',
                                        maxHeight: '3em'
                                    }}>
                                        {row.상태 && (
                                            <span className={`inline-block px-2 py-0.5 mr-2 text-xs font-semibold rounded ${row.상태 === '진행' ? 'bg-blue-100 text-blue-800' :
                                                row.상태 === '마감' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {row.상태}
                                            </span>
                                        )}
                                        <a
                                            href={row.링크}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary-600 hover:underline cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {row.제목}
                                        </a>
                                    </div>
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-gray-600 truncate hidden md:table-cell" title={row.내용}>
                                    {row.내용 || '-'}
                                </td>
                                <td className="px-2 md:px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center md:text-left">
                                    <div className="text-xs" title={row.기간}>
                                        {row.기간 ? (
                                            row.기간.length > 20 ? (
                                                <>
                                                    <div>{row.기간.split('~')[0]}</div>
                                                    <div>~ {row.기간.split('~')[1]}</div>
                                                </>
                                            ) : row.기간
                                        ) : '-'}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
