'use client';

import { useState } from 'react';
import AgencySearch from '@/components/marine/AgencySearch';
import ConsultationSearch from '@/components/marine/ConsultationSearch';
import ImpactSearch from '@/components/marine/ImpactSearch';
import ContractRealtime from '@/components/marine/ContractRealtime';

export default function InfoPage() {
    const [activeTab, setActiveTab] = useState<'agency' | 'consultation' | 'impact' | 'contract'>('agency');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">정보 조회</h1>

            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                    className={`py-2 px-4 font-medium text-lg whitespace-nowrap focus:outline-none ${activeTab === 'agency'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('agency')}
                >
                    해평대행자
                </button>
                <button
                    className={`py-2 px-4 font-medium text-lg whitespace-nowrap focus:outline-none ${activeTab === 'consultation'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('consultation')}
                >
                    해역이용협의
                </button>
                <button
                    className={`py-2 px-4 font-medium text-lg whitespace-nowrap focus:outline-none ${activeTab === 'impact'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('impact')}
                >
                    해역이용영향평가
                </button>
                <button
                    className={`py-2 px-4 font-medium text-lg whitespace-nowrap focus:outline-none ${activeTab === 'contract'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('contract')}
                >
                    계약정보(실시간)
                </button>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'agency' && <AgencySearch />}
                {activeTab === 'consultation' && <ConsultationSearch />}
                {activeTab === 'impact' && <ImpactSearch />}
                {activeTab === 'contract' && <ContractRealtime />}
            </div>
        </div>
    );
}

