"use client";

import { useState } from 'react';
import Link from 'next/link';

interface ContractDetail {
    contract_no: string;
    contract_name: string;
    contract_amount: number;
    contract_date: string;
    contract_period: string;
    order_org_name: string;
    share_ratio: number;
    partner_type: string;
    detail_url: string;
}

interface YearlyData {
    year: number;
    count: number;
    total_amount: number;
    contracts: ContractDetail[];
}

interface CompanyStats {
    company_name: string;
    total_count: number;
    total_amount: number;
    yearly_data: YearlyData[];
}

export default function CompanyAnalysisPage() {
    const [companyInput, setCompanyInput] = useState('');
    const [companies, setCompanies] = useState<string[]>([]);
    const [stats, setStats] = useState<CompanyStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

    const addCompany = () => {
        const trimmed = companyInput.trim();
        if (trimmed && !companies.includes(trimmed)) {
            setCompanies([...companies, trimmed]);
            setCompanyInput('');
        }
    };

    const removeCompany = (name: string) => {
        setCompanies(companies.filter(c => c !== name));
        setStats(stats.filter(s => s.company_name !== name));
    };

    const fetchStats = async () => {
        if (companies.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/company-stats?companies=${encodeURIComponent(companies.join(','))}`);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleYear = (companyName: string, year: number) => {
        const key = `${companyName}-${year}`;
        const newExpanded = new Set(expandedYears);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedYears(newExpanded);
    };

    const formatAmount = (amount: number) => {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(1) + '억';
        } else if (amount >= 10000) {
            return (amount / 10000).toFixed(0) + '만';
        }
        return amount.toLocaleString();
    };

    const formatFullAmount = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(Math.round(amount)) + '원';
    };

    // 날짜 표시: 계약일이 없거나 1970년인 경우 contract_period에서 착수일 추출
    const formatContractDate = (contract: ContractDetail) => {
        const contractDate = contract.contract_date ? new Date(contract.contract_date) : null;
        const isInvalidDate = !contractDate || contractDate.getFullYear() <= 1970;

        if (isInvalidDate && contract.contract_period) {
            // contract_period에서 시작일 추출 (예: "2025-01-01 ~ 2025-12-31")
            const periodMatch = contract.contract_period.match(/(\d{4}[-.\/]\d{2}[-.\/]\d{2})/);
            if (periodMatch) {
                const startDate = new Date(periodMatch[1].replace(/[.\/]/g, '-'));
                return startDate.toLocaleDateString('ko-KR') + ' (착수일)';
            }
        }

        if (isInvalidDate) {
            return '-';
        }

        return contractDate.toLocaleDateString('ko-KR');
    };

    const getMaxYearlyAmount = () => {
        let max = 0;
        stats.forEach(s => {
            s.yearly_data.forEach(y => {
                if (y.total_amount > max) max = y.total_amount;
            });
        });
        return max;
    };

    const maxAmount = getMaxYearlyAmount();

    return (
        <div className="min-h-screen bg-white">
            {/* McKinsey-style Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">ANALYSIS</p>
                            <h1 className="text-3xl font-light text-gray-900">업체별 수주 현황</h1>
                        </div>
                        <Link href="/local-contracts" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            ← 계약검색으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Company Input Section */}
                <div className="mb-12">
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">분석 대상 업체</h2>
                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addCompany()}
                            placeholder="업체명 입력 후 Enter 또는 추가 버튼 클릭"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <button
                            onClick={addCompany}
                            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            추가
                        </button>
                        <button
                            onClick={fetchStats}
                            disabled={companies.length === 0 || loading}
                            className="px-8 py-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '분석 중...' : '분석'}
                        </button>
                    </div>

                    {/* Company Tags */}
                    {companies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {companies.map(name => (
                                <span
                                    key={name}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 text-sm"
                                >
                                    {name}
                                    <button
                                        onClick={() => removeCompany(name)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results */}
                {stats.length > 0 && (
                    <div className="space-y-16">
                        {stats.map((company) => (
                            <div key={company.company_name} className="border-t border-gray-200 pt-8">
                                {/* Company Header */}
                                <div className="mb-8">
                                    <h3 className="text-2xl font-light text-gray-900 mb-2">{company.company_name}</h3>
                                    <div className="flex gap-12">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">총 수주건수</p>
                                            <p className="text-3xl font-light text-gray-900">{company.total_count}<span className="text-lg text-gray-500 ml-1">건</span></p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">총 수주금액 (지분율 반영)</p>
                                            <p className="text-3xl font-light text-blue-600">{formatFullAmount(company.total_amount)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Yearly Breakdown */}
                                {company.yearly_data.length > 0 ? (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-widest">연도별 수주 현황</h4>

                                        {company.yearly_data.map((yearData) => {
                                            const isExpanded = expandedYears.has(`${company.company_name}-${yearData.year}`);
                                            const barWidth = maxAmount > 0 ? (yearData.total_amount / maxAmount) * 100 : 0;

                                            return (
                                                <div key={yearData.year} className="border border-gray-200">
                                                    {/* Year Row */}
                                                    <div
                                                        className="flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => toggleYear(company.company_name, yearData.year)}
                                                    >
                                                        {/* Expand Icon */}
                                                        <div className="w-12 flex items-center justify-center text-gray-400">
                                                            <svg
                                                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>

                                                        {/* Year */}
                                                        <div className="w-24 py-4 text-lg font-medium text-gray-900">
                                                            {yearData.year}
                                                        </div>

                                                        {/* Bar Chart */}
                                                        <div className="flex-1 pr-4">
                                                            <div className="h-8 bg-gray-100 relative">
                                                                <div
                                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                                    style={{ width: `${barWidth}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Count */}
                                                        <div className="w-20 text-right text-sm text-gray-600 pr-4">
                                                            {yearData.count}건
                                                        </div>

                                                        {/* Amount */}
                                                        <div className="w-40 text-right text-sm font-medium text-gray-900 pr-4">
                                                            {formatAmount(yearData.total_amount)}원
                                                        </div>
                                                    </div>

                                                    {/* Expanded Contract List */}
                                                    {isExpanded && (
                                                        <div className="bg-gray-50 border-t border-gray-200">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                                                        <th className="py-3 px-4 text-left font-medium">계약일</th>
                                                                        <th className="py-3 px-4 text-left font-medium">계약명</th>
                                                                        <th className="py-3 px-4 text-left font-medium">발주기관</th>
                                                                        <th className="py-3 px-4 text-right font-medium">계약금액</th>
                                                                        <th className="py-3 px-4 text-right font-medium">지분율</th>
                                                                        <th className="py-3 px-4 text-right font-medium">수주금액</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {yearData.contracts.map((contract, idx) => (
                                                                        <tr key={contract.contract_no + idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-100">
                                                                            <td className="py-3 px-4 text-gray-600">
                                                                                {formatContractDate(contract)}
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-900">
                                                                                {contract.detail_url ? (
                                                                                    <a
                                                                                        href={contract.detail_url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-blue-600 hover:underline"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        {contract.contract_name}
                                                                                    </a>
                                                                                ) : (
                                                                                    contract.contract_name
                                                                                )}
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-600">{contract.order_org_name}</td>
                                                                            <td className="py-3 px-4 text-right text-gray-900">
                                                                                {formatFullAmount(contract.contract_amount)}
                                                                            </td>
                                                                            <td className="py-3 px-4 text-right">
                                                                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${contract.share_ratio < 100
                                                                                    ? 'bg-amber-100 text-amber-800'
                                                                                    : 'bg-gray-100 text-gray-600'
                                                                                    }`}>
                                                                                    {contract.share_ratio}%
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-3 px-4 text-right font-medium text-blue-600">
                                                                                {formatFullAmount(contract.contract_amount * contract.share_ratio / 100)}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">수주 이력이 없습니다.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {stats.length === 0 && companies.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-sm">분석할 업체명을 입력하세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}
