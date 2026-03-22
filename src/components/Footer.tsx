import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">沖</span>
              </div>
              <div>
                <div className="font-bold text-white text-sm">沖縄マンション検索</div>
                <div className="text-xs text-gray-400">Okinawa Mansion Search</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              沖縄県のマンション情報を網羅的に掲載。
              販売中物件から成約事例まで、物件探しをサポートします。
            </p>
          </div>

          {/* エリア */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">エリアから探す</h3>
            <ul className="space-y-2">
              {[
                { label: "那覇市", href: "/mansions?city=那覇市" },
                { label: "浦添市", href: "/mansions?city=浦添市" },
                { label: "沖縄市", href: "/mansions?city=沖縄市" },
                { label: "宜野湾市", href: "/mansions?city=宜野湾市" },
                { label: "豊見城市", href: "/mansions?city=豊見城市" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">サービス</h3>
            <ul className="space-y-2">
              {[
                { label: "マンション一覧", href: "/mansions" },
                { label: "管理画面", href: "/admin" },
                { label: "データインポート", href: "/admin/import" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} 沖縄マンション検索. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            掲載情報は参考情報であり、最新の情報は各不動産会社にご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
