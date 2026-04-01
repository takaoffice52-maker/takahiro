/**
 * 月次市場レポート メール生成・送信ライブラリ
 */

import { Resend } from "resend";

export interface MonthlyStats {
  yearMonth: string;       // "2026-03"
  activeCount: number;     // 在庫数
  newCount: number;        // 新着件数
  deletedCount: number;    // 削除件数
  avgPrice: number;        // 平均価格（万円）
  medianPrice: number;     // 中央値（万円）
  avgArea: number;         // 平均面積（㎡）
}

export interface AgencyStats {
  name: string;
  activeCount: number;
  newCount: number;
  deletedCount: number;
  closedCount: number;
  closingRate: number;   // %
  rank: number;
}

export interface AreaStats {
  area: string;
  newCount: number;
  deletedCount: number;
}

export interface ReportData {
  stats: MonthlyStats;
  prevStats?: MonthlyStats;
  topAgencies: AgencyStats[];
  areaComparison: AreaStats[];
}

// ===== HTMLメールテンプレート =====
export function buildEmailHtml(data: ReportData): string {
  const { stats, prevStats, topAgencies, areaComparison } = data;
  const [year, month] = stats.yearMonth.split("-");

  const diff = (current: number, prev?: number) => {
    if (!prev) return "";
    const d = current - prev;
    const color = d > 0 ? "#C00000" : "#70AD47";
    const arrow = d > 0 ? "▲" : "▼";
    return `<span style="color:${color};font-size:11px;">${arrow}${Math.abs(d)}</span>`;
  };

  const agencyRows = topAgencies
    .slice(0, 5)
    .map((a, i) => {
      const medal = ["🥇", "🥈", "🥉"][i] ?? `${a.rank}位`;
      const rateColor = a.closingRate >= 40 ? "#70AD47" : a.closingRate >= 25 ? "#2E75B6" : "#FF9900";
      return `
        <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
          <td style="padding:8px 12px;text-align:center;">${medal}</td>
          <td style="padding:8px 12px;">${a.name}</td>
          <td style="padding:8px 12px;text-align:center;">${a.newCount}</td>
          <td style="padding:8px 12px;text-align:center;">${a.deletedCount}</td>
          <td style="padding:8px 12px;text-align:center;color:${rateColor};font-weight:bold;">${a.closingRate}%</td>
        </tr>`;
    })
    .join("");

  const areaRows = areaComparison
    .map((a, i) => {
      const diff2 = a.newCount - a.deletedCount;
      const diffColor = diff2 >= 0 ? "#70AD47" : "#C00000";
      return `
        <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"}">
          <td style="padding:8px 12px;">${a.area}</td>
          <td style="padding:8px 12px;text-align:center;color:#70AD47;font-weight:bold;">${a.newCount}</td>
          <td style="padding:8px 12px;text-align:center;color:#C00000;font-weight:bold;">${a.deletedCount}</td>
          <td style="padding:8px 12px;text-align:center;color:${diffColor};font-weight:bold;">${diff2 >= 0 ? "+" : ""}${diff2}</td>
        </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>沖縄マンション市場レポート ${year}年${month}月号</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Hiragino Sans','Meiryo',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">

    <!-- ヘッダー -->
    <div style="background:linear-gradient(135deg,#1F4E79,#2E75B6);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
      <p style="color:#fff;opacity:.7;margin:0 0 8px;font-size:13px;">うちなーらいふ 月次市場レポート</p>
      <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:.05em;">
        🏠 沖縄マンション市場<br>${year}年${month}月号
      </h1>
      <p style="color:#BDD7EE;margin:12px 0 0;font-size:12px;">データ更新日: ${stats.yearMonth}-末日</p>
    </div>

    <!-- KPIカード -->
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px;">
      <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid #2E75B6;">
        <p style="margin:0 0 4px;font-size:12px;color:#777;">在庫数</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#1F4E79;">${stats.activeCount.toLocaleString()}<span style="font-size:14px;">件</span></p>
        <p style="margin:4px 0 0;font-size:11px;">${diff(stats.activeCount, prevStats?.activeCount)} 前月比</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid #70AD47;">
        <p style="margin:0 0 4px;font-size:12px;color:#777;">新着物件</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#70AD47;">${stats.newCount}<span style="font-size:14px;">件</span></p>
        <p style="margin:4px 0 0;font-size:11px;">${diff(stats.newCount, prevStats?.newCount)} 前月比</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid #C00000;">
        <p style="margin:0 0 4px;font-size:12px;color:#777;">掲載削除（成約含む）</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#C00000;">${stats.deletedCount}<span style="font-size:14px;">件</span></p>
        <p style="margin:4px 0 0;font-size:11px;">${diff(stats.deletedCount, prevStats?.deletedCount)} 前月比</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.07);border-left:4px solid #FF9900;">
        <p style="margin:0 0 4px;font-size:12px;color:#777;">平均価格</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#FF9900;">${stats.avgPrice.toLocaleString()}<span style="font-size:14px;">万円</span></p>
        <p style="margin:4px 0 0;font-size:11px;">${diff(stats.avgPrice, prevStats?.avgPrice)} 前月比</p>
      </div>
    </div>

    <!-- 業者ランキング -->
    <div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.07);margin-bottom:24px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#1F4E79;border-bottom:2px solid #2E75B6;padding-bottom:8px;">
        🏆 業者別 成約率ランキング（${month}月）
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#1F4E79;color:#fff;">
            <th style="padding:10px 12px;">順位</th>
            <th style="padding:10px 12px;text-align:left;">業者名</th>
            <th style="padding:10px 12px;">新着掲載</th>
            <th style="padding:10px 12px;">削除件数</th>
            <th style="padding:10px 12px;">成約率</th>
          </tr>
        </thead>
        <tbody>${agencyRows}</tbody>
      </table>
      <p style="margin:12px 0 0;font-size:11px;color:#999;">※ 成約率 = 削除件数のうち「成約」扱いの割合</p>
    </div>

    <!-- エリア別新着・削除 -->
    <div style="background:#fff;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.07);margin-bottom:24px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#1F4E79;border-bottom:2px solid #2E75B6;padding-bottom:8px;">
        📍 エリア別 新着・削除 比較（${month}月）
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#1F4E79;color:#fff;">
            <th style="padding:10px 12px;text-align:left;">エリア</th>
            <th style="padding:10px 12px;">新着</th>
            <th style="padding:10px 12px;">削除</th>
            <th style="padding:10px 12px;">差引(±)</th>
          </tr>
        </thead>
        <tbody>${areaRows}</tbody>
      </table>
    </div>

    <!-- 分析コメント -->
    <div style="background:#FFF8E8;border-radius:10px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.07);margin-bottom:24px;border-left:4px solid #FF9900;">
      <h2 style="margin:0 0 12px;font-size:15px;color:#1F4E79;">💡 今月のポイント</h2>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#333;line-height:2;">
        <li>在庫数は前月比微増。市場への供給は安定して続いています。</li>
        <li>成約率トップ業者は<strong>${topAgencies[0]?.name ?? "—"}</strong>（成約率 ${topAgencies[0]?.closingRate ?? "—"}%）。</li>
        <li>新着数が削除数を上回るエリアは在庫積み上がりに注意が必要です。</li>
      </ul>
    </div>

    <!-- フッター -->
    <div style="text-align:center;padding:16px;font-size:11px;color:#aaa;">
      <p style="margin:0 0 4px;">うちなーらいふ（e-uchina.net）月次マーケットレポート</p>
      <p style="margin:0 0 4px;">配信停止をご希望の場合は <a href="{{UNSUBSCRIBE_URL}}" style="color:#2E75B6;">こちら</a></p>
      <p style="margin:0;">© ${new Date().getFullYear()} うちなーらいふ. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ===== メール送信 =====
export async function sendMonthlyReport(
  recipients: { email: string; name?: string | null }[],
  data: ReportData
): Promise<{ success: boolean; sent: number; errors: string[] }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const [year, month] = data.stats.yearMonth.split("-");
  const subject = `🏠 沖縄マンション市場レポート ${year}年${month}月号`;
  const html = buildEmailHtml(data);

  const errors: string[] = [];
  let sent = 0;

  // Resendの無料枠は1通ずつ送信（バッチAPIはPro以上）
  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from: process.env.REPORT_FROM_EMAIL ?? "noreply@e-uchina.net",
        to:   recipient.email,
        subject,
        html: html.replace("{{UNSUBSCRIBE_URL}}", `${process.env.NEXT_PUBLIC_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}`),
      });
      sent++;
    } catch (err) {
      errors.push(`${recipient.email}: ${String(err)}`);
    }
  }

  return { success: errors.length === 0, sent, errors };
}
