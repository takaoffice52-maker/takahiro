import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "管理画面",
    template: "%s | 管理画面",
  },
};

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: "📊" },
  { href: "/admin/mansions", label: "マンション管理", icon: "🏢" },
  { href: "/admin/sales", label: "販売中物件", icon: "🏷️" },
  { href: "/admin/transactions", label: "成約事例", icon: "📝" },
  { href: "/admin/managements", label: "管理情報", icon: "🔧" },
  { href: "/admin/import", label: "データインポート", icon: "📥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">沖</span>
            </div>
            <div>
              <div className="font-bold text-sm text-white">沖縄マンション検索</div>
              <div className="text-xs text-gray-400">管理画面</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            サイトに戻る
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
