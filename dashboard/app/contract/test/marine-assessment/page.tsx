'use client';

import { useState } from 'react';
import AgencySearch from '@/components/marine/AgencySearch';
import ConsultationSearch from '@/components/marine/ConsultationSearch';

export default function MarineAssessmentPage() {
    const [activeTab, setActiveTab] = useState<'agency' | 'consultation'>('agency');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">해역이용협의 정보 서비스 테스트</h1>

            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium text-lg focus:outline-none ${activeTab === 'agency'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('agency')}
                >
                    평가대행자 조회
                </button>
                <button
                    className={`py-2 px-4 font-medium text-lg focus:outline-none ${activeTab === 'consultation'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('consultation')}
                >
                    해역이용협의 조회
                </button>
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'agency' ? <AgencySearch /> : <ConsultationSearch />}
            </div>
        </div>
    );
}
