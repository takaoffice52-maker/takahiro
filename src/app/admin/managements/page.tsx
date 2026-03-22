"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { MansionManagement, PaginatedResponse } from "@/types";
import { formatFee, formatBoolean } from "@/lib/utils";

export default function AdminManagementsPage() {
  const [managements, setManagements] = useState<MansionManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchManagements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const res = await fetch(`/api/managements?${params}`);
      const data: PaginatedResponse<MansionManagement> = await res.json();
      setManagements(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      console.error("Failed to fetch managements");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchManagements();
  }, [fetchManagements]);

  const handleDelete = async (id: number) => {
    if (!confirm("この管理情報を削除しますか？")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/managements/${id}`, { method: "DELETE" });
      if (res.ok) fetchManagements();
      else alert("削除に失敗しました");
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
          <h1 className="text-2xl font-bold text-gray-900">管理情報</h1>
          <p className="text-gray-500 mt-1">全{total}件</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
        管理情報はマンションの編集画面や詳細ページで確認できます。各マンション編集画面から管理情報を更新してください。
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">読み込み中...</div>
          </div>
        ) : managements.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>管理情報がありません</p>
            <p className="text-sm mt-2">
              <Link href="/admin/mansions" className="text-blue-600 hover:underline">マンション管理</Link>
              から各マンションの管理情報を登録してください
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">マンション</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理会社</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理形態</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">管理費</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">修繕積立金</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ペット</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">駐車場</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {managements.map((mgmt) => {
                  const mgmtWithMansion = mgmt as MansionManagement & {
                    mansion?: { id: number; name: string; slug: string; address: string; city: string };
                  };
                  return (
                    <tr key={mgmt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {mgmtWithMansion.mansion ? (
                          <Link
                            href={`/admin/mansions/${mgmtWithMansion.mansion.id}/edit`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {mgmtWithMansion.mansion.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">ID: {mgmt.mansionId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{mgmt.managementCompany || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{mgmt.managementStyle || "-"}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {formatFee(mgmt.monthlyManagementFee)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {formatFee(mgmt.monthlyRepairReserveFee)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatBoolean(mgmt.petAllowed)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatBoolean(mgmt.parkingAvailable)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(mgmt.id)}
                          disabled={deleting === mgmt.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          {deleting === mgmt.id ? "削除中..." : "削除"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
