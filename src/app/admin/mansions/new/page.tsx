"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const INITIAL_FORM: FormData = {
  name: "",
  nameKana: "",
  address: "",
  areaName: "",
  city: "",
  latitude: "",
  longitude: "",
  landRights: "",
  totalUnits: "",
  builtYearMonth: "",
  builtYear: "",
  ageYears: "",
  developer: "",
  constructorName: "",
  accessInfo: "",
  schoolDistrict: "",
  zoning: "",
  structureText: "",
  floors: "",
  parkingInfo: "",
  layoutTypes: "",
  description: "",
  featuredImageUrl: "",
  isPublished: true,
};

export default function AdminMansionNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mansions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "登録に失敗しました");
      }

      const mansion = await res.json();
      router.push(`/admin/mansions/${mansion.id}/edit?created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/mansions" className="text-gray-500 hover:text-gray-700">
          ← マンション管理
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">マンションを追加</h1>
      </div>

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
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="例：那覇パークレジデンス"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">フリガナ</label>
              <input
                type="text"
                name="nameKana"
                value={form.nameKana}
                onChange={handleChange}
                placeholder="例：ナハパークレジデンス"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">市区町村 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="例：那覇市"
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">所在地 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="例：沖縄県那覇市おもろまち2丁目1-1"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">エリア名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="areaName"
                value={form.areaName}
                onChange={handleChange}
                required
                placeholder="例：おもろまち"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">交通アクセス</label>
              <input
                type="text"
                name="accessInfo"
                value={form.accessInfo}
                onChange={handleChange}
                placeholder="例：ゆいレール「おもろまち駅」徒歩5分"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">緯度</label>
              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                step="any"
                placeholder="例：26.2172"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">経度</label>
              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                step="any"
                placeholder="例：127.6814"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Building info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">建物情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="form-label">築年月</label>
              <input
                type="text"
                name="builtYearMonth"
                value={form.builtYearMonth}
                onChange={handleChange}
                placeholder="例：2015-03"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">築年</label>
              <input
                type="number"
                name="builtYear"
                value={form.builtYear}
                onChange={handleChange}
                placeholder="例：2015"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">築年数</label>
              <input
                type="number"
                name="ageYears"
                value={form.ageYears}
                onChange={handleChange}
                placeholder="例：10"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">総戸数</label>
              <input
                type="number"
                name="totalUnits"
                value={form.totalUnits}
                onChange={handleChange}
                placeholder="例：120"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">階数</label>
              <input
                type="number"
                name="floors"
                value={form.floors}
                onChange={handleChange}
                placeholder="例：15"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">土地権利</label>
              <input
                type="text"
                name="landRights"
                value={form.landRights}
                onChange={handleChange}
                placeholder="例：所有権"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">構造</label>
              <input
                type="text"
                name="structureText"
                value={form.structureText}
                onChange={handleChange}
                placeholder="例：鉄筋コンクリート造 15階建"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">間取りタイプ</label>
              <input
                type="text"
                name="layoutTypes"
                value={form.layoutTypes}
                onChange={handleChange}
                placeholder="例：1LDK, 2LDK, 3LDK"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">用途地域</label>
              <input
                type="text"
                name="zoning"
                value={form.zoning}
                onChange={handleChange}
                placeholder="例：第一種中高層住居専用地域"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">デベロッパー</label>
              <input
                type="text"
                name="developer"
                value={form.developer}
                onChange={handleChange}
                placeholder="例：沖縄不動産開発"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">施工会社</label>
              <input
                type="text"
                name="constructorName"
                value={form.constructorName}
                onChange={handleChange}
                placeholder="例：琉球建設"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">学区</label>
              <input
                type="text"
                name="schoolDistrict"
                value={form.schoolDistrict}
                onChange={handleChange}
                placeholder="例：おもろまち小学校区"
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="form-label">駐車場情報</label>
              <input
                type="text"
                name="parkingInfo"
                value={form.parkingInfo}
                onChange={handleChange}
                placeholder="例：敷地内駐車場あり（月額8,000円）"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Description and image */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">紹介文・画像</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">紹介文</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="マンションの特徴や魅力を入力してください"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">メイン画像URL</label>
              <input
                type="url"
                name="featuredImageUrl"
                value={form.featuredImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="form-input"
              />
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
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                公開する
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "登録中..." : "マンションを登録"}
          </button>
          <Link href="/admin/mansions" className="btn-secondary">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
