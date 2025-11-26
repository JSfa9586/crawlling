'use client';

import { useState } from 'react';
import type { CrawlingData } from '@/types';

interface DataTableProps {
  data: CrawlingData[];
  isLoading?: boolean;
  onRowClick?: (row: CrawlingData) => void;
}

export function DataTable({
  data,
  isLoading = false,
  onRowClick,
}: DataTableProps) {
  const [sortField, setSortField] = useState<keyof CrawlingData>('작성일');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

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
              기관명 {sortField === '기관명' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th
              className="w-[15%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-primary-100"
              onClick={() => toggleSort('게시판')}
            >
              게시판 {sortField === '게시판' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th className="w-[55%] px-2 md:px-4 py-3 text-left text-sm font-semibold text-gray-700">
              제목
            </th>
            <th
              className="w-[15%] px-2 md:px-4 py-3 text-center md:text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-primary-100"
              onClick={() => toggleSort('작성일')}
            >
              작성일 {sortField === '작성일' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const date = new Date(row.작성일);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => onRowClick?.(row)}
              >
                <td className="px-2 md:px-4 py-3 text-sm text-gray-900 truncate" title={row.기관명}>
                  {row.기관명}
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
                <td className="px-2 md:px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center md:text-left">
                  {/* 데스크탑 뷰: YYYY. MM. DD. */}
                  <div className="hidden md:block">
                    {`${year}. ${month}. ${day}.`}
                  </div>
                  {/* 모바일 뷰: 연도와 월/일 분리 */}
                  <div className="md:hidden flex flex-col items-center leading-tight">
                    <span className="text-[10px] text-gray-400">{year}</span>
                    <span className="font-medium text-gray-700">{`${month}.${day}`}</span>
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