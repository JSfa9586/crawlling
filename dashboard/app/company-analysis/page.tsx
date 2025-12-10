"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface ContractDetail {
    contract_no: string;
    contract_name: string;
    contract_amount: number;
    contract_date: string;
    start_date?: string;
    contract_period: string;
    order_org_name: string;
    share_ratio: number;
    partner_type: string;
    detail_url: string;
    is_modified_contract?: boolean;
    joint_type?: string;
    is_joint_contract?: boolean;
    partners?: Array<{ name: string; share_ratio: number }>;
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
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [companyInput, setCompanyInput] = useState('');
    const [companies, setCompanies] = useState<string[]>([]);
    const [stats, setStats] = useState<CompanyStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    // 결과 영역 ref (PNG 내보내기용)
    const resultsRef = useRef<HTMLDivElement>(null);

    // 제외된 계약 추적 (key: "{companyName}-{contract_no}")
    const [excludedContracts, setExcludedContracts] = useState<Set<string>>(new Set());

    // 기간 필터 상태
    const [startYear, setStartYear] = useState(currentYear);
    const [startMonth, setStartMonth] = useState(1);
    const [endYear, setEndYear] = useState(currentYear);
    const [endMonth, setEndMonth] = useState(currentMonth);

    // 분석 모드: 'order' = 수주 분석, 'revenue' = 매출 분석
    const [analysisMode, setAnalysisMode] = useState<'order' | 'revenue'>('order');

    // 엑셀 내보내기 함수
    const exportToExcel = () => {
        if (stats.length === 0) return;

        const workbook = XLSX.utils.book_new();

        stats.forEach(company => {
            const rows: Record<string, unknown>[] = [];
            const { adjustedTotalAmount, adjustedTotalCount } = getAdjustedStats(company);

            // 헤더 정보
            rows.push({
                '업체명': company.company_name,
                '분석기간': `${startYear}.${startMonth} ~ ${endYear}.${endMonth}`,
                '분석모드': analysisMode === 'order' ? '수주 분석' : '매출 분석',
                '총 건수': adjustedTotalCount,
                '총 금액': Math.round(adjustedTotalAmount)
            });
            rows.push({});

            // 계약 상세
            rows.push({
                '연도': '연도',
                '계약일': '계약일',
                '계약명': '계약명',
                '발주기관': '발주기관',
                '계약금액': '계약금액',
                '지분율': '지분율(%)',
                '수주금액': '수주금액',
                '분담이행': '분담이행',
                '제외여부': '제외여부'
            });

            company.yearly_data.forEach(yearData => {
                yearData.contracts.forEach(contract => {
                    const key = `${company.company_name}-${contract.contract_no}`;
                    const isDivision = contract.joint_type === '분담이행';
                    const isExcluded = excludedContracts.has(key);
                    const calculatedAmount = contract.contract_amount * contract.share_ratio / 100;

                    rows.push({
                        '연도': yearData.year,
                        '계약일': contract.contract_date ? new Date(contract.contract_date).toLocaleDateString('ko-KR') : '',
                        '계약명': contract.contract_name,
                        '발주기관': contract.order_org_name,
                        '계약금액': contract.contract_amount,
                        '지분율': contract.share_ratio,
                        '수주금액': Math.round(calculatedAmount),
                        '분담이행': isDivision ? 'O' : '',
                        '제외여부': isExcluded ? 'O' : ''
                    });
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(rows);

            // 열 너비 설정
            worksheet['!cols'] = [
                { wch: 8 },  // 연도
                { wch: 12 }, // 계약일
                { wch: 50 }, // 계약명
                { wch: 25 }, // 발주기관
                { wch: 15 }, // 계약금액
                { wch: 10 }, // 지분율
                { wch: 15 }, // 수주금액
                { wch: 10 }, // 분담이행
                { wch: 10 }, // 제외여부
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, company.company_name.substring(0, 31));
        });

        const filename = `업체분석_${analysisMode === 'order' ? '수주' : '매출'}_${startYear}${String(startMonth).padStart(2, '0')}-${endYear}${String(endMonth).padStart(2, '0')}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    // PNG 내보내기 함수 (4K 고해상도)
    const exportToPNG = async () => {
        if (!resultsRef.current || stats.length === 0) return;

        setIsExporting(true);

        // 모든 연도 펼치기
        const allYearKeys = new Set<string>();
        stats.forEach(company => {
            company.yearly_data.forEach(yearData => {
                allYearKeys.add(`${company.company_name}-${yearData.year}`);
            });
        });
        setExpandedYears(allYearKeys);

        // DOM 업데이트 대기
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const canvas = await html2canvas(resultsRef.current, {
                scale: 4, // 4배 스케일 (4K급 해상도)
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
            });

            const link = document.createElement('a');
            link.download = `업체분석_${analysisMode === 'order' ? '수주' : '매출'}_${startYear}${String(startMonth).padStart(2, '0')}-${endYear}${String(endMonth).padStart(2, '0')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('PNG 내보내기 오류:', error);
            alert('PNG 내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    // 계약명 키워드 필터
    const [contractKeywordInput, setContractKeywordInput] = useState('');
    const [contractKeywords, setContractKeywords] = useState<string[]>([]);

    // 년도 옵션 생성 (2005 ~ 현재)
    const yearOptions = Array.from({ length: currentYear - 2004 }, (_, i) => currentYear - i);

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

    const addContractKeyword = () => {
        const trimmed = contractKeywordInput.trim();
        if (trimmed && !contractKeywords.includes(trimmed)) {
            setContractKeywords([...contractKeywords, trimmed]);
            setContractKeywordInput('');
        }
    };

    const removeContractKeyword = (keyword: string) => {
        setContractKeywords(contractKeywords.filter(k => k !== keyword));
    };

    const fetchStats = async () => {
        if (companies.length === 0) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                companies: companies.join(','),
                contractKeywords: contractKeywords.join(','),
                startYear: startYear.toString(),
                startMonth: startMonth.toString(),
                endYear: endYear.toString(),
                endMonth: endMonth.toString(),
                mode: analysisMode
            });
            const response = await fetch(`/api/company-stats?${params}`);
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

    // 계약 제외/포함 토글
    const toggleExcludeContract = (companyName: string, contractNo: string) => {
        const key = `${companyName}-${contractNo}`;
        const newExcluded = new Set(excludedContracts);
        if (newExcluded.has(key)) {
            newExcluded.delete(key);
        } else {
            newExcluded.add(key);
        }
        setExcludedContracts(newExcluded);
    };

    // 제외된 계약을 제외한 동적 합계 계산
    const getAdjustedStats = (company: CompanyStats) => {
        let adjustedTotalAmount = 0;
        let adjustedTotalCount = 0;

        company.yearly_data.forEach(yearData => {
            yearData.contracts.forEach(contract => {
                const key = `${company.company_name}-${contract.contract_no}`;
                // 분담이행이거나 사용자가 제외한 계약은 합계에서 제외
                const isDivision = contract.joint_type === '분담이행';
                if (!isDivision && !excludedContracts.has(key)) {
                    adjustedTotalAmount += contract.contract_amount * contract.share_ratio / 100;
                    adjustedTotalCount += 1;
                }
            });
        });

        return { adjustedTotalAmount, adjustedTotalCount };
    };

    // 연도별 조정된 통계
    const getAdjustedYearData = (companyName: string, yearData: YearlyData) => {
        let adjustedAmount = 0;
        let adjustedCount = 0;

        yearData.contracts.forEach(contract => {
            const key = `${companyName}-${contract.contract_no}`;
            // 분담이행이거나 사용자가 제외한 계약은 합계에서 제외
            const isDivision = contract.joint_type === '분담이행';
            if (!isDivision && !excludedContracts.has(key)) {
                adjustedAmount += contract.contract_amount * contract.share_ratio / 100;
                adjustedCount += 1;
            }
        });

        return { adjustedAmount, adjustedCount };
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

                    {/* 계약명 키워드 필터 */}
                    <div className="mb-6">
                        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">계약명 키워드 필터 (선택)</h2>
                        <div className="flex gap-3 mb-2">
                            <input
                                type="text"
                                value={contractKeywordInput}
                                onChange={(e) => setContractKeywordInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addContractKeyword()}
                                placeholder="계약명에 포함될 키워드 (예: 영향평가, 해양, 항만)"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <button
                                onClick={addContractKeyword}
                                className="px-4 py-2 bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
                            >
                                추가
                            </button>
                        </div>
                        {contractKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {contractKeywords.map(keyword => (
                                    <span
                                        key={keyword}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm"
                                    >
                                        🔍 {keyword}
                                        <button
                                            onClick={() => removeContractKeyword(keyword)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 분석 모드 선택 */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-gray-600">분석 유형:</span>
                        <div className="flex border border-gray-300">
                            <button
                                onClick={() => setAnalysisMode('order')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${analysisMode === 'order'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                📊 수주 분석
                            </button>
                            <button
                                onClick={() => setAnalysisMode('revenue')}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${analysisMode === 'revenue'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                💰 매출 분석
                            </button>
                        </div>
                        <span className="text-xs text-gray-400">
                            {analysisMode === 'order'
                                ? '계약/착수일 기준, 총계약금액 산정'
                                : '완수일 기준, 금차금액 산정'}
                        </span>
                    </div>

                    {/* 기간 선택 */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm text-gray-600">분석 기간:</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={startYear}
                                onChange={(e) => setStartYear(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={startMonth}
                                onChange={(e) => setStartMonth(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                        </div>
                        <span className="text-gray-400">~</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={endYear}
                                onChange={(e) => setEndYear(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                value={endMonth}
                                onChange={(e) => setEndMonth(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{month}월</option>
                                ))}
                            </select>
                        </div>
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
                    <div>
                        {/* 내보내기 버튼 영역 */}
                        <div className="flex justify-end gap-2 mb-6">
                            <button
                                onClick={exportToExcel}
                                className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                엑셀 다운로드
                            </button>
                            <button
                                onClick={exportToPNG}
                                disabled={isExporting}
                                className={`inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${isExporting
                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {isExporting ? '이미지 생성 중...' : 'PNG 다운로드 (4K)'}
                            </button>
                        </div>

                        {/* 결과 영역 (PNG 내보내기 대상) */}
                        <div ref={resultsRef} className="space-y-16 bg-white p-4">
                            {stats.map((company) => (
                                <div key={company.company_name} className="border-t border-gray-200 pt-8">
                                    {/* Company Header */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-light text-gray-900 mb-2">{company.company_name}</h3>
                                        {(() => {
                                            const { adjustedTotalAmount, adjustedTotalCount } = getAdjustedStats(company);
                                            const excludedCount = company.total_count - adjustedTotalCount;
                                            return (
                                                <div className="flex gap-12">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">총 수주건수</p>
                                                        <p className="text-3xl font-light text-gray-900">
                                                            {adjustedTotalCount}
                                                            <span className="text-lg text-gray-500 ml-1">건</span>
                                                            {excludedCount > 0 && (
                                                                <span className="text-sm text-red-400 ml-2">(-{excludedCount}건 제외)</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">총 수주금액 (지분율 반영)</p>
                                                        <p className="text-3xl font-light text-blue-600">{formatFullAmount(adjustedTotalAmount)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Yearly Breakdown */}
                                    {company.yearly_data.length > 0 ? (
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-widest">연도별 수주 현황</h4>

                                            {company.yearly_data.map((yearData) => {
                                                const isExpanded = expandedYears.has(`${company.company_name}-${yearData.year}`);
                                                const { adjustedAmount, adjustedCount } = getAdjustedYearData(company.company_name, yearData);
                                                const barWidth = maxAmount > 0 ? (adjustedAmount / maxAmount) * 100 : 0;

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
                                                                {adjustedCount}건
                                                            </div>

                                                            {/* Amount */}
                                                            <div className="w-40 text-right text-sm font-medium text-gray-900 pr-4">
                                                                {formatAmount(adjustedAmount)}원
                                                            </div>
                                                        </div>

                                                        {/* Expanded Contract List */}
                                                        {isExpanded && (
                                                            <div className="bg-gray-50 border-t border-gray-200">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                                                            <th className="py-3 px-2 text-center font-medium w-16">제외</th>
                                                                            <th className="py-3 px-4 text-left font-medium">계약일</th>
                                                                            <th className="py-3 px-4 text-left font-medium">계약명</th>
                                                                            <th className="py-3 px-4 text-left font-medium">발주기관</th>
                                                                            <th className="py-3 px-4 text-right font-medium">계약금액</th>
                                                                            <th className="py-3 px-4 text-right font-medium">지분율</th>
                                                                            <th className="py-3 px-4 text-right font-medium">수주금액</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {yearData.contracts.map((contract, idx) => {
                                                                            const excludeKey = `${company.company_name}-${contract.contract_no}`;
                                                                            const isExcluded = excludedContracts.has(excludeKey);
                                                                            return (
                                                                                <tr
                                                                                    key={contract.contract_no + idx}
                                                                                    className={`border-b border-gray-100 last:border-0 hover:bg-gray-100 ${isExcluded ? 'bg-gray-200 opacity-60' : ''}`}
                                                                                >
                                                                                    <td className="py-3 px-2 text-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isExcluded}
                                                                                            onChange={() => toggleExcludeContract(company.company_name, contract.contract_no)}
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                                                        />
                                                                                    </td>
                                                                                    <td className={`py-3 px-4 text-gray-600 ${isExcluded ? 'line-through' : ''}`}>
                                                                                        {formatContractDate(contract)}
                                                                                    </td>
                                                                                    <td className={`py-3 px-4 ${isExcluded ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                                                        {contract.joint_type === '분담이행' && (
                                                                                            <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 mr-2" title="분담이행 계약은 금액 산정에서 제외됩니다">
                                                                                                분담이행
                                                                                            </span>
                                                                                        )}
                                                                                        {contract.is_modified_contract && (
                                                                                            <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 mr-2" title={`착수일: ${contract.start_date ? new Date(contract.start_date).toLocaleDateString('ko-KR') : '없음'}`}>
                                                                                                변경
                                                                                            </span>
                                                                                        )}
                                                                                        <div>
                                                                                            {contract.detail_url ? (
                                                                                                <a
                                                                                                    href={contract.detail_url}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className={isExcluded ? 'text-gray-400' : 'text-blue-600 hover:underline'}
                                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                                >
                                                                                                    {contract.contract_name}
                                                                                                </a>
                                                                                            ) : (
                                                                                                contract.contract_name
                                                                                            )}
                                                                                            {/* 공동도급 파트너 목록 */}
                                                                                            {contract.partners && contract.partners.length > 0 && (
                                                                                                <div className="mt-1 text-xs text-gray-500">
                                                                                                    {contract.partners.map((p, pIdx) => (
                                                                                                        <span key={pIdx} className="inline-flex items-center mr-2">
                                                                                                            <span className="text-gray-400">•</span>
                                                                                                            <span className="ml-1">{p.name}</span>
                                                                                                            <span className="ml-1 text-amber-600">({p.share_ratio}%)</span>
                                                                                                        </span>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
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
                                                                            );
                                                                        })}
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
