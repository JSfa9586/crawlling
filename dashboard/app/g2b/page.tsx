'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface G2BData {
    구분: string;
    카테고리: string;
    공고명: string;
    발주기관: string;
    수요기관?: string;
    배정예산?: string;
    추정가격?: string;
    기초금액?: string;
    입찰마감?: string;
    개찰일?: string;
    규격공개종료일?: string;
    등록일?: string;
    공고일?: string;
    공고차수?: string;
    입찰방식?: string;
    상태?: string;
    링크: string;
    [key: string]: string | undefined;
}

// 날짜 비교 함수: 마감 여부 확인
function isExpired(dateStr: string | undefined): boolean {
    if (!dateStr) return false;
    try {
        // 날짜만 추출 (시간 제외)
        const dateOnly = dateStr.split(' ')[0];
        const endDate = new Date(dateOnly);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return endDate < today;
    } catch {
        return false;
    }
}

// 금액 포맷 함수
function formatMoney(amount: string | undefined): string {
    if (!amount || amount === '0') return '-';
    // 숫자 이외의 문자 제거
    const cleanAmount = amount.replace(/[^0-9]/g, '');
    const num = parseInt(cleanAmount, 10);
    if (isNaN(num)) return '-';
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억원`;
    } else if (num >= 10000) {
        return `${Math.round(num / 10000).toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
}

// 날짜 포맷 함수 (요일 포함)
function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    try {
        // YYYY-MM-DD 또는 YYYY-MM-DD HH:MM:SS 형식에서 날짜만 추출
        const dateOnly = dateStr.split(' ')[0];
        const date = new Date(dateOnly);
        if (isNaN(date.getTime())) return dateOnly;

        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = days[date.getDay()];

        return `${month}/${day}(${dayOfWeek})`;
    } catch {
        return dateStr.split(' ')[0];
    }
}

export default function G2BPage() {
    const [preSpecs, setPreSpecs] = useState<G2BData[]>([]);
    const [bids, setBids] = useState<G2BData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pre_specs' | 'bids'>('pre_specs');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('전체');
    const [priceRange, setPriceRange] = useState('all');
    const [agencyFilter, setAgencyFilter] = useState('전체'); // 발주기관 필터 추가
    const [dateRange, setDateRange] = useState<number>(30); // 기본 30일

    const DATE_PRESETS = [
        { label: '오늘', days: 0 },
        { label: '1주일', days: 7 },
        { label: '1개월', days: 30 },
        { label: '3개월', days: 90 },
        { label: '전체', days: 999 }
    ];

    const KEYWORD_PRESETS = [
        '영향평가', '해양환경', '환경성검토', '해양이용', '해역이용',
        '영향조사', '모니터링', '해상풍력'
    ];

    const PRICE_PRESETS = [
        { label: '고시금액 미만', value: 'under_2.3' },
        { label: '2.3억~5억', value: 'under_5' },
        { label: '5억~10억', value: 'under_10' },
        { label: '10억이상', value: 'over_10' }
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 사전규격 데이터
                const preSpecRes = await fetch('/api/g2b?type=pre_specs');
                if (preSpecRes.ok) {
                    const data = await preSpecRes.json();
                    if (data.success) {
                        setPreSpecs(data.data || []);
                    }
                }

                // 입찰공고 데이터
                const bidRes = await fetch('/api/g2b?type=bids');
                if (bidRes.ok) {
                    const data = await bidRes.json();
                    if (data.success) {
                        setBids(data.data || []);
                    }
                }
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const currentData = activeTab === 'pre_specs' ? preSpecs : bids;
    const categories = useMemo(() => {
        const cats = new Set(currentData.map(item => item.카테고리));
        return ['전체', ...Array.from(cats)];
    }, [currentData]);

    const filteredData = useMemo(() => {
        let data = currentData.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.공고명?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.발주기관?.toLowerCase().includes(searchTerm.toLowerCase());


            const matchesCategory = categoryFilter === '전체' || item.카테고리 === categoryFilter;

            // 금액 필터링
            let matchesPrice = true;
            if (priceRange !== 'all') {
                const rawPrice = activeTab === 'pre_specs'
                    ? item.배정예산
                    : (item.추정가격 || item.기초금액);

                if (!rawPrice || rawPrice === '0') {
                    matchesPrice = false;
                } else {
                    const price = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10);
                    if (isNaN(price)) {
                        matchesPrice = false;
                    } else {
                        switch (priceRange) {
                            case 'under_2.3': // 2.3억 미만
                                matchesPrice = price < 230000000;
                                break;
                            case 'under_5': // 2.3억 이상 ~ 5억 미만
                                matchesPrice = price >= 230000000 && price < 500000000;
                                break;
                            case 'under_10': // 5억 이상 ~ 10억 미만
                                matchesPrice = price >= 500000000 && price < 1000000000;
                                break;
                            case 'over_10': // 10억 이상
                                matchesPrice = price >= 1000000000;
                                break;
                            default:
                                matchesPrice = true;
                        }
                    }
                }
            }

            // 발주기관 필터링
            let matchesAgency = true;
            if (agencyFilter !== '전체') {
                const selectedAgency = AGENCY_PRESETS.find(p => p.label === agencyFilter);
                if (selectedAgency) {
                    matchesAgency = selectedAgency.keywords.some(keyword =>
                        item.발주기관?.includes(keyword)
                    );
                }
            }

            // 날짜 필터링
            if (dateRange !== 999) {
                const dateStr = activeTab === 'pre_specs' ? item.등록일 : item.공고일;
                if (!dateStr) return false;

                try {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() - dateRange);

                    const itemDate = new Date(dateStr.split(' ')[0]);
                    if (itemDate < targetDate) return false;
                } catch {
                    return true;
                }
            }

            return matchesSearch && matchesCategory && matchesPrice && matchesAgency;
        });

        // 날짜 내림차순 정렬 (최신순)
        return data.sort((a, b) => {
            const dateA = (activeTab === 'pre_specs' ? a.등록일 : a.공고일) || '';
            const dateB = (activeTab === 'pre_specs' ? b.등록일 : b.공고일) || '';
            return dateB.localeCompare(dateA);
        });
    }, [currentData, searchTerm, categoryFilter, dateRange, priceRange, activeTab]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // 사전규격 상태 계산
    const getPreSpecStatus = (item: G2BData) => {
        if (isExpired(item.규격공개종료일)) {
            return { text: '마감', color: 'bg-gray-100 text-gray-600' };
        }
        return { text: '진행중', color: 'bg-green-100 text-green-800' };
    };

    // 입찰공고 상태 표시
    const getBidStatus = (item: G2BData) => {
        const status = item.상태 || '신규';
        if (status.includes('취소')) {
            return { text: status, color: 'bg-red-100 text-red-800' };
        } else if (status.includes('변경')) {
            return { text: status, color: 'bg-yellow-100 text-yellow-800' };
        }
        // 공고차수가 '000'이 아니고 0보다 큰 경우 (변경공고)
        const bidSeq = item.공고차수;
        if (bidSeq && bidSeq !== '000' && bidSeq !== '') {
            const seqNum = parseInt(bidSeq, 10);
            if (seqNum > 0) {
                return { text: `변경(${seqNum}차)`, color: 'bg-yellow-100 text-yellow-800' };
            }
        }
        return { text: '신규', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">나라장터</h1>
                    <p className="text-gray-600 mt-1">사전규격 및 입찰공고 검색 결과</p>
                </div>
                <Link
                    href="/dashboard"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    ← 대시보드로 돌아가기
                </Link>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">사전규격</div>
                    <div className="text-2xl font-bold text-blue-600">{preSpecs.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">입찰공고</div>
                    <div className="text-2xl font-bold text-green-600">{bids.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">용역</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {currentData.filter(d => d.카테고리 === '용역').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-500">물품</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {currentData.filter(d => d.카테고리 === '물품').length}
                    </div>
                </div>
            </div>

            {/* 탭 - 사전규격이 먼저 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('pre_specs')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pre_specs'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        사전규격 ({preSpecs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bids'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        입찰공고 ({bids.length})
                    </button>
                </nav>
            </div>

            {/* 필터 프리셋 */}
            <div className="space-y-3">
                {/* 날짜 프리셋 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">기간:</span>
                    {DATE_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setDateRange(preset.days)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${dateRange === preset.days
                                ? 'bg-primary-100 text-primary-700 border border-primary-300 font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* 키워드 프리셋 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">키워드:</span>
                    <button
                        onClick={() => setSearchTerm('')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${searchTerm === ''
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        전체
                    </button>
                    {KEYWORD_PRESETS.map((keyword) => (
                        <button
                            key={keyword}
                            onClick={() => setSearchTerm(keyword)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${searchTerm === keyword
                                ? 'bg-primary-100 text-primary-700 border border-primary-300 font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                }`}
                        >
                            {keyword}
                        </button>
                    ))}
                </div>

                {/* 금액 프리셋 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">금액:</span>
                    <button
                        onClick={() => setPriceRange('all')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${priceRange === 'all'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        전체
                    </button>
                    {PRICE_PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => setPriceRange(preset.value)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${priceRange === preset.value
                                ? 'bg-primary-100 text-primary-700 border border-primary-300 font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* 발주기관 프리셋 */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">발주기관:</span>
                    <button
                        onClick={() => setAgencyFilter('전체')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${agencyFilter === '전체'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        전체
                    </button>
                    {AGENCY_PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => setAgencyFilter(preset.label)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${agencyFilter === preset.label
                                ? 'bg-primary-100 text-primary-700 border border-primary-300 font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="공고명 또는 발주기관 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* 데이터 테이블 - 사전규격용 */}
            {/* 데이터 표시 영역 */}
            {activeTab === 'pre_specs' && (
                <>
                    {/* 모바일 뷰 (카드) */}
                    <div className="md:hidden space-y-4">
                        {filteredData.map((item, index) => {
                            const status = getPreSpecStatus(item);
                            return (
                                <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3 border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역' ? 'bg-purple-100 text-purple-800' :
                                            item.카테고리 === '물품' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {item.카테고리}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <a
                                        href={item['링크']}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-lg font-bold text-gray-900 hover:text-primary-600 leading-snug"
                                    >
                                        {item.공고명 || '-'}
                                    </a>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium mr-2">{item.발주기관}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50">
                                        <div className="text-gray-500">
                                            배정예산 <span className="text-gray-900 font-medium ml-1">{formatMoney(item.배정예산)}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">등록일 {formatDate(item['등록일'])}</div>
                                            <div className="text-xs text-red-500 font-medium">마감 {formatDate(item['규격공개종료일'])}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 데스크탑 뷰 (테이블) */}
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공고명</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주기관</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배정예산</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수마감</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                {currentData.length === 0 ? '데이터가 없습니다.' : '검색 결과가 없습니다.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((item, index) => {
                                            const status = getPreSpecStatus(item);
                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역' ? 'bg-purple-100 text-purple-800' :
                                                            item.카테고리 === '물품' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {item.카테고리}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a href={item['링크']} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                                                            {item.공고명 || '-'}
                                                        </a>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.발주기관 || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatMoney(item.배정예산)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item['등록일'])}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item['규격공개종료일'])}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 데이터 표시 영역 - 입찰공고 */}
            {activeTab === 'bids' && (
                <>
                    {/* 모바일 뷰 (카드) */}
                    <div className="md:hidden space-y-4">
                        {filteredData.map((item, index) => {
                            const status = getBidStatus(item);
                            return (
                                <div key={index} className="bg-white rounded-lg shadow p-4 space-y-3 border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역' ? 'bg-purple-100 text-purple-800' :
                                            item.카테고리 === '물품' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {item.카테고리}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <a
                                        href={item['링크']}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-lg font-bold text-gray-900 hover:text-primary-600 leading-snug"
                                    >
                                        {item.공고명 || '-'}
                                    </a>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium mr-2">{item.발주기관}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50">
                                        <div className="text-gray-500">
                                            추정가격 <span className="text-gray-900 font-medium ml-1">{formatMoney(item.추정가격 || item.기초금액)}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">공고일 {formatDate(item['공고일'])}</div>
                                            <div className="text-xs text-red-500 font-medium">마감 {item['입찰마감'] ? formatDate(item['입찰마감']) : '추후공고'}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 데스크탑 뷰 (테이블) */}
                    <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공고명</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주기관</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추정가격</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공고일</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입찰마감</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                {currentData.length === 0 ? '데이터가 없습니다.' : '검색 결과가 없습니다.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredData.map((item, index) => {
                                            const status = getBidStatus(item);
                                            return (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역' ? 'bg-purple-100 text-purple-800' :
                                                            item.카테고리 === '물품' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {item.카테고리}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a href={item['링크']} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                                                            {item.공고명 || '-'}
                                                        </a>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item.발주기관 || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatMoney(item.추정가격 || item.기초금액)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item['공고일'])}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{item['입찰마감'] ? formatDate(item['입찰마감']) : '추후공고'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 안내 메시지 */}
            {(preSpecs.length === 0 && bids.length === 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">데이터 안내</h3>
                    <p className="text-blue-700">
                        구글시트에서 나라장터 데이터를 가져오고 있습니다.
                        데이터가 표시되지 않으면 관리자에게 문의하세요.
                    </p>
                </div>
            )}
        </div>
    );
}
