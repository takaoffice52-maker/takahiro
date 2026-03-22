"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MansionTransaction, PaginatedResponse } from "@/types";
import { formatContractYearMonth, formatArea, formatPriceRange, formatFloor } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<MansionTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterLayout, setFilterLayout] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        publishedOnly: "false",
      });
      if (filterLayout) params.set("layout", filterLayout);

      const res = await fetch(`/api/transactions?${params}`);
      const data: PaginatedResponse<MansionTransaction> = await res.json();
      setTransactions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      console.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [page, filterLayout]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: number) => {
    if (!confirm("この成約事例を削除しますか？")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) fetchTransactions();
      else alert("削除に失敗しました");
    } catch {
      alert("削除中にエラーが発生しました");
    } finally {
      setDeleting(null);
    }
  };

  const handlePublishToggle = async (id: number, currentPublished: boolean) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentPublished }),
      });
      if (res.ok) fetchTransactions();
      else alert("更新に失敗しました");
    } catch {
      alert("更新中にエラーが発生しました");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成約事例管理</h1>
          <p className="text-gray-500 mt-1">全{total}件</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <select
          value={filterLayout}
          onChange={(e) => { setFilterLayout(e.target.value); setPage(1); }}
          className="form-input w-36"
        >
          <option value="">全間取り</option>
          <option value="1K">1K</option>
          <option value="1LDK">1LDK</option>
          <option value="2LDK">2LDK</option>
          <option value="3LDK">3LDK</option>
          <option value="4LDK">4LDK</option>
        </select>
        <button
          onClick={() => { setFilterLayout(""); setPage(1); }}
          className="btn-secondary text-sm"
        >
          リセット
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">読み込み中...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>成約事例データがありません</p>
            <p className="text-sm mt-2">
              <Link href="/admin/import" className="text-blue-600 hover:underline">データインポート</Link>
              から一括登録できます
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">マンション</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">契約年月</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">階数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">間取り</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">専有面積</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">成約価格</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">公開</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {tx.mansion ? (
                        <Link
                          href={`/admin/mansions/${tx.mansion.id}/edit`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {tx.mansion.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatContractYearMonth(tx.contractYearMonth)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFloor(tx.floorNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{tx.layout || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatArea(tx.exclusiveArea)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-800">
                      {formatPriceRange(tx.contractPriceMin, tx.contractPriceMax)}万円
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handlePublishToggle(tx.id, tx.isPublished)}
                        className={`badge ${tx.isPublished ? "badge-green" : "badge-gray"} cursor-pointer`}
                      >
                        {tx.isPublished ? "公開" : "非公開"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deleting === tx.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deleting === tx.id ? "削除中..." : "削除"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">全{total}件</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100">前へ</button>
              <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100">次へ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
