"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Mansion, PaginatedResponse } from "@/types";
import { formatBuiltYearMonth, formatAgeYears } from "@/lib/utils";

export default function AdminMansionsPage() {
  const [mansions, setMansions] = useState<Mansion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchMansions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        publishedOnly: "false",
      });
      if (keyword) params.set("keyword", keyword);
      if (city) params.set("city", city);

      const res = await fetch(`/api/mansions?${params}`);
      const data: PaginatedResponse<Mansion> = await res.json();
      setMansions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      console.error("Failed to fetch mansions");
    } finally {
      setLoading(false);
    }
  }, [page, keyword, city]);

  useEffect(() => {
    fetchMansions();
  }, [fetchMansions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMansions();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/mansions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMansions();
      } else {
        alert("削除に失敗しました");
      }
    } catch {
      alert("削除中にエラーが発生しました");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">マンション管理</h1>
          <p className="text-gray-500 mt-1">全{total}件</p>
        </div>
        <Link href="/admin/mansions/new" className="btn-primary">
          ＋ マンションを追加
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="マンション名・住所で検索"
          className="form-input flex-1"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="市区町村"
          className="form-input w-36"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">検索</button>
        <button
          type="button"
          onClick={() => { setKeyword(""); setCity(""); setPage(1); }}
          className="btn-secondary whitespace-nowrap"
        >
          リセット
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">読み込み中...</div>
          </div>
        ) : mansions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-3">🏢</div>
            <p>マンション情報がありません</p>
            <Link href="/admin/mansions/new" className="btn-primary mt-4 inline-block">
              最初のマンションを登録
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">マンション名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">所在地</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">築年月</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">総戸数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">公開</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mansions.map((mansion) => (
                  <tr key={mansion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{mansion.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{mansion.name}</div>
                      <div className="text-xs text-gray-500">{mansion.city} / {mansion.areaName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {mansion.address}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{formatBuiltYearMonth(mansion.builtYearMonth)}</div>
                      <div className="text-xs text-gray-400">{formatAgeYears(mansion.ageYears)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {mansion.totalUnits ? `${mansion.totalUnits}戸` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${mansion.isPublished ? "badge-green" : "badge-gray"}`}>
                        {mansion.isPublished ? "公開" : "非公開"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/mansions/${mansion.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          表示
                        </Link>
                        <Link
                          href={`/admin/mansions/${mansion.id}/edit`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDelete(mansion.id, mansion.name)}
                          disabled={deleting === mansion.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deleting === mansion.id ? "削除中..." : "削除"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">
              {(page - 1) * 20 + 1}〜{Math.min(page * 20, total)}件 / 全{total}件
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                前へ
              </button>
              <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
