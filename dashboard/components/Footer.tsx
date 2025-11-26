
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-4">About</h3>
            <p className="text-sm">
              해양수산부 공식 웹페이지 및 유관기관의 게시판 정보를 수집합니다.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Links</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  홈
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-white transition-colors">
                  대시보드
                </a>
              </li>
            </ul>
          </div>
          <div>
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