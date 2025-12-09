'use client';

import { useState } from 'react';

interface AgencyItem {
    cmpnyNm: string; // 회사명
    rprsntvNm: string; // 대표자명
    bizrno: string; // 사업자등록번호
    roadNmAddr: string; // 도로명주소
    telno: string; // 전화번호
}

export default function AgencySearch() {
    const [items, setItems] = useState<AgencyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sggNm: '',
        sidoNm: '',
        cmpnyNm: ''
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setItems([]);

        try {
            const query = new URLSearchParams(formData as any).toString();
            const res = await fetch(`/api/public-data/agency?${query}`);
            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

            // 응답 구조 확인 및 매핑
            // getOceansAgncyInfo -> body -> items -> item[]
            const fetchedItems = data.response?.body?.items?.item || [];
            // 단건일 경우 객체로 올 수 있음 -> 배열 변환
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">평가대행자 조회</h2>

            <form onSubmit={handleSearch} className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="시도명 (예: 부산광역시)"
                    className="border p-2 rounded text-gray-800"
                    value={formData.sidoNm}
                    onChange={(e) => setFormData({ ...formData, sidoNm: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="시군구명 (예: 연제구)"
                    className="border p-2 rounded text-gray-800"
                    value={formData.sggNm}
                    onChange={(e) => setFormData({ ...formData, sggNm: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="회사명"
                    className="border p-2 rounded text-gray-800"
                    value={formData.cmpnyNm}
                    onChange={(e) => setFormData({ ...formData, cmpnyNm: e.target.value })}
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
                            <th className="border p-2 text-left text-gray-700">회사명</th>
                            <th className="border p-2 text-left text-gray-700">대표자</th>
                            <th className="border p-2 text-left text-gray-700">연락처</th>
                            <th className="border p-2 text-left text-gray-700">주소</th>
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
                                <td className="border p-2 text-gray-800">{item.cmpnyNm}</td>
                                <td className="border p-2 text-gray-800">{item.rprsntvNm}</td>
                                <td className="border p-2 text-gray-800">{item.telno}</td>
                                <td className="border p-2 text-gray-800">{item.roadNmAddr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
