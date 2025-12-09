'use client';

import { useState } from 'react';

interface ContractItem {
    contractNo: string;
    contractName: string;
    contractAmount: number;
    totalAmount: number;
    contractDate: string;
    contractPeriod: string;
    orderOrgName: string;
    demandOrgName: string;
    noticeNo: string;
    requestNo: string;
    startDate: string;
    completeDate: string;
    jointContract: string;
    contractMethod: string;
    detailUrl: string;
}

export default function ContractRealtime() {
    const [items, setItems] = useState<ContractItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // 검색 조건
    const currentDate = new Date();
    const defaultStartDate = new Date(currentDate);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    const [startDate, setStartDate] = useState(defaultStartDate.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(currentDate.toISOString().split('T')[0]);
    const [contractName, setContractName] = useState('');
    const [orgName, setOrgName] = useState('');

    // 페이지네이션
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 20;

    const handleSearch = async (pageNum = 1) => {
        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                page: pageNum.toString(),
                numOfRows: itemsPerPage.toString()
            });
            if (contractName) params.append('contractName', contractName);
            if (orgName) params.append('orgName', orgName);

            const res = await fetch(`/api/g2b-contract?${params.toString()}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || '조회 실패');
            }

            setItems(data.data);
            setTotalCount(data.pagination.totalCount);
            setTotalPages(data.pagination.totalPages);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        // 20241125 형식
        if (dateStr.length >= 8 && !dateStr.includes('-')) {
            return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
        return dateStr;
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">계약정보 실시간 조회</h2>
            <p className="text-sm text-gray-600 mb-4">
                나라장터 API를 직접 호출하여 최신 계약정보를 조회합니다.
            </p>

            {/* 검색 조건 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input
                            type="date"
                            className="border p-2 rounded text-gray-800 w-full"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input
                            type="date"
                            className="border p-2 rounded text-gray-800 w-full"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">계약명</label>
                        <input
                            type="text"
                            placeholder="계약명 검색..."
                            className="border p-2 rounded text-gray-800 w-full"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">기관명</label>
                        <input
                            type="text"
                            placeholder="발주/수요기관 검색..."
                            className="border p-2 rounded text-gray-800 w-full"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={() => handleSearch(1)}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? '조회중...' : '조회'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {hasSearched && !loading && (
                <div className="text-sm text-gray-600 mb-2">
                    검색결과: {totalCount.toLocaleString()}건
                </div>
            )}

            {/* 결과 테이블 */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border p-2 text-left text-gray-700 text-sm">계약일</th>
                            <th className="border p-2 text-left text-gray-700 text-sm">계약명</th>
                            <th className="border p-2 text-left text-gray-700 text-sm">발주기관</th>
                            <th className="border p-2 text-right text-gray-700 text-sm">계약금액</th>
                            <th className="border p-2 text-center text-gray-700 text-sm">공동</th>
                            <th className="border p-2 text-left text-gray-700 text-sm">계약기간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!hasSearched && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    검색 조건을 입력하고 조회 버튼을 클릭하세요.
                                </td>
                            </tr>
                        )}
                        {hasSearched && items.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap">
                                    {formatDate(item.contractDate)}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm">
                                    {item.detailUrl ? (
                                        <a
                                            href={item.detailUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {item.contractName}
                                        </a>
                                    ) : (
                                        item.contractName
                                    )}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm">
                                    {item.orderOrgName}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm text-right whitespace-nowrap">
                                    {formatAmount(item.contractAmount)}
                                </td>
                                <td className="border p-2 text-center">
                                    {item.jointContract === 'Y' ? (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">공동</span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">단독</span>
                                    )}
                                </td>
                                <td className="border p-2 text-gray-600 text-sm whitespace-nowrap">
                                    {item.contractPeriod || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        onClick={() => handleSearch(1)}
                        disabled={page === 1 || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        «
                    </button>
                    <button
                        onClick={() => handleSearch(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        ‹
                    </button>
                    <span className="px-4 py-1 text-gray-700">
                        {page} / {totalPages} 페이지
                    </span>
                    <button
                        onClick={() => handleSearch(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        ›
                    </button>
                    <button
                        onClick={() => handleSearch(totalPages)}
                        disabled={page === totalPages || loading}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
}
