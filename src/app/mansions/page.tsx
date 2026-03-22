import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";
import MansionCard from "@/components/MansionCard";
import type { Mansion, PaginatedResponse } from "@/types";
import { buildQueryString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "マンション一覧",
  description: "沖縄県のマンション一覧。那覇市・浦添市など全域の物件を検索できます。",
};

type PageProps = {
  searchParams: Promise<{
    city?: string;
    keyword?: string;
    layout?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    builtYearFrom?: string;
    page?: string;
  }>;
};

async function getMansions(searchParams: Awaited<PageProps["searchParams"]>) {
  const params: Record<string, string | number | undefined> = {
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 12,
  };
  if (searchParams.city) params.city = searchParams.city;
  if (searchParams.keyword) params.keyword = searchParams.keyword;
  if (searchParams.layout) params.layout = searchParams.layout;
  if (searchParams.minPrice) params.minPrice = searchParams.minPrice;
  if (searchParams.maxPrice) params.maxPrice = searchParams.maxPrice;
  if (searchParams.minArea) params.minArea = searchParams.minArea;
  if (searchParams.maxArea) params.maxArea = searchParams.maxArea;
  if (searchParams.builtYearFrom) params.builtYearFrom = searchParams.builtYearFrom;

  const qs = buildQueryString(params as Record<string, string | number | boolean | undefined>);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/mansions${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<PaginatedResponse<Mansion>>;
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
}

function PaginationLinks({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  const buildHref = (page: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) p.set(k, v);
    }
    p.set("page", String(page));
    return `/mansions?${p.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <a
          href={buildHref(currentPage - 1)}
          className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          前へ
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={buildHref(p)}
          className={`px-3 py-2 text-sm rounded-md border ${
            p === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p}
        </a>
      ))}
      {currentPage < totalPages && (
        <a
          href={buildHref(currentPage + 1)}
          className="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          次へ
        </a>
      )}
    </div>
  );
}

async function MansionList({ searchParams }: { searchParams: Awaited<PageProps["searchParams"]> }) {
  const result = await getMansions(searchParams);

  const hasFilters = !!(
    searchParams.city ||
    searchParams.keyword ||
    searchParams.layout ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.minArea ||
    searchParams.maxArea ||
    searchParams.builtYearFrom
  );

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          {hasFilters ? "条件に一致するマンション：" : "全マンション："}
          <span className="font-bold text-gray-900 ml-1">{result.total}件</span>
        </p>
      </div>

      {result.data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-300 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">該当するマンションが見つかりませんでした</h3>
          <p className="text-gray-500 text-sm">条件を変更して再度お試しください。</p>
          <a
            href="/mansions"
            className="mt-4 inline-block btn-secondary"
          >
            条件をリセット
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.data.map((mansion) => (
              <MansionCard key={mansion.id} mansion={mansion} />
            ))}
          </div>

          <PaginationLinks
            currentPage={result.page}
            totalPages={result.totalPages}
            searchParams={{
              city: searchParams.city,
              keyword: searchParams.keyword,
              layout: searchParams.layout,
              minPrice: searchParams.minPrice,
              maxPrice: searchParams.maxPrice,
              minArea: searchParams.minArea,
              maxArea: searchParams.maxArea,
              builtYearFrom: searchParams.builtYearFrom,
            }}
          />
        </>
      )}
    </div>
  );
}

export default async function MansionsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-gray-200 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {resolvedSearchParams.city
                ? `${resolvedSearchParams.city}のマンション一覧`
                : "沖縄県のマンション一覧"}
            </h1>
            <p className="text-sm text-gray-500">
              沖縄県内のマンション情報を掲載しています
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search form */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-64 bg-white rounded-xl animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </div>

          {/* Results */}
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 h-64 animate-pulse" />
              ))}
            </div>
          }>
            <MansionList searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
