import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드 | 해양수산부 크롤링 대시보드',
  description: '해양수산부 게시글 분석 대시보드. 실시간 필터링, 검색, 정렬 기능 제공',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
