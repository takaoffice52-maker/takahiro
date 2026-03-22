"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Mansion } from "@/types";

type FormData = {
  name: string;
  nameKana: string;
  address: string;
  areaName: string;
  city: string;
  latitude: string;
  longitude: string;
  landRights: string;
  totalUnits: string;
  builtYearMonth: string;
  builtYear: string;
  ageYears: string;
  developer: string;
  constructorName: string;
  accessInfo: string;
  schoolDistrict: string;
  zoning: string;
  structureText: string;
  floors: string;
  parkingInfo: string;
  layoutTypes: string;
  description: string;
  featuredImageUrl: string;
  isPublished: boolean;
};

export default function AdminMansionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mansionId, setMansionId] = useState<string | null>(null);
  const [mansion, setMansion] = useState<Mansion | null>(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(searchParams.get("created") === "1");

  useEffect(() => {
    params.then(({ id }) => setMansionId(id));
  }, [params]);

  useEffect(() => {
    if (!mansionId) return;

    const fetchMansion = async () => {
      try {
        const res = await fetch(`/api/mansions/${mansionId}`);
        if (!res.ok) throw new Error("Not found");
        const data: Mansion = await res.json();
        setMansion(data);
        setForm({
          name: data.name || "",
          nameKana: data.nameKana || "",
          address: data.address || "",
          areaName: data.areaName || "",
          city: data.city || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          landRights: data.landRights || "",
          totalUnits: data.totalUnits?.toString() || "",
          builtYearMonth: data.builtYearMonth || "",
          builtYear: data.builtYear?.toString() || "",
          ageYears: data.ageYears?.toString() || "",
          developer: data.developer || "",
          constructorName: data.constructorName || "",
          accessInfo: data.accessInfo || "",
          schoolDistrict: data.schoolDistrict || "",
          zoning: data.zoning || "",
          structureText: data.structureText || "",
          floors: data.floors?.toString() || "",
          parkingInfo: data.parkingInfo || "",
          layoutTypes: data.layoutTypes || "",
          description: data.description || "",
          featuredImageUrl: data.featuredImageUrl || "",
          isPublished: data.isPublished,
        });
      } catch {
        setError("マンション情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchMansion();
  }, [mansionId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => prev && { ...prev, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm((prev) => prev && { ...prev, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !mansionId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/mansions/${mansionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新に失敗しました");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (!mansion || !form) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">マンションが見つかりません</p>
        <Link href="/admin/mansions" className="btn-primary mt-4 inline-block">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/mansions" className="text-gray-500 hover:text-gray-700">
          ← マンション管理
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{mansion.name}を編集</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6">
          {searchParams.get("created") === "1" ? "マンションを登録しました！" : "更新しました！"}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">基本情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">マンション名 <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">フリガナ</label>
              <input type="text" name="nameKana" value={form.nameKana} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">市区町村 <span className="text-red-500">*</span></label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">所在地 <span className="text-red-500">*</span></label>
              <input type="text" name="address" value={form.address} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">エリア名 <span className="text-red-500">*</span></label>
              <input type="text" name="areaName" value={form.areaName} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">交通アクセス</label>
              <input type="text" name="accessInfo" value={form.accessInfo} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">緯度</label>
              <input type="number" name="latitude" value={form.latitude} onChange={handleChange} step="any" className="form-input" />
            </div>
            <div>
              <label className="form-label">経度</label>
              <input type="number" name="longitude" value={form.longitude} onChange={handleChange} step="any" className="form-input" />
            </div>
          </div>
        </div>

        {/* Building info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">建物情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">築年月</label>
              <input type="text" name="builtYearMonth" value={form.builtYearMonth} onChange={handleChange} placeholder="例：2015-03" className="form-input" />
            </div>
            <div>
              <label className="form-label">築年</label>
              <input type="number" name="builtYear" value={form.builtYear} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">築年数</label>
              <input type="number" name="ageYears" value={form.ageYears} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">総戸数</label>
              <input type="number" name="totalUnits" value={form.totalUnits} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">階数</label>
              <input type="number" name="floors" value={form.floors} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">土地権利</label>
              <input type="text" name="landRights" value={form.landRights} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">構造</label>
              <input type="text" name="structureText" value={form.structureText} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">間取りタイプ</label>
              <input type="text" name="layoutTypes" value={form.layoutTypes} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">用途地域</label>
              <input type="text" name="zoning" value={form.zoning} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">デベロッパー</label>
              <input type="text" name="developer" value={form.developer} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">施工会社</label>
              <input type="text" name="constructorName" value={form.constructorName} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">学区</label>
              <input type="text" name="schoolDistrict" value={form.schoolDistrict} onChange={handleChange} className="form-input" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="form-label">駐車場情報</label>
              <input type="text" name="parkingInfo" value={form.parkingInfo} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">紹介文・画像</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">紹介文</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="form-input" />
            </div>
            <div>
              <label className="form-label">メイン画像URL</label>
              <input type="url" name="featuredImageUrl" value={form.featuredImageUrl} onChange={handleChange} className="form-input" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">公開する</label>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">関連データ</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/mansions/${mansion.slug}`}
              target="_blank"
              className="btn-secondary text-sm"
            >
              公開ページを表示
            </Link>
            <Link
              href={`/admin/sales?mansionId=${mansion.id}`}
              className="btn-secondary text-sm"
            >
              販売中物件を管理
            </Link>
            <Link
              href={`/admin/transactions?mansionId=${mansion.id}`}
              className="btn-secondary text-sm"
            >
              成約事例を管理
            </Link>
            <Link
              href={`/admin/managements?mansionId=${mansion.id}`}
              className="btn-secondary text-sm"
            >
              管理情報を確認
            </Link>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? "更新中..." : "変更を保存"}
          </button>
          <Link href="/admin/mansions" className="btn-secondary">
            一覧に戻る
          </Link>
        </div>
      </form>
    </div>
  );
}
