import type { MansionSale } from "@/types";
import { formatPrice, formatArea, formatPricePerTsubo, formatFloor } from "@/lib/utils";

type Props = {
  sales: MansionSale[];
  showMansionName?: boolean;
};

export default function SalesList({ sales, showMansionName = false }: Props) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">現在販売中の住戸情報はありません</p>
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
              部屋番号
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              向き
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              価格
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              坪単価
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              情報元
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状態
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
              {showMansionName && sale.mansion && (
                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                  <a href={`/mansions/${sale.mansion.slug}`} className="hover:underline">
                    {sale.mansion.name}
                  </a>
                </td>
              )}
              <td className="px-4 py-3 text-sm text-gray-700">
                {sale.roomNumber || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatFloor(sale.floorNumber)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {sale.layout || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatArea(sale.exclusiveArea)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {sale.direction || "-"}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-right text-blue-700">
                {formatPrice(sale.price)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-600">
                {formatPricePerTsubo(sale.pricePerTsubo)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {sale.listingSourceName ? (
                  sale.listingSourceUrl ? (
                    <a
                      href={sale.listingSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {sale.listingSourceName}
                    </a>
                  ) : (
                    sale.listingSourceName
                  )
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={sale.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    for_sale: { label: "販売中", className: "badge-green" },
    under_contract: { label: "商談中", className: "badge-yellow" },
    sold: { label: "成約済", className: "badge-gray" },
  };
  const info = map[status] ?? { label: status, className: "badge-gray" };
  return <span className={info.className + " badge"}>{info.label}</span>;
}
