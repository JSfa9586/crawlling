"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Partner {
    partner_name: string;
    partner_type: string;
    share_ratio: number;
}

interface Contract {
    contract_no: string;
    contract_name: string;
    product_name: string;
    contract_amount: number;
    contract_date: string;
    order_org_name: string;
    contractor_name: string;
    detail_url: string;
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

export default function LocalContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(keyword && { keyword })
            });
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

    useEffect(() => {
        fetchContracts();
    }, [page, keyword]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setKeyword(searchInput);
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
                    <form onSubmit={handleSearch} className="flex gap-4">
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
                        {keyword && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(''); setKeyword(''); setPage(1); }}
                                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                초기화
                            </button>
                        )}
                    </form>
                    {keyword && (
                        <p className="mt-3 text-sm text-gray-600">
                            검색어: <span className="font-semibold text-primary-600">"{keyword}"</span> ({totalCount.toLocaleString()}건)
                        </p>
                    )}
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[90px]">계약일</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약명</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">발주기관</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">계약업체</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px]">계약금액</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">공동</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contracts.map((contract) => (
                                        <tr
                                            key={contract.contract_no}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setSelectedContract(contract)}
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(contract.contract_date)}
                                            </td>
                                            <td className="px-3 py-3 text-sm text-gray-900">
                                                <div title={contract.contract_name}>
                                                    {contract.detail_url ? (
                                                        <a
                                                            href={contract.detail_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {contract.contract_name}
                                                        </a>
                                                    ) : (
                                                        contract.contract_name
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-gray-500">
                                                <div className="truncate" title={contract.order_org_name}>
                                                    {contract.order_org_name}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                                                <div className="truncate" title={contract.contractor_name}>
                                                    {contract.contractor_name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatAmount(contract.contract_amount)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                {parseInt(contract.partner_count as any) > 1 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {contract.partner_count}사
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">단독</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                    <p className="font-medium text-gray-900">{formatAmount(selectedContract.contract_amount)}</p>
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
