'use client';

import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { useEffect, useState } from 'react';
import type { DashboardStats } from '@/types';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    총게시물수: 0,
    기관수: 0,
    최근업데이트: '-',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/sheets?type=stats');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setStats({
              총게시물수: result.data.totalCount,
              기관수: result.data.organizationCount,
              최근업데이트: result.data.latestCrawlTime || '-',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          해양수산부 데이터 대시보드
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          해양수산부의 공식 웹페이지 및 게시판에서 수집한 데이터를
          시각화하고 분석하는 실시간 대시보드입니다.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          대시보드로 이동 →
        </Link>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="실시간 데이터"
            value="5분"
            icon="⚡"
            color="primary"
          />
          <StatCard
            title="크롤링 대상"
            value={`${stats.기관수 > 0 ? stats.기관수 : '20+'}`}
            icon="🏛️"
            color="secondary"
          />
          <StatCard
            title="총 게시물"
            value={`${stats.총게시물수 > 0 ? stats.총게시물수.toLocaleString() : '10K+'}`}
            icon="📊"
            color="success"
          />
        </div>
      </section>

      <section className="bg-primary-50 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">시작하기</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          대시보드에서 실시간으로 업데이트되는 해양수산부 게시글을 확인하세요.
          필터, 검색, 정렬 기능으로 원하는 데이터를 쉽게 찾을 수 있습니다.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          지금 시작하기 →
        </Link>
      </section>
    </div>
  );
}
