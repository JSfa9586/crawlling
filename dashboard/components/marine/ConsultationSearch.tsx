'use client';

import { useState } from 'react';

interface ConsultationItem {
    bsnsNm: string; // 사업명
    jrsdSeaOfcNm: string; // 관할해역청
    bsnsHostNm: string; // 사업시행자
    aplyDt: string; // 신청일자
    progrsSttus: string; // 진행상태
}

export default function ConsultationSearch() {
    const [items, setItems] = useState<ConsultationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        jrsdSeaOfcNm: '',
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

            // 응답 구조 확인 및 매핑
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

            <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="관할해역청 (예: 인천지방해양수산청)"
                    className="border p-2 rounded text-gray-800 w-64"
                    value={formData.jrsdSeaOfcNm}
                    onChange={(e) => setFormData({ ...formData, jrsdSeaOfcNm: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="사업명"
                    className="border p-2 rounded text-gray-800"
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
                            <th className="border p-2 text-left text-gray-700">관할청</th>
                            {/* <th className="border p-2 text-left text-gray-700">시행자</th> 필드명 불확실시 제외하거나 안전하게 접근 */}
                            <th className="border p-2 text-left text-gray-700">진행상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">데이터가 없습니다.</td>
                            </tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800">{item.bsnsNm}</td>
                                <td className="border p-2 text-gray-800">{item.jrsdSeaOfcNm}</td>
                                <td className="border p-2 text-gray-800">{item.progrsSttus || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
