'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Pagination } from '@/components/Pagination';
import type { CrawlingData, DashboardStats } from '@/types';

// 날짜/시간을 두 줄로 포맷팅하는 함수
const formatDateTime = (datetime: string) => {
    if (!datetime || datetime === '-') {
        return '-';
    }

    const parts = datetime.split(' ');
    if (parts.length === 2) {
        const [date, time] = parts;
        const timeWithoutSeconds = time.substring(0, 5); // HH:MM만 표시
        return (
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{date}</span>
                <span className="text-2xl font-bold">{timeWithoutSeconds}</span>
            </div>
        );

    }

    return datetime;
};

export default function AssociationsDashboard() {
    const [data, setData] = useState<CrawlingData[]>([]);
    const [filteredData, setFilteredData] = useState<CrawlingData[]>([]);
    const [paginatedData, setPaginatedData] = useState<CrawlingData[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        총게시물수: 0,
        기관수: 0,
        최근업데이트: '',
    });
    const [latestCrawlTime, setLatestCrawlTime] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    useEffect(() => {
        // 통계를 먼저 가져온 후 데이터 로드
        const loadData = async () => {
            // 통계 API도 sheet 파라미터를 지원해야 하지만, 현재는 전체 통계만 가져옴
            // 관련협회 전용 통계 API가 필요할 수 있음. 우선은 데이터 로딩에 집중.
            await fetchData();
        };
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [data, filters]);

    useEffect(() => {
        if (latestCrawlTime) {
            setStats(prev => ({
                ...prev,
                최근업데이트: latestCrawlTime,
            }));
        }
    }, [latestCrawlTime]);

    // 페이지네이션 적용
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedData(filteredData.slice(startIndex, endIndex));
    }, [filteredData, currentPage, itemsPerPage]);

    // 필터 변경 시 첫 페이지로 이동
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // API에서 실제 데이터 가져오기 (sheet=관련협회)
            const response = await fetch('/api/sheets?type=data&페이지크기=1000&sheet=관련협회');

            if (!response.ok) {
                throw new Error(`API 오류: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'API 응답 오류');
            }

            // 데이터 설정
            const fetchedData = result.data || [];
            setData(fetchedData);

            // 통계 계산
            const uniqueOrganizations = new Set(fetchedData.map((item: CrawlingData) => item.기관명));

            // 최신 수집 일시 계산
            let latestTime = '';
            if (fetchedData.length > 0) {
                const times = fetchedData.map((d: CrawlingData) => d.수집일시).filter(Boolean).sort().reverse();
                latestTime = times[0] || '';
            }
            setLatestCrawlTime(latestTime);

            setStats({
                총게시물수: result.meta?.total || fetchedData.length,
                기관수: uniqueOrganizations.size,
                최근업데이트: latestTime || '데이터 로딩 중...',
            });
        } catch (err) {
            console.error('데이터 페칭 오류:', err);
            setError(err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let result = data;

        if (filters.기관) {
            result = result.filter((item) =>
                item.기관명.includes(filters.기관 || '')
            );
        }

        if (filters.게시판) {
            result = result.filter((item) =>
                item.게시판.includes(filters.게시판 || '')
            );
        }

        if (filters.검색어) {
            result = result.filter((item) =>
                item.제목.includes(filters.검색어 || '')
            );
        }

        if (filters.시작일) {
            result = result.filter((item) => item.작성일 >= filters.시작일!);
        }

        if (filters.종료일) {
            result = result.filter((item) => item.작성일 <= filters.종료일!);
        }

        setFilteredData(result);
    };

    const handleFilter = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const quickFilters = [
        { label: '공지사항', value: '공지사항' },
        { label: '행사안내', value: '행사안내' },
        { label: '경조사', value: '경조사' },
        { label: '입찰정보', value: '입찰정보' },
    ];

    const relatedLinks = [
        { name: '(사)환경영향평가협회', url: 'https://www.eiaa.or.kr/' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 animate-fadeIn">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">관련협회</h1>
                    <p className="text-gray-600">환경영향평가협회 등 유관기관 공지사항</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <main className="lg:col-span-3 space-y-6" aria-label="대시보드 메인 컨텐츠">
                        {/* StatCard 3개 그리드 (실행 시간 제외) */}
                        <section aria-label="통계 요약" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="총 게시물"
                                value={stats.총게시물수}
                                icon="📄"
                                color="primary"
                            />
                            <StatCard
                                title="크롤링 기관"
                                value={stats.기관수}
                                icon="🏛️"
                                color="secondary"
                            />
                            <StatCard
                                title="신규 게시물"
                                value={formatDateTime(latestCrawlTime || '-')}
                                icon="🆕"
                                color="info"
                            />
                        </section>

                        {/* 에러 메시지 */}
                        {error && (
                            <ErrorMessage
                                title="오류 발생"
                                message={error}
                                onRetry={fetchData}
                            />
                        )}

                        {/* 필터바 */}
                        <section aria-label="검색 필터">
                            <FilterBar
                                onFilter={handleFilter}
                                quickFilters={quickFilters}
                            />
                        </section>

                        {/* 데이터 테이블 */}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <section aria-label="게시글 목록">
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            게시글 목록 ({filteredData.length}건)
                                        </h2>
                                    </div>
                                    <DataTable data={paginatedData} isLoading={isLoading} />
                                    {filteredData.length > 0 && (
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={filteredData.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={handlePageChange}
                                        />
                                    )}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* 사이드바 (관련기관 링크) */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">관련기관 링크</h2>
                            <ul className="space-y-3">
                                {relatedLinks.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
                                        >
                                            <span className="w-2 h-2 bg-gray-300 rounded-full mr-3 group-hover:bg-blue-500 transition-colors" />
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
