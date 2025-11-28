'use client';

import { useState, useEffect } from 'react';
import { RecentPosts } from '@/components/RecentPosts';
import type { CrawlingData } from '@/types';

export default function Dashboard() {
  const [ministryData, setMinistryData] = useState<CrawlingData[]>([]);
  const [associationData, setAssociationData] = useState<CrawlingData[]>([]);
  const [lawsData, setLawsData] = useState<CrawlingData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    todayPosts: 0,
    lastUpdate: '',
  });

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // 3개 섹션 데이터 병렬 요청
        const [ministryRes, associationRes, lawsRes] = await Promise.all([
          fetch('/api/sheets?type=data&페이지크기=5&sheet=크롤링 결과'),
          fetch('/api/sheets?type=data&페이지크기=5&sheet=관련협회'),
          fetch('/api/sheets?type=data&페이지크기=5&sheet=관련법령')
        ]);

        const ministryJson = await ministryRes.json();
        const associationJson = await associationRes.json();
        const lawsJson = await lawsRes.json();

        if (ministryJson.success) setMinistryData(ministryJson.data || []);
        if (associationJson.success) setAssociationData(associationJson.data || []);
        if (lawsJson.success) setLawsData(lawsJson.data || []);

        // 간단한 통계 계산
        const allData = [
          ...(ministryJson.data || []),
          ...(associationJson.data || []),
          ...(lawsJson.data || [])
        ];

        // 최신 업데이트 시간
        let latestTime = '';
        if (allData.length > 0) {
          const times = allData.map((d: any) => d.수집일시).filter(Boolean).sort().reverse();
          latestTime = times[0] || '';
        }

        setStats({
          totalPosts: (ministryJson.meta?.total || 0) + (associationJson.meta?.total || 0) + (lawsJson.meta?.total || 0),
          todayPosts: 0,
          lastUpdate: latestTime
        });

      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // 날짜/시간 포맷팅
  const formatDateTime = (datetime: string) => {
    if (!datetime || datetime === '-') return '-';
    const parts = datetime.split(' ');
    if (parts.length === 2) {
      const [date, time] = parts;
      return `${date} ${time.substring(0, 5)}`;
    }
    return datetime;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 animate-fadeIn">

        {/* 헤더 섹션 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">통합 대시보드</h1>
            <p className="text-gray-600">해양수산부, 관련협회, 관련법령 최신 현황을 한눈에 확인하세요.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">최근 업데이트</p>
            <p className="text-lg font-semibold text-blue-600">{formatDateTime(stats.lastUpdate)}</p>
          </div>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div className="space-y-6">

          {/* 최근 게시물 섹션 */}
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RecentPosts
                title="해양수산부"
                data={ministryData}
                moreLink="/dashboard/ministry"
                isLoading={isLoading}
                icon="🌊"
                color="primary"
              />
              <RecentPosts
                title="관련협회"
                data={associationData}
                moreLink="/dashboard/associations"
                isLoading={isLoading}
                icon="🤝"
                color="secondary"
              />
              <RecentPosts
                title="관련법령"
                data={lawsData}
                moreLink="/dashboard/laws"
                isLoading={isLoading}
                icon="⚖️"
                color="success"
              />
            </div>

            {/* 이용 팁 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 이용 팁</h3>
              <p className="text-blue-600 text-sm">
                각 섹션의 <strong>'더보기'</strong> 버튼을 클릭하면 검색, 필터링, 정렬이 가능한 상세 페이지로 이동합니다.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
