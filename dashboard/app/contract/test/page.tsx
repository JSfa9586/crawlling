import Link from 'next/link';

export default function TestPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">기능 테스트 페이지</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/contract/test/marine-assessment" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2 text-blue-700">해역이용협의 & 평가대행자</h2>
                    <p className="text-gray-600">
                        공공데이터포털 API를 이용한 해역이용협의 정보 및 평가대행자 등록 정보 조회
                    </p>
                </Link>

                {/* 추후 추가될 테스트 기능들 */}
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                    <h2 className="text-xl font-semibold mb-2 text-gray-500">준비중...</h2>
                    <p className="text-gray-400">새로운 기능 테스트가 여기에 추가됩니다.</p>
                </div>
            </div>
        </div>
    );
}
