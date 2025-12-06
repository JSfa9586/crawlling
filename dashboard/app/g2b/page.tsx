'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface G2BData {
    구분: string;
    카테고리: string;
    공고명: string;
    발주기관: string;
    배정예산?: string;
    추정가격?: string;
    입찰마감?: string;
    규격공개종료일?: string;
    등록일?: string;
    공고일?: string;
    상태: string;
    링크: string;
    [key: string]: string | undefined;
}

export default function G2BPage() {
    const [preSpecs, setPreSpecs] = useState<G2BData[]>([]);
    const [bids, setBids] = useState<G2BData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pre_specs' | 'bids'>('bids');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('전체');

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
        return currentData.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.공고명?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.발주기관?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === '전체' || item.카테고리 === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [currentData, searchTerm, categoryFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

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

            {/* 탭 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bids'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        입찰공고 ({bids.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('pre_specs')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pre_specs'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        사전규격 ({preSpecs.length})
                    </button>
                </nav>
            </div>

            {/* 필터 */}
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

            {/* 데이터 테이블 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    카테고리
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    공고명
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    발주기관
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    예산/금액
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    마감일
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {currentData.length === 0
                                            ? '데이터가 없습니다. API 키를 설정하고 크롤러를 실행해주세요.'
                                            : '검색 결과가 없습니다.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.카테고리 === '용역'
                                                ? 'bg-purple-100 text-purple-800'
                                                : item.카테고리 === '물품'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.카테고리}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <a
                                                href={item.링크}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
                                            >
                                                {item.공고명 || '-'}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {item.발주기관 || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {(item.배정예산 || item.추정가격)
                                                ? `${Number(item.배정예산 || item.추정가격).toLocaleString()}원`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {item.입찰마감 || item.규격공개종료일 || item.등록일 || item.공고일 || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.상태 === '신규'
                                                ? 'bg-green-100 text-green-800'
                                                : item.상태 === '검토중'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.상태 || '신규'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 안내 메시지 */}
            {(preSpecs.length === 0 && bids.length === 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">설정 안내</h3>
                    <ol className="list-decimal list-inside text-blue-700 space-y-2">
                        <li>
                            <a
                                href="https://www.data.go.kr/data/15129394/openapi.do"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-900"
                            >
                                공공데이터포털
                            </a>에서 API 키를 발급받으세요
                        </li>
                        <li>환경변수 <code className="bg-blue-100 px-1 rounded">G2B_API_KEY</code>에 API 키를 설정하세요</li>
                        <li><code className="bg-blue-100 px-1 rounded">python g2b_crawler.py</code> 명령으로 크롤러를 실행하세요</li>
                    </ol>
                </div>
            )}
        </div>
    );
}
