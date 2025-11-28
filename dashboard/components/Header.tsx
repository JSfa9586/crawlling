"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">경영지원</h1>
            <span className="ml-4 text-sm opacity-90">v1.0</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8">
            <li>
              <Link href="/" className="hover:text-primary-100 transition-colors">
                홈
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ministry" className="hover:text-primary-100 transition-colors">
                해양수산부
              </Link>
            </li>
            <li>
              <Link href="/dashboard/associations" className="hover:text-primary-100 transition-colors">
                관련협회
              </Link>
            </li>
            <li>
              <Link href="/dashboard/laws" className="hover:text-primary-100 transition-colors">
                관련법령
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-primary-500 focus:outline-none"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col space-y-2">
              <li>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md hover:bg-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/ministry"
                  className="block px-3 py-2 rounded-md hover:bg-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  해양수산부
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/associations"
                  className="block px-3 py-2 rounded-md hover:bg-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  관련협회
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/laws"
                  className="block px-3 py-2 rounded-md hover:bg-primary-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  관련법령
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}