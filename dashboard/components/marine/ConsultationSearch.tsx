'use client';

import { useState } from 'react';

interface ConsultationItem {
    acpYear: string;
    acpDat: string;
    bizNam: string;
    stpNm: string;
    dsSts: string;
    rstNm: string;
    bizActNam: string;
    // Others might be present but these are used in table
}

export default function ConsultationSearch() {
    const [items, setItems] = useState<ConsultationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        acpYear: new Date().getFullYear().toString(),
        bsnsNm: ''
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setItems([]);

        try {
            const query = new URLSearchParams(formData as any).toString();
            const res = await fetch(`/api/public-data/consultation?${query}`);
            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

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
            <h2 className="text-xl font-bold mb-4 text-gray-800">해역이용협의 조회</h2>

            <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        접수연도 <span className="text-red-500">(필수)</span>
                    </label>
                    <input
                        type="text"
                        className="border p-2 rounded text-gray-800 w-24"
                        value={formData.acpYear}
                        onChange={(e) => setFormData({ ...formData, acpYear: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">사업명</label>
                    <input
                        type="text"
                        placeholder="사업명"
                        className="border p-2 rounded text-gray-800 w-64"
                        value={formData.bsnsNm}
                        onChange={(e) => setFormData({ ...formData, bsnsNm: e.target.value })}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 h-10"
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
                            <th className="border p-2 text-left text-gray-700">접수번호/일자</th>
                            <th className="border p-2 text-left text-gray-700">사업명</th>
                            <th className="border p-2 text-left text-gray-700">진행단계</th>
                            <th className="border p-2 text-left text-gray-700">협의상태/결과</th>
                            <th className="border p-2 text-left text-gray-700">사업시행자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">데이터가 없습니다.</td>
                            </tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800">
                                    <div>{item.acpYear}</div>
                                    <div className="text-xs text-gray-500">{item.acpDat}</div>
                                </td>
                                <td className="border p-2 text-gray-800">{item.bizNam}</td>
                                <td className="border p-2 text-gray-800">{item.stpNm}</td>
                                <td className="border p-2 text-gray-800">{item.dsSts || item.rstNm}</td>
                                <td className="border p-2 text-gray-800">{item.bizActNam}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
