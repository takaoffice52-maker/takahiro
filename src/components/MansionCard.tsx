import Link from "next/link";
import Image from "next/image";
import type { Mansion } from "@/types";
import { formatBuiltYearMonth, formatAgeYears, formatPrice } from "@/lib/utils";

type Props = {
  mansion: Mansion & {
    _count?: { sales: number; transactions: number };
  };
};

export default function MansionCard({ mansion }: Props) {
  return (
    <Link href={`/mansions/${mansion.slug}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-teal-100 overflow-hidden">
          {mansion.featuredImageUrl ? (
            <Image
              src={mansion.featuredImageUrl}
              alt={mansion.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xs text-blue-400">画像なし</p>
              </div>
            </div>
          )}

          {/* City Badge */}
          <div className="absolute top-2 left-2">
            <span className="badge-blue text-xs">{mansion.city}</span>
          </div>

          {/* Sales count badge */}
          {mansion._count && mansion._count.sales > 0 && (
            <div className="absolute top-2 right-2">
              <span className="badge bg-green-500 text-white text-xs">
                販売中 {mansion._count.sales}件
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {mansion.name}
          </h3>

          <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{mansion.address}</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">築年月</div>
              <div className="text-xs font-medium text-gray-800">
                {formatBuiltYearMonth(mansion.builtYearMonth)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">築年数</div>
              <div className="text-xs font-medium text-gray-800">
                {formatAgeYears(mansion.ageYears)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">総戸数</div>
              <div className="text-xs font-medium text-gray-800">
                {mansion.totalUnits ? `${mansion.totalUnits}戸` : "-"}
              </div>
            </div>
          </div>

          {/* Price and layout */}
          {mansion.sales && mansion.sales.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">販売中最安値</span>
                <span className="text-sm font-bold text-blue-600">
                  {formatPrice(Math.min(...mansion.sales.filter(s => s.price != null).map(s => s.price!)))}
                </span>
              </div>
            </div>
          )}

          {/* Access */}
          {mansion.accessInfo && (
            <div className="mt-2 flex items-start gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <p className="text-xs text-gray-500 line-clamp-1">{mansion.accessInfo}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
