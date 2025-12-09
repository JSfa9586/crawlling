'use client';

import { useState } from 'react';

interface ImpactItem {
    bsnsNm: string; // 사업명
    bizSiz: string; // 사업규모
    adrDong: string; // 동 주소
    prcIst: string; // 처리기관? (문서상 prcIst)
    resultMsg: string; // 결과메시지
}

export default function ImpactSearch() {
    const [items, setItems] = useState<ImpactItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        bsnsNm: ''
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setItems([]);

        try {
            const query = new URLSearchParams(formData).toString();
            const res = await fetch(`/api/public-data/impact-assessment?${query}`);
            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

            // 응답 구조 확인 (getOceansUseInfo 라고 가정했을 때 구조가 다를 수 있음. 일단 item 매핑)
            const fetchedItems = data.response?.body?.items?.item || [];
            const itemList = Array.isArray(fetchedItems) ? fetchedItems : [fetchedItems];
            setItems(itemList);

        } catch (err: any) {
            setError(err.message || '조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">해역이용영향평가 조회</h2>

            <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="사업명 (예: 항만공사)"
                    className="border p-2 rounded text-gray-800 w-64"
                    value={formData.bsnsNm}
                    onChange={(e) => setFormData({ ...formData, bsnsNm: e.target.value })}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? '조회중...' : '조회'}
                </button>
            </form>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border p-2 text-left text-gray-700">사업명</th>
                            <th className="border p-2 text-left text-gray-700">사업규모</th>
                            <th className="border p-2 text-left text-gray-700">주소(동)</th>
                            <th className="border p-2 text-left text-gray-700">처리상태/기관</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">데이터가 없습니다.</td>
                            </tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800">{item.bsnsNm}</td>
                                <td className="border p-2 text-gray-800">{item.bizSiz || '-'}</td>
                                <td className="border p-2 text-gray-800">{item.adrDong || '-'}</td>
                                <td className="border p-2 text-gray-800">{item.prcIst || item.resultMsg || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
