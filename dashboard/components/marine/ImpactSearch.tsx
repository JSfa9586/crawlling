'use client';

import { useState, useMemo } from 'react';

interface ImpactItem {
    acpYear: string;      // 접수연도
    acpDat: string;       // 접수일
    bizNam: string;       // 사업명
    bizActNam: string;    // 사업시행자
    stpNm: string;        // 진행단계
    dsSts: string;        // 협의상태
    rstNm: string;        // 결과명
    adrSido: string;      // 시도
    adrGugun: string;     // 구군
    prcIst: string;       // 처분기관 (관할청)
    bizTypNm: string;     // 사업유형
}

export default function ImpactSearch() {
    const [allItems, setAllItems] = useState<ImpactItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [progress, setProgress] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // 조회 조건 (시작연도 ~ 종료연도)
    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState((currentYear - 2).toString());
    const [endYear, setEndYear] = useState(currentYear.toString());

    // 클라이언트 필터링용 상태
    const [filter, setFilter] = useState({
        bizNam: '',     // 사업명 필터
        bizActNam: '',  // 시행자 필터
        region: '',     // 지역 필터
        prcIst: '',     // 관할청 필터
        status: '',     // 진행상태 필터
        year: '',       // 연도 필터
    });

    // 데이터 조회 (다년도)
    const handleSearch = async () => {
        const start = parseInt(startYear);
        const end = parseInt(endYear);

        if (isNaN(start) || isNaN(end)) {
            setError('연도를 올바르게 입력해주세요.');
            return;
        }

        if (start > end) {
            setError('시작연도가 종료연도보다 클 수 없습니다.');
            return;
        }

        if (end - start > 10) {
            setError('최대 10년 범위까지 조회 가능합니다.');
            return;
        }

        setLoading(true);
        setError(null);
        setAllItems([]);
        setHasSearched(true);

        try {
            const allResults: ImpactItem[] = [];
            const years = [];
            for (let y = start; y <= end; y++) {
                years.push(y);
            }

            for (let i = 0; i < years.length; i++) {
                const year = years[i];
                setProgress(`${year}년 데이터 조회 중... (${i + 1}/${years.length})`);

                const res = await fetch(`/api/public-data/impact-assessment?pageNo=1&numOfRows=1000&acpYear=${year}`);
                const data = await res.json();

                if (data.error) {
                    console.warn(`${year}년 조회 실패:`, data.error);
                    continue;
                }

                // 응답 구조 확인 및 매핑 (두 가지 형식 지원)
                const fetchedItems = data.getOceansSeaareaImpactInfo?.item || data.response?.body?.items?.item || [];
                const itemList = Array.isArray(fetchedItems) ? fetchedItems : [fetchedItems];

                // 필드 매핑 (snake_case와 camelCase 모두 지원)
                const mappedItems = itemList.filter((item: any) => item && (item.bizNam || item.biz_nam)).map((item: any) => ({
                    acpYear: item.acpYear || item.acp_year || '',
                    acpDat: item.acpDat || item.acp_dat || '',
                    bizNam: item.bizNam || item.biz_nam || '',
                    bizActNam: item.bizActNam || item.biz_act_nam || '',
                    stpNm: item.stpNm || item.stp_nm || '',
                    dsSts: item.dsSts || item.ds_sts || '',
                    rstNm: item.rstNm || item.rst_nm || '',
                    adrSido: item.adrSido || item.adr_sido || '',
                    adrGugun: item.adrGugun || item.adr_gugun || '',
                    prcIst: item.prcIst || item.prc_ist || '',
                    bizTypNm: item.bizTypNm || item.biz_typ_nm || '',
                }));

                allResults.push(...mappedItems);
            }

            setAllItems(allResults);
            setProgress('');

        } catch (err: any) {
            setError(err.message || '조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    // 연도 목록 추출
    const years = useMemo(() => {
        const yearSet = new Set<string>();
        allItems.forEach(item => {
            if (item.acpYear) {
                yearSet.add(item.acpYear);
            }
        });
        return Array.from(yearSet).sort().reverse();
    }, [allItems]);

    // 지역 목록 추출
    const regions = useMemo(() => {
        const regionSet = new Set<string>();
        allItems.forEach(item => {
            if (item.adrSido) {
                regionSet.add(item.adrSido);
            }
        });
        return Array.from(regionSet).sort();
    }, [allItems]);

    // 관할청 목록 추출
    const institutions = useMemo(() => {
        const instSet = new Set<string>();
        allItems.forEach(item => {
            if (item.prcIst) {
                instSet.add(item.prcIst);
            }
        });
        return Array.from(instSet).sort();
    }, [allItems]);

    // 진행상태 목록 추출
    const statuses = useMemo(() => {
        const statusSet = new Set<string>();
        allItems.forEach(item => {
            if (item.dsSts) {
                statusSet.add(item.dsSts);
            }
        });
        return Array.from(statusSet).sort();
    }, [allItems]);

    // 필터링된 결과
    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const bizNamMatch = !filter.bizNam ||
                item.bizNam.toLowerCase().includes(filter.bizNam.toLowerCase());

            const bizActNamMatch = !filter.bizActNam ||
                item.bizActNam.toLowerCase().includes(filter.bizActNam.toLowerCase());

            const regionMatch = !filter.region || item.adrSido === filter.region;
            const prcIstMatch = !filter.prcIst || item.prcIst === filter.prcIst;
            const statusMatch = !filter.status || item.dsSts === filter.status;
            const yearMatch = !filter.year || item.acpYear === filter.year;

            return bizNamMatch && bizActNamMatch && regionMatch && prcIstMatch && statusMatch && yearMatch;
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
            <h2 className="text-xl font-bold mb-4 text-gray-800">해역이용영향평가 조회</h2>

            {/* 조회 조건 */}
            <div className="mb-6 flex gap-4 items-end flex-wrap">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작연도
                    </label>
                    <input
                        type="text"
                        className="border p-2 rounded text-gray-800 w-20"
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                        placeholder="2020"
                    />
                </div>
                <span className="text-gray-500 pb-2">~</span>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료연도
                    </label>
                    <input
                        type="text"
                        className="border p-2 rounded text-gray-800 w-20"
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                        placeholder="2024"
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? '조회중...' : '조회'}
                </button>
                {loading && progress && (
                    <span className="text-blue-600">{progress}</span>
                )}
                {!loading && allItems.length > 0 && (
                    <span className="text-gray-600">
                        {startYear}~{endYear}년 총 {allItems.length}건 조회됨
                    </span>
                )}
            </div>

            {/* 필터링 영역 (조회 후에만 표시) */}
            {allItems.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-4 flex-wrap items-end">
                        {/* 사업명 필터 */}
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">사업명</label>
                            <input
                                type="text"
                                placeholder="사업명 검색..."
                                className="border p-2 rounded text-gray-800 w-full"
                                value={filter.bizNam}
                                onChange={(e) => handleFilterChange({ ...filter, bizNam: e.target.value })}
                            />
                        </div>

                        {/* 시행자 필터 */}
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">시행자</label>
                            <input
                                type="text"
                                placeholder="시행자 검색..."
                                className="border p-2 rounded text-gray-800 w-full"
                                value={filter.bizActNam}
                                onChange={(e) => handleFilterChange({ ...filter, bizActNam: e.target.value })}
                            />
                        </div>

                        {/* 연도 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[80px]"
                                value={filter.year}
                                onChange={(e) => handleFilterChange({ ...filter, year: e.target.value })}
                            >
                                <option value="">전체</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* 지역 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[100px]"
                                value={filter.region}
                                onChange={(e) => handleFilterChange({ ...filter, region: e.target.value })}
                            >
                                <option value="">전체</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {/* 관할청 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">관할청</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[150px]"
                                value={filter.prcIst}
                                onChange={(e) => handleFilterChange({ ...filter, prcIst: e.target.value })}
                            >
                                <option value="">전체</option>
                                {institutions.map(inst => (
                                    <option key={inst} value={inst}>{inst}</option>
                                ))}
                            </select>
                        </div>

                        {/* 진행상태 필터 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">진행상태</label>
                            <select
                                className="border p-2 rounded text-gray-800 min-w-[120px]"
                                value={filter.status}
                                onChange={(e) => handleFilterChange({ ...filter, status: e.target.value })}
                            >
                                <option value="">전체</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleFilterChange({ bizNam: '', bizActNam: '', region: '', prcIst: '', status: '', year: '' })}
                            className="text-gray-600 hover:text-gray-800 px-3 py-2 border rounded"
                        >
                            필터 초기화
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        필터 결과: {filteredItems.length}건 / 전체 {allItems.length}건
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
                            <th className="border p-2 text-left text-gray-700 w-[100px]">접수일</th>
                            <th className="border p-2 text-left text-gray-700">사업명</th>
                            <th className="border p-2 text-left text-gray-700 w-[150px]">사업시행자</th>
                            <th className="border p-2 text-left text-gray-700 w-[100px]">지역</th>
                            <th className="border p-2 text-left text-gray-700 w-[100px]">진행상태</th>
                            <th className="border p-2 text-left text-gray-700 w-[140px]">관할청</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!hasSearched && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    연도 범위를 입력하고 &apos;조회&apos; 버튼을 클릭하세요.
                                </td>
                            </tr>
                        )}
                        {hasSearched && filteredItems.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-gray-500">
                                    {allItems.length > 0 ? '필터 조건에 맞는 데이터가 없습니다.' : '해당 기간의 데이터가 없습니다.'}
                                </td>
                            </tr>
                        )}
                        {paginatedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap">
                                    {item.acpDat}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm" title={item.bizNam}>
                                    {item.bizNam}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={item.bizActNam}>
                                    {item.bizActNam}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap">
                                    {item.adrSido} {item.adrGugun}
                                </td>
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded text-xs ${item.dsSts === '협의완료' ? 'bg-green-100 text-green-800' :
                                        item.dsSts === '협의중' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.dsSts || item.stpNm}
                                    </span>
                                </td>
                                <td className="border p-2 text-gray-800 text-sm whitespace-nowrap">{item.prcIst}</td>
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
