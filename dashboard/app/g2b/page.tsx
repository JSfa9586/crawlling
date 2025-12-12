'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { G2BData } from '@/lib/types';
import { isExpired, formatMoney, formatDateTime } from '@/lib/formatters';

// 통계용 날짜 포맷터 (KST 변환) - 컴포넌트 내부 사용 유지 (JSX 반환)
const formatStatDateTime = (datetime: string) => {
    if (!datetime || datetime === '-') {
        return '-';
    }

    try {
        const date = new Date(datetime);
        // 날짜가 유효하지 않으면 원래 문자열 반환
        if (isNaN(date.getTime())) return datetime;

        // 브라우저 로컬 시간대(KST)로 포맷팅
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return (
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{year}-{month}-{day}</span>
                <span className="text-2xl font-bold">{hours}:{minutes}</span>
            </div>
        );
    } catch {
        return datetime;
    }
};

export default function G2BPage() {
    const [data, setData] = useState<G2BData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pre_specs' | 'bids'>('bids');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    const [stats, setStats] = useState({
        lastExecutionTime: '',
        latestCrawlTime: ''
    });

    // 필터 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('전체');
    const [priceRange, setPriceRange] = useState('all');
    const [agencyFilter, setAgencyFilter] = useState({ label: '전체', keywords: [] as string[] });
    const [dateRange, setDateRange] = useState<number>(30);

    const DATE_PRESETS = [
        { label: '오늘', days: 0 },
        { label: '1주일', days: 7 },
        { label: '1개월', days: 30 },
        { label: '3개월', days: 90 },
        { label: '전체', days: 999 }
    ];
    const KEYWORD_PRESETS = [
        '영향평가', '해양환경', '환경보전방안', '해양이용', '해역이용',
        '영향조사', '모니터링', '해상풍력'
    ];
    const PRICE_PRESETS = [
        { label: '고시금액 미만', value: 'under_2.3', min: 0, max: 230000000 },
        { label: '2.3억~5억', value: 'under_5', min: 230000000, max: 500000000 },
        { label: '5억~10억', value: 'under_10', min: 500000000, max: 1000000000 },
        { label: '10억이상', value: 'over_10', min: 1000000000, max: 0 }
    ];
    const AGENCY_PRESETS = [
        { label: '해양수산부', keywords: ['해양수산부', '해수부'] },
        { label: '항만공사', keywords: ['항만공사'] },
        { label: '제주', keywords: ['제주'] },
        { label: '광역시', keywords: ['광역시'] },
        { label: '수자원공사', keywords: ['수자원공사', 'K-water'] },
        { label: '전력공사', keywords: ['전력공사', '한전', '한국전력'] },
        { label: '주택공사', keywords: ['주택공사', 'LH', '토지주택'] }
    ];

    // 검색어 디바운싱
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // 검색어 변경 시 1페이지로 리셋
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 필터 변경 시 페이지 리셋
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, agencyFilter, dateRange, priceRange, activeTab]);

    // 데이터 로딩
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', activeTab);
            params.append('days', dateRange.toString());
            if (debouncedSearch) params.append('term', debouncedSearch);
            if (categoryFilter !== '전체') params.append('category', categoryFilter);
            if (agencyFilter.label !== '전체') {
                params.append('agency', agencyFilter.keywords.join(','));
            }
            if (priceRange !== 'all') {
                const preset = PRICE_PRESETS.find(p => p.value === priceRange);
                if (preset) {
                    if (preset.min > 0) params.append('price_min', preset.min.toString());
                    if (preset.max > 0) params.append('price_max', preset.max.toString());
                }
            }
            params.append('limit', '1000'); // 전체 검색 풀은 1000개로 제한
            params.append('page', currentPage.toString());
            params.append('per_page', ITEMS_PER_PAGE.toString());

            const res = await fetch(`/api/g2b?${params.toString()}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setData(json.data || []);
                    setTotalCount(json.count || 0);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, debouncedSearch, categoryFilter, agencyFilter, dateRange, priceRange, currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 통계 데이터 로딩
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/g2b?type=stats');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setStats(json.data);
                    }
                }
            } catch (error) {
                console.error('Stats fetch error:', error);
            }
        };
        fetchStats();
    }, []);

    const categories = ['전체', '용역', '물품', '공사', '기타'];
    const getPreSpecStatus = (item: G2BData) => {
        if (isExpired(item.규격공개종료일)) return { text: '마감', color: 'bg-gray-100 text-gray-600' };
        return { text: '진행중', color: 'bg-green-100 text-green-800' };
    };
    const getBidStatus = (item: G2BData) => {
        const status = item.상태 || '신규';
        if (status.includes('취소')) return { text: status, color: 'bg-red-100 text-red-800' };
        if (status.includes('변경')) return { text: `변경(${item.공고차수}차)`, color: 'bg-yellow-100 text-yellow-800' };
        return { text: '신규', color: 'bg-green-100 text-green-800' };
    };
    const getG2BLink = (item: G2BData) => {
        // DB에 저장된 링크가 있으면 우선 사용 (크롤러가 업데이트된 경우)
        // 하지만 사용자가 '직접 연결'을 원하므로 ID 기반 생성 우선
        if (activeTab === 'pre_specs') {
            // 사전규격: 등록번호(bfSpecRgstNo) 필요 - PRCA001_04 형식
            if (item.등록번호) {
                return `https://www.g2b.go.kr/link/PRCA001_04/single/?srch=${item.등록번호}&flag=cnrtSl`;
            }
        } else {
            // 입찰공고: 공고번호(bidNtceNo), 차수(bidNtceOrd) 필요
            if (item.공고번호) {
                const rawSeq = item.공고차수 || '0';
                const seq = rawSeq.padStart(3, '0');
                // User-provided "Important" Link Format
                return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${item.공고번호}&bidPbancOrd=${seq}`;
            }
        }
        // ID가 없으면 기존 링크(네이버 검색 등) 사용
        return item.링크 || '#';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">나라장터</h1>
                    <p className="text-gray-600 mt-1">
                        {totalCount > 2000
                            ? `전체 데이터베이스 검색 (총 ${totalCount.toLocaleString()}건 중 2000건 표시)`
                            : `전체 데이터베이스 검색 (총 ${totalCount.toLocaleString()}건)`}
                    </p>
                </div>
                <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">← 대시보드로 돌아가기</Link>
            </div>

            {/* 상단 통계 카드 - 모바일 2열(grid-cols-2), 데스크탑 4열 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="총 게시물"
                    value={totalCount.toLocaleString()}
                    icon="📄"
                    color="primary"
                />
                <StatCard
                    title="모니터링 기관"
                    value="나라장터"
                    icon="🏛️"
                    color="secondary"
                />
                <StatCard
                    title="모니터링 실행"
                    value={formatStatDateTime(stats.lastExecutionTime)}
                    icon="⏰"
                    color="success"
                />
                <StatCard
                    title="신규 게시물"
                    value={formatStatDateTime(stats.latestCrawlTime)}
                    icon="🆕"
                    color="info"
                />
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pre_specs')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pre_specs' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        사전규격
                    </button>
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bids' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        입찰공고
                    </button>
                    <Link
                        href="/local-contracts"
                        className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
                    >
                        계약검색
                    </Link>
                    <Link
                        href="/company-analysis"
                        className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700"
                    >
                        업체분석
                    </Link>
                </nav>
            </div>

            {/* 필터 영역 */}
            <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                {/* 1. 검색 입력창 (최상단 배치) */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-900">검색어 입력</label>
                        <button
                            onClick={() => setSearchTerm(KEYWORD_PRESETS.join(','))}
                            className="px-2 py-0.5 text-xs rounded border bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-50 font-bold"
                        >
                            항만환경사업부 공고검색
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="찾으시는 공고명을 입력하세요 (예: 해양환경)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                {/* 2. 필터 옵션들 */}
                {/* 날짜 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">기간</span>
                    {DATE_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setDateRange(preset.days)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${dateRange === preset.days ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* 키워드 (추천검색) -> "공고명" */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">공고명</span>
                    <button onClick={() => setSearchTerm('')} className={`px-3 py-1 text-xs rounded-full border ${searchTerm === '' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>초기화</button>
                    {KEYWORD_PRESETS.map((keyword) => (
                        <button
                            key={keyword}
                            onClick={() => setSearchTerm(keyword)}
                            className={`px-3 py-1 text-xs rounded-full border ${searchTerm === keyword ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {keyword}
                        </button>
                    ))}
                </div>

                {/* 발주기관 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">발주기관</span>
                    <button onClick={() => setAgencyFilter({ label: '전체', keywords: [] })} className={`px-3 py-1 text-xs rounded-full border ${agencyFilter.label === '전체' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>전체</button>
                    {AGENCY_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setAgencyFilter(preset)}
                            className={`px-3 py-1 text-xs rounded-full border ${agencyFilter.label === preset.label ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* 금액 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">금액</span>
                    <button onClick={() => setPriceRange('all')} className={`px-3 py-1 text-xs rounded-full border ${priceRange === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>전체</button>
                    {PRICE_PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => setPriceRange(preset.value)}
                            className={`px-3 py-1 text-xs rounded-full border ${priceRange === preset.value ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 로딩 인디케이터 */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* 데이터 테이블 (Desktop) */}
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">공고명</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">발주기관</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {activeTab === 'pre_specs' ? '배정예산' : '추정/기초금액'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {activeTab === 'pre_specs' ? '등록일' : '공고일'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        {activeTab === 'pre_specs' ? '공개종료' : '입찰마감'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">검색 결과가 없습니다.</td></tr>
                                ) : data.map((item, idx) => {
                                    const status = activeTab === 'pre_specs' ? getPreSpecStatus(item) : getBidStatus(item);
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{item.카테고리}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={getG2BLink(item)} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium block truncate max-w-md">{item.공고명}</a>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.발주기관}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {activeTab === 'pre_specs' ? (
                                                    formatMoney(item.배정예산)
                                                ) : (
                                                    <div className="flex items-center">
                                                        <span className="text-xs text-gray-500 mr-1 min-w-[30px]">{item.추정가격 && item.추정가격 !== '0' ? '추정' : '기초'}</span>
                                                        <span>{formatMoney(item.추정가격 && item.추정가격 !== '0' ? item.추정가격 : item.기초금액)}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(activeTab === 'pre_specs' ? item.등록일 : item.공고일)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(activeTab === 'pre_specs' ? item.규격공개종료일 : item.입찰마감)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* 모바일 뷰 */}
                    <div className="md:hidden space-y-4">
                        {data.map((item, idx) => {
                            const status = activeTab === 'pre_specs' ? getPreSpecStatus(item) : getBidStatus(item);
                            return (
                                <div key={idx} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-gray-500">{item.카테고리}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>{status.text}</span>
                                    </div>
                                    <a href={getG2BLink(item)} target="_blank" rel="noreferrer" className="text-lg font-bold text-gray-900 mb-1 block leading-tight">{item.공고명}</a>
                                    <div className="text-sm text-gray-600 mb-2">{item.발주기관}</div>
                                    <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-400">{activeTab === 'pre_specs' ? '예산' : (item.추정가격 && item.추정가격 !== '0' ? '추정가격' : '기초금액')}</div>
                                            <div className="font-bold text-blue-600 mb-1">{formatMoney(activeTab === 'pre_specs' ? item.배정예산 : (item.추정가격 && item.추정가격 !== '0' ? item.추정가격 : item.기초금액))}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">
                                                <span className="text-gray-400 mr-1">{activeTab === 'pre_specs' ? '등록' : '공고'}</span>
                                                <span className="text-blue-600 font-medium">
                                                    {formatDateTime(activeTab === 'pre_specs' ? item.등록일 : item.공고일)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                <span className="text-gray-400 mr-1">{activeTab === 'pre_specs' ? '마감' : '입찰'}</span>
                                                <span className={isExpired(activeTab === 'pre_specs' ? item.규격공개종료일 : item.입찰마감) ? 'text-red-500' : 'text-gray-900'}>
                                                    {formatDateTime(activeTab === 'pre_specs' ? item.규격공개종료일 : item.입찰마감)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 페이지네이션 */}
                    {totalCount > 0 && (
                        <div className="flex justify-center items-center space-x-2 py-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                이전
                            </button>

                            {/* 페이지 번호 (간단하게 현재 페이지 주변만 표시하거나 전체 표시 - 여기서는 간단히 범위 표시) */}
                            {Array.from({ length: Math.min(5, Math.ceil(totalCount / ITEMS_PER_PAGE)) }, (_, i) => {
                                // 현재 페이지를 중심으로 5개 보여주기 로직 (복잡하면 단순 1~N 혹은 현재만 보여줌)
                                // 간단하게: totalPages가 적으면 다 보여주고, 많으면 현재 페이지 주변
                                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
                                let startPage = Math.max(1, currentPage - 2);
                                if (startPage + 4 > totalPages) {
                                    startPage = Math.max(1, totalPages - 4);
                                }
                                const p = startPage + i;
                                if (p > totalPages) return null;

                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                                className={`px-3 py-1 rounded border ${currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
