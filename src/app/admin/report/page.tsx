"use client";

import { useState, useEffect, useCallback } from "react";

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SendResult {
  yearMonth: string;
  sent: number;
  total: number;
  errors: string[];
}

export default function ReportAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [sending, setSending]   = useState(false);
  const [adding, setAdding]     = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [errorMsg, setErrorMsg]     = useState("");

  const fetchSubscribers = useCallback(async () => {
    const res = await fetch("/api/report/subscribers");
    const data = await res.json();
    setSubscribers(data);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  async function addSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/report/subscribers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, name }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEmail(""); setName("");
      await fetchSubscribers();
    } catch (err) {
      setErrorMsg(String(err));
    }
    setAdding(false);
  }

  async function removeSubscriber(id: number) {
    await fetch(`/api/report/subscribers/${id}`, { method: "DELETE" });
    await fetchSubscribers();
  }

  async function sendReport() {
    setSending(true);
    setSendResult(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/report/send", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "送信エラー");
      setSendResult(data);
    } catch (err) {
      setErrorMsg(String(err));
    }
    setSending(false);
  }

  const active = subscribers.filter((s) => s.isActive);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">
        📧 月次レポート 配信管理
      </h1>

      {/* 購読者追加フォーム */}
      <section className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">購読者を追加</h2>
        <form onSubmit={addSubscriber} className="flex gap-3 flex-wrap">
          <input
            type="email" required placeholder="メールアドレス"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 min-w-[200px] text-sm"
          />
          <input
            type="text" placeholder="名前（任意）"
            value={name} onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-4 py-2 w-40 text-sm"
          />
          <button
            type="submit" disabled={adding}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {adding ? "追加中..." : "追加"}
          </button>
        </form>
        {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
      </section>

      {/* 購読者一覧 */}
      <section className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          購読者一覧
          <span className="ml-2 text-sm font-normal text-gray-500">
            （アクティブ {active.length}名 / 合計 {subscribers.length}名）
          </span>
        </h2>
        {subscribers.length === 0 ? (
          <p className="text-gray-400 text-sm">購読者が登録されていません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="text-left px-3 py-2">メール</th>
                <th className="text-left px-3 py-2">名前</th>
                <th className="text-center px-3 py-2">状態</th>
                <th className="text-center px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2 text-gray-600">{s.name ?? "—"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      s.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {s.isActive ? "配信中" : "停止"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.isActive && (
                      <button
                        onClick={() => removeSubscriber(s.id)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        配信停止
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* レポート送信 */}
      <section className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">今月のレポートを送信</h2>
        <p className="text-sm text-gray-500 mb-4">
          アクティブな購読者 <strong>{active.length}名</strong> に月次レポートメールを送信します。
          （毎月1日に自動送信されます）
        </p>
        <button
          onClick={sendReport} disabled={sending || active.length === 0}
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {sending ? "送信中..." : "📨 今すぐ送信テスト"}
        </button>

        {sendResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
            <p className="font-semibold text-green-700">✅ 送信完了</p>
            <p>対象月: {sendResult.yearMonth}</p>
            <p>送信数: {sendResult.sent} / {sendResult.total}件</p>
            {sendResult.errors.length > 0 && (
              <p className="text-red-600">エラー: {sendResult.errors.join(", ")}</p>
            )}
          </div>
        )}
      </section>

      {/* 自動送信説明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
        <p className="font-semibold mb-1">🕐 自動送信スケジュール</p>
        <p>Vercel Cron により毎月1日 09:00 (JST) に自動送信されます。</p>
        <p className="mt-1 text-xs text-blue-600">
          設定: <code>vercel.json</code> の crons セクションで制御
        </p>
      </div>
    </div>
  );
}
