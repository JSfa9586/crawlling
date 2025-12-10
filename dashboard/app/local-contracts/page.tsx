"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Partner {
    partner_name: string;
    partner_type: string;
    share_ratio: number;
}

interface Contract {
    contract_no: string;              // 대표 계약번호
    contract_nos: string[];           // 모든 계약번호 (그룹화된 경우)
    contract_name: string;
    product_name: string;
    contract_amount: number;          // 금차년도 계약금액
    total_contract_amount: number;    // 총 용역금액
    contract_date: string;
    start_date: string;               // 착수일
    current_complete_date: string;    // 현재 완수일
    total_complete_date: string;      // 총 완수일
    order_org_name: string;
    contractor_name: string;
    detail_url: string;               // 대표 URL
    detail_urls: string[];            // 모든 URL
    duplicate_count: number;          // 동일 계약 수
    partner_count: number;
    partners: Partner[];
}

interface ApiResponse {
    success: boolean;
    data: Contract[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
    };
}

// 금액 프리셋 정의
const AMOUNT_PRESETS = [
    { label: '전체', min: 0, max: 0 },
    { label: '1억 미만', min: 0, max: 100000000 },
    { label: '1~5억', min: 100000000, max: 500000000 },
    { label: '5~10억', min: 500000000, max: 1000000000 },
    { label: '10억 이상', min: 1000000000, max: 0 },
];

export default function LocalContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // 년도 필터 상태
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [startYear, setStartYear] = useState<number>(currentYear);
    const [endYear, setEndYear] = useState<number>(currentYear);
    const [startMonth, setStartMonth] = useState<number>(1);
    const [endMonth, setEndMonth] = useState<number>(currentMonth);

    // 금액 필터 상태
    const [amountPreset, setAmountPreset] = useState(0); // 인덱스

    // 년도 옵션 생성 (2005년부터 현재까지)
    const yearOptions = useMemo(() => {
        const years: number[] = [];
        for (let y = currentYear; y >= 2005; y--) {
            years.push(y);
        }
        return years;
    }, [currentYear]);

    // 월 옵션 (1~12)
    const monthOptions = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });

            if (keyword) params.append('keyword', keyword);
            if (startYear) params.append('startYear', startYear.toString());
            if (endYear) params.append('endYear', endYear.toString());
            if (startMonth) params.append('startMonth', startMonth.toString());
            if (endMonth) params.append('endMonth', endMonth.toString());

            // 금액 프리셋 적용
            const preset = AMOUNT_PRESETS[amountPreset];
            if (preset.min > 0) params.append('minAmount', preset.min.toString());
            if (preset.max > 0) params.append('maxAmount', preset.max.toString());

            const response = await fetch(`/api/local-contracts?${params}`);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setContracts(data.data);
                setTotalCount(data.pagination.totalCount);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch contracts:', error);
        } finally {
            setLoading(false);
        }
    };

    // 필터 변경 시 자동 검색
    useEffect(() => {
        fetchContracts();
    }, [page, keyword, startYear, endYear, startMonth, endMonth, amountPreset]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setKeyword(searchInput);
    };

    const handleReset = () => {
        setSearchInput('');
        setKeyword('');
        setStartYear(currentYear);
        setEndYear(currentYear);
        setStartMonth(1);
        setEndMonth(currentMonth);
        setAmountPreset(0);
        setPage(1);
    };

    const formatAmount = (amount: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            // 1970년이거나 유효하지 않은 날짜인 경우
            if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '-';
            return date.toLocaleDateString('ko-KR');
        } catch {
            return '-';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">용역 계약 검색</h1>
                            <p className="mt-2 text-gray-600">
                                로컬 DB 저장 데이터: 총 {totalCount.toLocaleString()}건
                            </p>
                        </div>
                        <Link href="/g2b" className="text-primary-600 hover:text-primary-700 font-medium">
                            ← 나라장터로 돌아가기
                        </Link>
                    </div>
                </div>

                {/* 검색 폼 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="계약명, 업체명, 발주기관명으로 검색..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            검색
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            초기화
                        </button>
                    </form>

                    {/* 필터 영역 */}
                    <div className="flex flex-wrap gap-4 items-center border-t pt-4">
                        {/* 년월 필터 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">기간:</span>
                            <select
                                value={startYear}
                                onChange={(e) => {
                                    const newStartYear = parseInt(e.target.value);
                                    setStartYear(newStartYear);
                                    if (newStartYear > endYear) {
                                        setEndYear(newStartYear);
                                    }
                                    setPage(1);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={startMonth}
                                onChange={(e) => {
                                    setStartMonth(parseInt(e.target.value));
                                    setPage(1);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {monthOptions.map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                            <span className="text-gray-500">~</span>
                            <select
                                value={endYear}
                                onChange={(e) => {
                                    const newEndYear = parseInt(e.target.value);
                                    setEndYear(newEndYear);
                                    if (newEndYear < startYear) {
                                        setStartYear(newEndYear);
                                    }
                                    setPage(1);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={endMonth}
                                onChange={(e) => {
                                    setEndMonth(parseInt(e.target.value));
                                    setPage(1);
                                }}
                                className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {monthOptions.map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                        </div>

                        {/* 금액 프리셋 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">금액:</span>
                            <div className="flex gap-1 flex-wrap">
                                {AMOUNT_PRESETS.map((preset, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => { setAmountPreset(index); setPage(1); }}
                                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${amountPreset === index
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 검색 결과 요약 */}
                    <div className="mt-3 text-sm text-gray-600">
                        검색결과: <span className="font-semibold text-primary-600">{totalCount.toLocaleString()}건</span>
                        {keyword && <> (검색어: "{keyword}")</>}
                        {' '}| {startYear}.{startMonth}~{endYear}.{endMonth} | {AMOUNT_PRESETS[amountPreset].label}
                    </div>
                </div>

                {/* 계약 목록 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            로딩 중...
                        </div>
                    ) : contracts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {contracts.map((contract) => {
                                // 완수일수 계산
                                const calculateDays = (start: string, end: string) => {
                                    if (!start || !end) return null;
                                    const startDate = new Date(start);
                                    const endDate = new Date(end);
                                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
                                    const diffTime = endDate.getTime() - startDate.getTime();
                                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                };
                                const completeDays = calculateDays(contract.start_date, contract.total_complete_date);

                                return (
                                    <div
                                        key={contract.contract_no}
                                        className="hover:bg-gray-50 cursor-pointer p-4"
                                        onClick={() => setSelectedContract(contract)}
                                    >
                                        {/* 1줄: 기본 정보 */}
                                        <div className="flex items-start gap-4 mb-2">
                                            <div className="text-sm text-gray-500 whitespace-nowrap w-[80px]">
                                                {formatDate(contract.contract_date)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {contract.detail_url ? (
                                                    <a
                                                        href={contract.detail_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline font-medium"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {contract.contract_name}
                                                    </a>
                                                ) : (
                                                    <span className="font-medium text-gray-900">{contract.contract_name}</span>
                                                )}
                                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                                    {contract.duplicate_count > 1 ? (
                                                        <>
                                                            <span className="text-orange-500 font-medium">
                                                                동일계약 {contract.duplicate_count}건
                                                            </span>
                                                            <span className="text-gray-300">|</span>
                                                            {contract.contract_nos?.slice(0, 3).map((no, idx) => (
                                                                <a
                                                                    key={no}
                                                                    href={contract.detail_urls?.[idx] || '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-blue-500"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {no.slice(-8)}
                                                                </a>
                                                            ))}
                                                            {contract.contract_nos?.length > 3 && <span>...</span>}
                                                        </>
                                                    ) : (
                                                        <span>계약번호: {contract.contract_no}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">
                                                    {formatAmount(contract.total_contract_amount || contract.contract_amount)}
                                                </div>
                                                {contract.total_contract_amount && contract.total_contract_amount !== contract.contract_amount && (
                                                    <div className="text-xs text-gray-500">
                                                        금차: {formatAmount(contract.contract_amount)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2줄: 상세 정보 */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 ml-[80px] pl-4 border-l-2 border-gray-200">
                                            <span className="truncate max-w-[150px]" title={contract.order_org_name}>
                                                📍 {contract.order_org_name}
                                            </span>
                                            {contract.start_date && (
                                                <span>
                                                    착수: {formatDate(contract.start_date)}
                                                </span>
                                            )}
                                            {contract.total_complete_date && (
                                                <span>
                                                    완료: {formatDate(contract.total_complete_date)}
                                                </span>
                                            )}
                                            {completeDays && completeDays > 0 && (
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                    {completeDays}일
                                                </span>
                                            )}
                                            {parseInt(contract.partner_count as any) > 1 ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    공동 {contract.partner_count}사
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">단독</span>
                                            )}
                                            {/* 공동수급체 이름과 지분율 표시 */}
                                            {contract.partners && contract.partners.length > 0 && (
                                                <span className="text-gray-600">
                                                    | {contract.partners.map(p =>
                                                        `${p.partner_name}${p.share_ratio ? ` ${p.share_ratio}%` : ''}`
                                                    ).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="px-4 py-4 bg-gray-50 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                페이지 {page} / {totalPages} ({totalCount.toLocaleString()}건)
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    이전
                                </button>
                                {/* 페이지 번호들 */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`px-3 py-1 border rounded ${page === pageNum ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 공동수급체 상세 모달 */}
                {selectedContract && parseInt(selectedContract.partner_count as any) > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedContract(null)}>
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">공동수급체 지분율</h3>
                                    <button onClick={() => setSelectedContract(null)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">계약명</p>
                                    <p className="font-medium text-gray-900">{selectedContract.contract_name}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">계약금액</p>
                                    <p className="font-medium text-gray-900">
                                        {formatAmount(selectedContract.total_contract_amount || selectedContract.contract_amount)}
                                        {selectedContract.total_contract_amount && selectedContract.total_contract_amount !== selectedContract.contract_amount && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                (금차: {formatAmount(selectedContract.contract_amount)})
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">참여업체 ({selectedContract.partners.length}사)</p>
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 text-sm font-medium text-gray-500">업체명</th>
                                                <th className="text-left py-2 text-sm font-medium text-gray-500">유형</th>
                                                <th className="text-right py-2 text-sm font-medium text-gray-500">지분율</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedContract.partners.map((partner, idx) => (
                                                <tr key={idx} className="border-b last:border-0">
                                                    <td className="py-3 text-gray-900 font-medium">{partner.partner_name}</td>
                                                    <td className="py-3 text-gray-600 text-sm">{partner.partner_type}</td>
                                                    <td className="py-3 text-right">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                            {partner.share_ratio ? `${partner.share_ratio}%` : '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
