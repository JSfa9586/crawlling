
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ContractItem {
    cntrctNo: string;
    cntrctNm: string;
    orderInsttNm: string; // 발주기관
    dminsttNm: string; // 수요기관 (가끔 발주기관과 다를 수 있음)
    cntrctCnclsDt: string; // 계약일자
    cntrctAmt: string; // 계약금액
    cntrctMthdNm: string; // 계약방법 (수의계약 등)
    // Add other fields as necessary
    detailLink?: string; // URL to detail if available
}

export default function ContractSearchPage() {
    const [keyword, setKeyword] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1); // Default 1 month ago
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [results, setResults] = useState<ContractItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!keyword) {
            alert('검색어를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const query = new URLSearchParams({
                keyword,
                startDate,
                endDate,
                pageNo: '1'
            });

            const res = await fetch(`/dashboard/api/contract?${query.toString()}`);

            if (!res.ok) {
                throw new Error('검색 중 오류가 발생했습니다.');
            }

            const data = await res.json();

            // Check response structure from API route
            // It returns the full G2B JSON structure
            const body = data.response?.body;
            if (!body) {
                setTotalCount(0);
                return;
            }

            setTotalCount(body.totalCount || 0);

            const items = body.items?.item || [];
            // If single item, it might be an object not array in XML-to-JSON conversion sometimes, 
            // but our python script showed 'item' as list. 
            // Let's handle both just in case, though route.ts proxies JSON directly.
            const itemList = Array.isArray(items) ? items : [items];

            setResults(itemList);

        } catch (err: any) {
            setError(err.message || '검색 실패');
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount: string) => {
        if (!amount) return '-';
        return parseInt(amount).toLocaleString() + '원';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">용역 계약 조회</h1>
                    <p className="text-gray-600 mt-1">
                        G2B 나라장터의 용역 계약 정보를 키워드로 검색합니다.
                    </p>
                </div>
            </div>

            {/* 검색 필터 영역 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">용역명 (키워드)</label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="예: 해양환경, 폐기물"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? '검색 중...' : '검색'}
                    </button>
                </form>
            </div>

            {/* 결과 리스트 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">검색 결과 ({totalCount.toLocaleString()}건)</h2>
                </div>

                {error && (
                    <div className="p-8 text-center text-red-500">
                        {error}
                    </div>
                )}

                {!loading && !error && results.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        검색 결과가 없습니다. 기간을 변경하거나 다른 키워드로 검색해보세요.
                    </div>
                )}

                {results.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약명</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주기관</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약일자</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">계약금액</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약방법</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item, index) => (
                                    <tr key={`${item.cntrctNo}-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{item.cntrctNm}</div>
                                            <div className="text-xs text-gray-500">{item.cntrctNo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.orderInsttNm}
                                            {item.dminsttNm && item.dminsttNm !== item.orderInsttNm && (
                                                <div className="text-xs text-gray-400">({item.dminsttNm})</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.cntrctCnclsDt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            {formatMoney(item.cntrctAmt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.cntrctMthdNm}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
