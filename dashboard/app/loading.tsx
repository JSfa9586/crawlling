export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 스켈레톤 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-32 mt-4 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* 필터 스켈레톤 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="h-6 bg-gray-300 rounded w-16 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-300 rounded w-12 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 테이블 스켈레톤 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="bg-gray-50 border-b p-6">
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* 테이블 행 */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b p-6 hover:bg-gray-50">
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}

          {/* 페이지네이션 */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-8 animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
