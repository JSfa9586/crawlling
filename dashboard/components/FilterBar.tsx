'use client';

import { useState, useMemo, useCallback } from 'react';

interface FilterBarProps {
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  기관?: string;
  게시판?: string;
  시작일?: string;
  종료일?: string;
  검색어?: string;
}

export function FilterBar({ onFilter }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onFilter({});
  };

  // 날짜 프리셋 함수
  const setDatePreset = (days: number) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const newFilters = {
      ...filters,
      시작일: startDate.toISOString().split('T')[0],
      종료일: today.toISOString().split('T')[0],
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  // 게시판 프리셋 함수
  const setBoardPreset = (boardType: string) => {
    const newFilters = { ...filters, 게시판: boardType };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  // 개별 필터 제거 함수
  const removeFilter = useCallback((field: keyof FilterState) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      onFilter(newFilters);
      return newFilters;
    });
  }, [onFilter]);

  // 날짜 범위 필터 제거 (시작일과 종료일을 함께 제거)
  const removeDateRange = useCallback(() => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters.시작일;
      delete newFilters.종료일;
      onFilter(newFilters);
      return newFilters;
    });
  }, [onFilter]);

  // 활성 필터 칩 생성 (useMemo로 최적화)
  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];

    // 기관 필터
    if (filters.기관) {
      chips.push({
        label: `기관: ${filters.기관}`,
        onRemove: () => removeFilter('기관'),
      });
    }

    // 게시판 필터
    if (filters.게시판) {
      chips.push({
        label: `게시판: ${filters.게시판}`,
        onRemove: () => removeFilter('게시판'),
      });
    }

    // 검색어 필터
    if (filters.검색어) {
      chips.push({
        label: `검색어: ${filters.검색어}`,
        onRemove: () => removeFilter('검색어'),
      });
    }

    // 날짜 범위 필터 (시작일과 종료일을 하나의 칩으로)
    if (filters.시작일 && filters.종료일) {
      chips.push({
        label: `${filters.시작일} ~ ${filters.종료일}`,
        onRemove: removeDateRange,
      });
    } else if (filters.시작일) {
      chips.push({
        label: `시작일: ${filters.시작일}`,
        onRemove: () => removeFilter('시작일'),
      });
    } else if (filters.종료일) {
      chips.push({
        label: `종료일: ${filters.종료일}`,
        onRemove: () => removeFilter('종료일'),
      });
    }

    return chips;
  }, [filters, removeFilter, removeDateRange]);
  const hasActiveFilters = activeChips.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🔍 검색 필터</h3>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          ↻ 초기화
        </button>
      </div>

      {/* 필터 입력 필드들 - 컴팩트하게 2줄로 배치 */}
      <div className="space-y-3 mb-4">
        {/* 첫 번째 줄: 기관, 게시판, 검색어 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              기관명
            </label>
            <input
              type="text"
              value={filters.기관 || ''}
              onChange={(e) => handleChange('기관', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 부산지방해양수산청"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              게시판
            </label>
            <input
              type="text"
              value={filters.게시판 || ''}
              onChange={(e) => handleChange('게시판', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 공지사항, 입찰"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              제목 검색
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.검색어 || ''}
                onChange={(e) => handleChange('검색어', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="검색어 입력"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 두 번째 줄: 날짜 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={filters.시작일 || ''}
              onChange={(e) => handleChange('시작일', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={filters.종료일 || ''}
              onChange={(e) => handleChange('종료일', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 활성 필터 칩 영역 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center mt-3 mb-4 pb-4 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">활성 필터:</span>
          {activeChips.map((chip, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-blue-900 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                aria-label={`${chip.label} 필터 제거`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer ml-2"
          >
            모두 지우기
          </button>
        </div>
      )}

      {/* 프리셋 버튼들 - 날짜와 게시판을 한 줄로 */}
      <div className="border-t border-gray-100 pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 날짜 프리셋 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              📅 기간 빠른 선택
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDatePreset(0)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                오늘
              </button>
              <button
                onClick={() => setDatePreset(1)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                어제
              </button>
              <button
                onClick={() => setDatePreset(3)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                3일
              </button>
              <button
                onClick={() => setDatePreset(7)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                7일
              </button>
              <button
                onClick={() => setDatePreset(30)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                1개월
              </button>
              <button
                onClick={() => setDatePreset(90)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
              >
                3개월
              </button>
            </div>
          </div>

          {/* 게시판 프리셋 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              📋 게시판 빠른 선택
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBoardPreset('공지사항')}
                className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium border border-green-200"
              >
                공지사항
              </button>
              <button
                onClick={() => setBoardPreset('입찰')}
                className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium border border-green-200"
              >
                입찰
              </button>

              <button
                onClick={() => setBoardPreset('인사')}
                className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium border border-green-200"
              >
                인사
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
