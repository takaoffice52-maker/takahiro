import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "ダッシュボード" };

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const [mansionsRes, salesRes, txRes, mgmtRes] = await Promise.all([
      fetch(`${baseUrl}/api/mansions?publishedOnly=false&limit=1`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/sales?publishedOnly=false&limit=1`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/transactions?publishedOnly=false&limit=1`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/managements?limit=1`, { cache: "no-store" }),
    ]);

    const [mansions, sales, transactions, managements] = await Promise.all([
      mansionsRes.ok ? mansionsRes.json() : { total: 0 },
      salesRes.ok ? salesRes.json() : { total: 0 },
      txRes.ok ? txRes.json() : { total: 0 },
      mgmtRes.ok ? mgmtRes.json() : { total: 0 },
    ]);

    return {
      mansionsTotal: mansions.total || 0,
      salesTotal: sales.total || 0,
      transactionsTotal: transactions.total || 0,
      managementsTotal: managements.total || 0,
    };
  } catch {
    return {
      mansionsTotal: 0,
      salesTotal: 0,
      transactionsTotal: 0,
      managementsTotal: 0,
    };
  }
}

const STAT_CARDS = [
  {
    label: "マンション数",
    key: "mansionsTotal" as const,
    color: "bg-blue-500",
    icon: "🏢",
    href: "/admin/mansions",
  },
  {
    label: "販売中物件数",
    key: "salesTotal" as const,
    color: "bg-green-500",
    icon: "🏷️",
    href: "/admin/sales",
  },
  {
    label: "成約事例数",
    key: "transactionsTotal" as const,
    color: "bg-purple-500",
    icon: "📝",
    href: "/admin/transactions",
  },
  {
    label: "管理情報数",
    key: "managementsTotal" as const,
    color: "bg-orange-500",
    icon: "🔧",
    href: "/admin/managements",
  },
];

const QUICK_ACTIONS = [
  {
    label: "マンションを追加",
    href: "/admin/mansions/new",
    icon: "➕",
    description: "新規マンション情報を登録します",
  },
  {
    label: "データをインポート",
    href: "/admin/import",
    icon: "📥",
    description: "CSVファイルから一括インポートします",
  },
  {
    label: "マンション一覧を表示",
    href: "/mansions",
    icon: "🔍",
    description: "公開サイトの一覧を確認します",
  },
];

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">沖縄マンション検索 管理システム</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <div className={`w-3 h-3 rounded-full ${card.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats[card.key].toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                {action.label}
              </div>
              <div className="text-sm text-gray-500">{action.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900 mb-2">使い方ガイド</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>マンション管理</strong>: マンション棟情報の追加・編集・削除を行います</li>
          <li>• <strong>販売中物件</strong>: 各マンションの現在販売中の住戸情報を管理します</li>
          <li>• <strong>成約事例</strong>: 過去の成約価格データを管理します</li>
          <li>• <strong>管理情報</strong>: 管理費・修繕積立金などの情報を管理します</li>
          <li>• <strong>データインポート</strong>: CSVファイルから大量データを一括登録します</li>
        </ul>
      </div>
    </div>
  );
}
