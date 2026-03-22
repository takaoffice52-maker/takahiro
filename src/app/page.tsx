import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

const CITIES = [
  { name: "那覇市", count: "最多掲載", emoji: "🏙️" },
  { name: "浦添市", count: "人気エリア", emoji: "🌿" },
  { name: "沖縄市", count: "中部中心", emoji: "🎶" },
  { name: "宜野湾市", count: "利便性高", emoji: "🛍️" },
  { name: "豊見城市", count: "新興エリア", emoji: "🌅" },
  { name: "うるま市", count: "東海岸", emoji: "🌊" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
              沖縄のマンション情報を
              <br className="hidden sm:block" />
              まとめて検索
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              那覇市・浦添市など沖縄県内のマンション情報を掲載。
              販売中物件の価格から成約事例まで確認できます。
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <form action="/mansions" className="flex gap-2">
                <input
                  type="text"
                  name="keyword"
                  placeholder="マンション名・エリアで検索..."
                  className="flex-1 px-5 py-3.5 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-gray-900 font-bold px-6 py-3.5 rounded-lg hover:bg-yellow-300 transition-colors shadow-lg whitespace-nowrap"
                >
                  検索
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Area links */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              エリアから探す
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={`/mansions?city=${encodeURIComponent(city.name)}`}
                  className="group bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-xl p-4 text-center hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <div className="text-3xl mb-2">{city.emoji}</div>
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600">
                    {city.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{city.count}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              サービスの特徴
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">販売中物件を一覧表示</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  各マンションの現在販売中の住戸情報をまとめて確認。価格・間取り・階数など詳細情報を提供。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">成約事例データ</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  国土交通省の取引価格情報をもとにした成約事例を掲載。適正価格の判断材料に。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">詳細条件で絞り込み</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  エリア・価格・間取り・専有面積・築年数など多様な条件で希望の物件を見つけられます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              間取りから探す
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {["1K", "1LDK", "2LDK", "3LDK", "4LDK以上"].map((layout) => (
                <Link
                  key={layout}
                  href={`/mansions?layout=${encodeURIComponent(layout)}`}
                  className="bg-blue-50 border border-blue-200 text-blue-700 font-semibold px-6 py-2.5 rounded-full hover:bg-blue-100 hover:border-blue-400 transition-colors"
                >
                  {layout}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
