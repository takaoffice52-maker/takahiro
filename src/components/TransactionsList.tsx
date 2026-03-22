import type { MansionTransaction } from "@/types";
import { formatContractYearMonth, formatArea, formatPriceRange, formatFloor } from "@/lib/utils";

type Props = {
  transactions: MansionTransaction[];
  showMansionName?: boolean;
};

export default function TransactionsList({ transactions, showMansionName = false }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">成約事例データはありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showMansionName && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                マンション名
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              契約年月
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              階数
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              間取り
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              専有面積
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              成約価格（万円）
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              坪単価（万円）
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              情報元
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              {showMansionName && tx.mansion && (
                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                  <a href={`/mansions/${tx.mansion.slug}`} className="hover:underline">
                    {tx.mansion.name}
                  </a>
                </td>
              )}
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatContractYearMonth(tx.contractYearMonth)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatFloor(tx.floorNumber)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {tx.layout || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatArea(tx.exclusiveArea)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-right text-gray-800">
                {formatPriceRange(tx.contractPriceMin, tx.contractPriceMax)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-600">
                {formatPriceRange(tx.pricePerTsuboMin, tx.pricePerTsuboMax)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {tx.sourceName || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
