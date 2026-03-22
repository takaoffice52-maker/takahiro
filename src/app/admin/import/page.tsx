"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type ImportType = "mansions" | "sales" | "transactions" | "managements";
type ImportResult = {
  success: boolean;
  imported: number;
  total: number;
  errors: string[];
};

const IMPORT_TYPES: { value: ImportType; label: string; description: string }[] = [
  {
    value: "mansions",
    label: "マンション情報",
    description: "マンション棟の基本情報を一括インポートします",
  },
  {
    value: "sales",
    label: "販売中物件",
    description: "販売中の住戸情報を一括インポートします",
  },
  {
    value: "transactions",
    label: "成約事例",
    description: "過去の成約価格データを一括インポートします",
  },
  {
    value: "managements",
    label: "管理情報",
    description: "管理費・管理会社などの情報を一括インポートします",
  },
];

const CSV_TEMPLATES: Record<ImportType, { headers: string; example: string }> = {
  mansions: {
    headers: "name,nameKana,address,city,areaName,builtYearMonth,builtYear,ageYears,totalUnits,floors,structureText,landRights,developer,constructor,accessInfo,layoutTypes,parkingInfo,description",
    example: '那覇パークレジデンス,ナハパークレジデンス,沖縄県那覇市おもろまち2丁目1-1,那覇市,おもろまち,2015-03,2015,10,120,15,鉄筋コンクリート造 15階建,所有権,沖縄不動産開発,琉球建設,ゆいレール「おもろまち駅」徒歩5分,"1LDK,2LDK,3LDK",敷地内駐車場あり,那覇市おもろまちの高級マンション',
  },
  sales: {
    headers: "mansionId,roomNumber,floorNumber,layout,exclusiveArea,balconyArea,direction,price,pricePerTsubo,status,listingSourceName",
    example: "1,501,5,2LDK,62.50,8.20,南,3200,170,for_sale,SUUMO",
  },
  transactions: {
    headers: "mansionId,contractYearMonth,floorNumber,layout,exclusiveArea,contractPriceMin,contractPriceMax,pricePerTsuboMin,pricePerTsuboMax,sourceName,notes",
    example: "1,2024-10,3,2LDK,62.50,2900,3100,154,165,国土交通省取引価格情報,",
  },
  managements: {
    headers: "mansionId,managementCompany,managementStyle,monthlyManagementFee,monthlyRepairReserveFee,petAllowed,parkingAvailable,notes",
    example: "1,那覇マンション管理,全部委託,15000,8000,1,1,管理状態良好",
  },
};

export default function AdminImportPage() {
  const [importType, setImportType] = useState<ImportType>("mansions");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("CSVファイルを選択してください");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("ファイルを選択してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "インポートに失敗しました");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "インポートに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = CSV_TEMPLATES[importType];
    const content = `${template.headers}\n${template.example}`;
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_${importType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          ← ダッシュボード
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">データインポート</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Import type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">インポート種別を選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {IMPORT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setImportType(t.value); setFile(null); setResult(null); setError(null); }}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    importType === t.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{t.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">CSVファイルをアップロード</h2>
              <button
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                テンプレートをDL
              </button>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                className="hidden"
              />
              {file ? (
                <div>
                  <div className="text-3xl mb-2">📄</div>
                  <div className="font-medium text-gray-900">{file.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-red-600 hover:underline mt-2 inline-block"
                  >
                    ファイルを変更
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3 text-gray-300">📁</div>
                  <p className="text-gray-600 font-medium">クリックまたはドロップでファイルを選択</p>
                  <p className="text-sm text-gray-400 mt-1">CSVファイル（.csv）のみ</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="mt-4 btn-primary w-full disabled:opacity-50"
            >
              {loading ? "インポート中..." : "インポート実行"}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl shadow-sm border p-6 ${
              result.errors.length === 0
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <h2 className="text-lg font-semibold mb-4">
                {result.errors.length === 0 ? "インポート完了！" : "インポート完了（一部エラーあり）"}
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{result.total}</div>
                  <div className="text-sm text-gray-500">合計行数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{result.imported}</div>
                  <div className="text-sm text-gray-500">成功</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{result.total - result.imported}</div>
                  <div className="text-sm text-gray-500">エラー</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">エラー詳細：</h3>
                  <ul className="text-sm text-red-700 space-y-1 max-h-48 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <li key={i} className="bg-red-100 rounded px-2 py-1">{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Link href={`/admin/${importType === "mansions" ? "mansions" : importType}`} className="btn-primary text-sm">
                  データを確認する
                </Link>
                <button
                  onClick={() => { setFile(null); setResult(null); }}
                  className="btn-secondary text-sm"
                >
                  続けてインポート
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right - guide */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">CSVフォーマット</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>選択した種別のテンプレートをダウンロードして、データを入力してください。</p>
              <div>
                <p className="font-medium text-gray-800 mb-1">必須列（mansions）:</p>
                <ul className="text-xs space-y-0.5 text-gray-500">
                  <li>• name（マンション名）</li>
                  <li>• address（所在地）</li>
                  <li>• city（市区町村）</li>
                  <li>• areaName（エリア名）</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-800 mb-1">必須列（sales/transactions）:</p>
                <ul className="text-xs space-y-0.5 text-gray-500">
                  <li>• mansionId（マンションID）</li>
                  <li>※ mansionNameでも検索可能</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">注意事項</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-yellow-500 shrink-0">⚠</span>
                1行目はヘッダー行として扱われます
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-500 shrink-0">⚠</span>
                文字コードはUTF-8を推奨します
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-500 shrink-0">⚠</span>
                既存データとの重複チェックはslugで行います
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 shrink-0">ℹ</span>
                エラーが発生した行はスキップされ、成功した行のみ登録されます
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">ヘッダー例</h3>
            <div className="bg-gray-50 rounded-md p-3 overflow-x-auto">
              <code className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                {CSV_TEMPLATES[importType].headers}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
