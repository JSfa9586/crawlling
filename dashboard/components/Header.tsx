
export function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">경영지원</h1>
            <span className="ml-4 text-sm opacity-90">v1.0</span>
          </div>
          <ul className="hidden md:flex space-x-8">
            <li>
              <a href="/" className="hover:text-primary-100 transition-colors">
                홈
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-primary-100 transition-colors">
                해양수산부
              </a>
            </li>
            <li>
              <a href="/dashboard/associations" className="hover:text-primary-100 transition-colors">
                관련협회
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}