
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-4">About</h3>
            <p className="text-sm">
              경영지원을 위한 정보 취합 및 분석을 위한 사이트 입니다.
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-white mb-4">Contact</h3>
            <p className="text-sm">jaejunya@naver.com</p>
          </div>
        </div>
        <hr className="border-gray-700 mb-4" />
        <p className="text-center text-sm text-gray-400">
          Copyright {currentYear} - All rights reserved
        </p>
      </div>
    </footer>
  );
}