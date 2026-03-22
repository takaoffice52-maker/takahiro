import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-teal-500 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          沖縄のマンション探しを始めましょう
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          那覇市・浦添市をはじめ、沖縄県内のマンション情報を網羅。
          販売中物件から成約事例まで、あなたの物件探しをサポートします。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/mansions"
            className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
          >
            マンションを探す
          </Link>
          <Link
            href="/mansions?city=那覇市"
            className="bg-blue-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors border border-blue-500"
          >
            那覇市の物件を見る
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 border-t border-blue-500 pt-8">
          <div>
            <div className="text-3xl font-bold text-white">100+</div>
            <div className="text-blue-200 text-sm mt-1">登録マンション数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">500+</div>
            <div className="text-blue-200 text-sm mt-1">販売中物件数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">1,000+</div>
            <div className="text-blue-200 text-sm mt-1">成約事例数</div>
          </div>
        </div>
      </div>
    </section>
  );
}
