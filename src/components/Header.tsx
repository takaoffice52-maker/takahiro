"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">沖</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">沖縄マンション検索</div>
              <div className="text-xs text-gray-500 leading-tight">Okinawa Mansion Search</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/mansions"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              マンション一覧
            </Link>
            <Link
              href="/mansions?city=那覇市"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              那覇市
            </Link>
            <Link
              href="/mansions?city=浦添市"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              浦添市
            </Link>
            <Link
              href="/mansions?city=沖縄市"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              沖縄市
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              管理画面
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <nav className="flex flex-col gap-1">
              <Link
                href="/mansions"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                マンション一覧
              </Link>
              <Link
                href="/mansions?city=那覇市"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                那覇市
              </Link>
              <Link
                href="/mansions?city=浦添市"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                浦添市
              </Link>
              <Link
                href="/mansions?city=沖縄市"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                沖縄市
              </Link>
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                管理画面
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
