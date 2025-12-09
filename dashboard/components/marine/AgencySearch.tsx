'use client';

import { useState, useMemo } from 'react';

interface AgencyItem {
    cmpnyNm: string; // 회사명
    rprsntvNm: string; // 대표자명
    bizrno: string; // 등록번호
    roadNmAddr: string; // 도로명주소
    telno: string; // 전화번호
    instNm: string; // 관할청
}

export default function AgencySearch() {
    const [allItems, setAllItems] = useState<AgencyItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 클라이언트 필터링용 상태
    const [filter, setFilter] = useState({
        cmpnyNm: '', // 회사명 필터
        region: '', // 지역 필터 (시도)
        instNm: '', // 관할청 필터
    });

    // 전체 데이터 조회 (한번에 모두 가져옴)
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setAllItems([]);
        setHasSearched(true);

        try {
            // 전체 데이터를 한번에 조회 (numOfRows=200)
            const res = await fetch(`/api/public-data/agency?pageNo=1&numOfRows=200`);
            const data = await res.json();

            if (data.error) throw new Error(data.details || data.error);

            // 응답 구조 확인 및 매핑
            const fetchedItems = data.EvaluationAgentInfo?.item || data.response?.body?.items?.item || [];
            const itemList = Array.isArray(fetchedItems) ? fetchedItems : [fetchedItems];

            // API 필드명을 컴포넌트 필드명으로 매핑
            const mappedItems = itemList.map((item: any) => ({
                cmpnyNm: item.uzsr_evl_vexc_ent_nm || '',
                rprsntvNm: item.uzsr_evl_vexc_rprsv || '',
                bizrno: item.uzsr_evl_vexc_reg_no || '',
                roadNmAddr: item.uzsr_evl_vexc_offc_addr || '',
                telno: item.uzsr_evl_vexc_offc_telno || '',
                instNm: item.inst_nm || '',
            }));
            setAllItems(mappedItems);

        } catch (err: any) {
            setError(err.message || '조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 지역 목록 추출 (주소에서 시도 추출)
    const regions = useMemo(() => {
        const regionSet = new Set<string>();
        allItems.forEach(item => {
            // 주소에서 첫 번째 단어 (시도) 추출
            const match = item.roadNmAddr.match(/^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원특별자치도|충청북도|충청남도|전라북도|전북특별자치도|전라남도|경상북도|경상남도|제주특별자치도|인친광역시)/);
            if (match) {
                // "인친광역시" 오타를 "인천광역시"로 수정
                const region = match[1] === '인친광역시' ? '인천광역시' : match[1];
                regionSet.add(region);
            }
        });
        return Array.from(regionSet).sort();
    }, [allItems]);

    // 관할청 목록 추출
    const institutions = useMemo(() => {
        const instSet = new Set<string>();
        allItems.forEach(item => {
            if (item.instNm) {
                instSet.add(item.instNm);
            }
        });
        return Array.from(instSet).sort();
    }, [allItems]);

    // 필터링된 결과
    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            // 회사명 필터
            const cmpnyMatch = !filter.cmpnyNm ||
                item.cmpnyNm.toLowerCase().includes(filter.cmpnyNm.toLowerCase());

            // 지역 필터
            const regionMatch = !filter.region ||
                item.roadNmAddr.includes(filter.region) ||
                (filter.region === '인천광역시' && item.roadNmAddr.includes('인친광역시'));

            // 관할청 필터
            const instMatch = !filter.instNm ||
                item.instNm === filter.instNm;

            return cmpnyMatch && regionMatch && instMatch;
        });
    }, [allItems, filter]);

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage]);

    // 필터 변경 시 페이지 초기화
    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">해평대행자 조회</h2>

            {/* 조회 버튼 */}
            <div className="mb-6">
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? '전체 데이터 조회중...' : '전체 해평대행자 조회'}
                </button>
                {allItems.length > 0 && (
                    <span className="ml-4 text-gray-600">
                        총 {allItems.length}개 업체 조회됨
                    </span>
                )}
            </div>

            {/* 필터링 영역 (조회 후에만 표시) */}
            {allItems.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-4 flex-wrap items-end">
                        {/* 회사명 필터 */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                            <input
                                type="text"
                                placeholder="회사명 검색..."
                                className="border p-2 rounded text-gray-800 w-full"
                                value={filter.cmpnyNm}
                                onChange={(e) => handleFilterChange({ ...filter, cmpnyNm: e.target.value })}
                            />
                        </div>

                        {/* 지역 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[150px]"
                                value={filter.region}
                                onChange={(e) => handleFilterChange({ ...filter, region: e.target.value })}
                            >
                                <option value="">전체 지역</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {/* 관할청 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">관할청</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[180px]"
                                value={filter.instNm}
                                onChange={(e) => handleFilterChange({ ...filter, instNm: e.target.value })}
                            >
                                <option value="">전체 관할청</option>
                                {institutions.map(inst => (
                                    <option key={inst} value={inst}>{inst}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleFilterChange({ cmpnyNm: '', region: '', instNm: '' })}
                            className="text-gray-600 hover:text-gray-800 px-3 py-2 border rounded"
                        >
                            필터 초기화
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        필터 결과: {filteredItems.length}개 / 전체 {allItems.length}개
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border p-2 text-left text-gray-700 w-[180px]">회사명</th>
                            <th className="border p-2 text-left text-gray-700 w-[120px]">대표자</th>
                            <th className="border p-2 text-left text-gray-700 w-[120px]">연락처</th>
                            <th className="border p-2 text-left text-gray-700">주소</th>
                            <th className="border p-2 text-left text-gray-700 w-[140px]">관할청</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!hasSearched && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                    &apos;전체 평가대행자 조회&apos; 버튼을 클릭하여 데이터를 조회하세요.
                                </td>
                            </tr>
                        )}
                        {hasSearched && filteredItems.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                    {allItems.length > 0 ? '필터 조건에 맞는 데이터가 없습니다.' : '데이터가 없습니다.'}
                                </td>
                            </tr>
                        )}
                        {paginatedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis" title={item.cmpnyNm}>
                                    {item.cmpnyNm}
                                </td>
                                <td className="border p-2 text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis" title={item.rprsntvNm}>
                                    {item.rprsntvNm}
                                </td>
                                <td className="border p-2 text-gray-800 whitespace-nowrap">{item.telno}</td>
                                <td className="border p-2 text-gray-800 text-sm" title={item.roadNmAddr}>
                                    {item.roadNmAddr}
                                </td>
                                <td className="border p-2 text-gray-800 whitespace-nowrap text-sm">{item.instNm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {filteredItems.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        «
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        ‹
                    </button>
                    <span className="px-4 py-1 text-gray-700">
                        {currentPage} / {totalPages} 페이지
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        ›
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        »
                    </button>
                </div>
            )}
        </div>
    );
}
