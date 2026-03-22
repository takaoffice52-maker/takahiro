import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SalesList from "@/components/SalesList";
import TransactionsList from "@/components/TransactionsList";
import type { Mansion } from "@/types";
import { prisma } from "@/lib/prisma";
import {
  formatBuiltYearMonth,
  formatAgeYears,
  formatBoolean,
  formatFee,
  formatFloor,
} from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getMansion(slug: string): Promise<Mansion | null> {
  try {
    const mansion = await prisma.mansion.findUnique({
      where: { slug, isPublished: true },
      include: {
        _count: { select: { sales: true, transactions: true } },
        managements: { take: 1 },
        sales: { where: { isPublished: true }, orderBy: { price: "asc" } },
        transactions: { where: { isPublished: true }, orderBy: { contractYearMonth: "desc" }, take: 20 },
      },
    });
    return mansion as unknown as Mansion | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const mansion = await getMansion(slug);
  if (!mansion) return { title: "マンションが見つかりません" };
  return {
    title: mansion.name,
    description: `${mansion.name}（${mansion.address}）の詳細情報。販売中物件・成約事例を確認できます。`,
  };
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex border-b border-gray-100 py-3 last:border-b-0">
      <dt className="w-36 shrink-0 text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-800 flex-1">{value || "-"}</dd>
    </div>
  );
}

export default async function MansionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const mansion = await getMansion(slug);

  if (!mansion) notFound();

  const management = mansion.managements?.[0];
  const sales = mansion.sales?.filter((s) => s.isPublished) ?? [];
  const transactions = mansion.transactions?.filter((t) => t.isPublished) ?? [];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero image */}
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-blue-100 to-teal-100">
          {mansion.featuredImageUrl ? (
            <Image
              src={mansion.featuredImageUrl}
              alt={mansion.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="max-w-7xl mx-auto px-4">
              <span className="badge-blue text-xs mb-2 inline-block">{mansion.city}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                {mansion.name}
              </h1>
              {mansion.nameKana && (
                <p className="text-white/80 text-sm mt-1">{mansion.nameKana}</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">ホーム</Link>
            <span>/</span>
            <Link href="/mansions" className="hover:text-blue-600">マンション一覧</Link>
            <span>/</span>
            <Link href={`/mansions?city=${encodeURIComponent(mansion.city)}`} className="hover:text-blue-600">
              {mansion.city}
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{mansion.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - main info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {mansion.description && (
                <div className="card">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">物件紹介</h2>
                  <p className="text-gray-700 leading-relaxed text-sm">{mansion.description}</p>
                </div>
              )}

              {/* Basic info */}
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">物件基本情報</h2>
                <dl>
                  <InfoRow label="所在地" value={mansion.address} />
                  <InfoRow label="エリア" value={`${mansion.city} ${mansion.areaName}`} />
                  <InfoRow label="交通" value={mansion.accessInfo} />
                  <InfoRow label="構造" value={mansion.structureText} />
                  <InfoRow label="築年月" value={formatBuiltYearMonth(mansion.builtYearMonth)} />
                  <InfoRow label="築年数" value={formatAgeYears(mansion.ageYears)} />
                  <InfoRow label="総戸数" value={mansion.totalUnits ? `${mansion.totalUnits}戸` : null} />
                  <InfoRow label="階数" value={mansion.floors ? `${mansion.floors}階建` : null} />
                  <InfoRow label="土地権利" value={mansion.landRights} />
                  <InfoRow label="デベロッパー" value={mansion.developer} />
                  <InfoRow label="施工会社" value={mansion.constructorName} />
                  <InfoRow label="間取りタイプ" value={mansion.layoutTypes} />
                  <InfoRow label="駐車場" value={mansion.parkingInfo} />
                  <InfoRow label="用途地域" value={mansion.zoning} />
                  <InfoRow label="学区" value={mansion.schoolDistrict} />
                </dl>
              </div>

              {/* Management info */}
              {management && (
                <div className="card">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">管理情報</h2>
                  <dl>
                    <InfoRow label="管理会社" value={management.managementCompany} />
                    <InfoRow label="管理形態" value={management.managementStyle} />
                    <InfoRow label="管理費" value={formatFee(management.monthlyManagementFee)} />
                    <InfoRow label="修繕積立金" value={formatFee(management.monthlyRepairReserveFee)} />
                    <InfoRow label="ペット可否" value={formatBoolean(management.petAllowed)} />
                    <InfoRow label="駐車場" value={formatBoolean(management.parkingAvailable)} />
                    {management.notes && <InfoRow label="備考" value={management.notes} />}
                  </dl>
                </div>
              )}

              {/* Sales */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    販売中住戸一覧
                    {sales.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">{sales.length}件</span>
                    )}
                  </h2>
                </div>
                <SalesList sales={sales} />
              </div>

              {/* Transactions */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    成約事例
                    {transactions.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">{transactions.length}件</span>
                    )}
                  </h2>
                </div>
                <TransactionsList transactions={transactions} />
              </div>
            </div>

            {/* Right column - sidebar */}
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">物件データ</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">販売中住戸</span>
                    <span className="font-bold text-blue-600">{sales.length}件</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">成約事例</span>
                    <span className="font-bold text-gray-800">{transactions.length}件</span>
                  </div>
                  {mansion.totalUnits && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">総戸数</span>
                      <span className="font-bold text-gray-800">{mansion.totalUnits}戸</span>
                    </div>
                  )}
                  {mansion.floors && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">階数</span>
                      <span className="font-bold text-gray-800">{formatFloor(mansion.floors)}建</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">築年数</span>
                    <span className="font-bold text-gray-800">{formatAgeYears(mansion.ageYears)}</span>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              {mansion.latitude && mansion.longitude && (
                <div className="card">
                  <h3 className="font-bold text-gray-900 mb-3">地図</h3>
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-xs text-gray-500">
                        {mansion.latitude.toFixed(4)}, {mansion.longitude.toFixed(4)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${mansion.latitude},${mansion.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Google マップで見る
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin link */}
              <div className="card bg-gray-50">
                <h3 className="font-bold text-gray-700 mb-3 text-sm">管理者向け</h3>
                <div className="space-y-2">
                  <Link
                    href={`/admin/mansions/${mansion.id}/edit`}
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    この物件を編集する
                  </Link>
                  <Link
                    href="/admin"
                    className="block text-sm text-blue-600 hover:underline"
                  >
                    管理画面へ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
