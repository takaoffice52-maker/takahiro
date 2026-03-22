"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CITIES = [
  "那覇市",
  "浦添市",
  "沖縄市",
  "宜野湾市",
  "豊見城市",
  "うるま市",
  "南城市",
  "糸満市",
  "石垣市",
  "名護市",
  "北谷町",
  "読谷村",
  "中城村",
  "西原町",
  "与那原町",
  "南風原町",
];

const LAYOUTS = ["1K", "1LDK", "2LDK", "3LDK", "4LDK以上"];

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [layout, setLayout] = useState(searchParams.get("layout") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") || "");
  const [builtYearFrom, setBuiltYearFrom] = useState(searchParams.get("builtYearFrom") || "");

  useEffect(() => {
    setCity(searchParams.get("city") || "");
    setKeyword(searchParams.get("keyword") || "");
    setLayout(searchParams.get("layout") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setMinArea(searchParams.get("minArea") || "");
    setMaxArea(searchParams.get("maxArea") || "");
    setBuiltYearFrom(searchParams.get("builtYearFrom") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (keyword) params.set("keyword", keyword);
    if (layout) params.set("layout", layout);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);
    if (builtYearFrom) params.set("builtYearFrom", builtYearFrom);
    params.set("page", "1");
    router.push(`/mansions?${params.toString()}`);
  };

  const handleReset = () => {
    setCity("");
    setKeyword("");
    setLayout("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBuiltYearFrom("");
    router.push("/mansions");
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">条件で絞り込む</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Keyword */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="form-label">キーワード</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="マンション名、エリア名など"
            className="form-input"
          />
        </div>

        {/* City */}
        <div>
          <label className="form-label">市区町村</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="form-input"
          >
            <option value="">すべて</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Layout */}
        <div>
          <label className="form-label">間取り</label>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="form-input"
          >
            <option value="">すべて</option>
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Built Year */}
        <div>
          <label className="form-label">築年数（以降）</label>
          <select
            value={builtYearFrom}
            onChange={(e) => setBuiltYearFrom(e.target.value)}
            className="form-input"
          >
            <option value="">指定なし</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}年以降</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div>
          <label className="form-label">価格（万円）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="下限"
              min="0"
              className="form-input"
            />
            <span className="text-gray-400 text-sm">〜</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="上限"
              min="0"
              className="form-input"
            />
          </div>
        </div>

        {/* Area range */}
        <div>
          <label className="form-label">専有面積（㎡）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              placeholder="下限"
              min="0"
              step="0.01"
              className="form-input"
            />
            <span className="text-gray-400 text-sm">〜</span>
            <input
              type="number"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              placeholder="上限"
              min="0"
              step="0.01"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="btn-primary flex-1 sm:flex-none sm:px-8"
        >
          検索する
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary"
        >
          リセット
        </button>
      </div>
    </form>
  );
}
