#!/usr/bin/env python3
"""
e-uchina.net 物件監視スクレイパー
Playwright使用（JavaScriptレンダリング対応）
"""

import json
import os
import re
import sys
import time
import argparse
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# ─────────────────────────────────────────
# 設定
# ─────────────────────────────────────────
load_dotenv()

LINE_ACCESS_TOKEN = os.getenv("LINE_ACCESS_TOKEN", "")
LINE_USER_ID = os.getenv("LINE_USER_ID", "")
LINE_API_URL = "https://api.line.me/v2/bot/message/push"

URLS = [
    "https://www.e-uchina.net/mansion/nahashi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/urasoeshi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/ginowanshi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/tomigusukushi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/okinawashi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/chatancho?priceHigh=5000",
    "https://www.e-uchina.net/mansion/itomanshi?priceHigh=5000",
    "https://www.e-uchina.net/mansion/nishiharacho?priceHigh=5000",
]

MIN_AREA = 50.0  # 最小専有面積（㎡）
DATA_FILE = Path(__file__).parent / "properties.json"
BASE_URL = "https://www.e-uchina.net"

# ─────────────────────────────────────────
# スクレイピング
# ─────────────────────────────────────────

def extract_price(text: str) -> float | None:
    """価格テキストから数値（万円）を抽出"""
    text = text.replace(",", "").replace(" ", "").replace("\u3000", "")
    m = re.search(r"(\d+(?:\.\d+)?)\s*万円", text)
    if m:
        return float(m.group(1))
    return None


def extract_area(text: str) -> float | None:
    """面積テキストから数値（㎡）を抽出"""
    text = text.replace(",", "").replace(" ", "").replace("\u3000", "")
    m = re.search(r"(\d+(?:\.\d+)?)\s*(?:㎡|m²|ｍ²|m2)", text)
    if m:
        return float(m.group(1))
    return None


def scrape_page(page, url: str, debug: bool = False) -> list[dict]:
    """1ページから物件リストを取得"""
    print(f"  取得中: {url}")
    try:
        page.goto(url, wait_until="networkidle", timeout=30000)
    except PlaywrightTimeoutError:
        print(f"  警告: タイムアウト（部分的に読み込み済みのデータを使用）: {url}")

    if debug:
        dump_path = Path(__file__).parent / "debug_dump.html"
        dump_path.write_text(page.content(), encoding="utf-8")
        print(f"  [DEBUG] HTMLを保存: {dump_path}")

    properties = []

    # ───── セレクタ候補（実際のHTML確認後に更新） ─────
    # e-uchina.net の物件カード候補セレクタ（優先順）
    CARD_SELECTORS = [
        ".item",
        ".bukken-item",
        ".property-item",
        ".list-item",
        "li.item",
        ".object-list li",
        ".property-list li",
        ".search-result li",
        "[class*='item']",
        "[class*='bukken']",
        "[class*='property']",
    ]

    cards = []
    used_selector = None
    for sel in CARD_SELECTORS:
        found = page.query_selector_all(sel)
        if found and len(found) > 0:
            cards = found
            used_selector = sel
            break

    if not cards:
        print(f"  警告: 物件カードが見つかりません: {url}")
        if debug:
            # ページ内の主要なul/liを出力
            all_lists = page.query_selector_all("ul li")
            print(f"  [DEBUG] ul>li の数: {len(all_lists)}")
        return []

    print(f"  セレクタ '{used_selector}' で {len(cards)} 件見つかりました")

    for card in cards:
        prop = extract_property(card, url)
        if prop:
            properties.append(prop)

    return properties


def extract_property(card, page_url: str) -> dict | None:
    """カード要素から物件情報を抽出"""
    try:
        # リンク取得
        link_el = card.query_selector("a[href]")
        if not link_el:
            return None
        href = link_el.get_attribute("href") or ""
        if href.startswith("/"):
            prop_url = BASE_URL + href
        elif href.startswith("http"):
            prop_url = href
        else:
            return None

        # テキスト全体
        full_text = card.inner_text()

        # 物件名（候補セレクタ）
        name = ""
        for sel in [".name", ".bukken-name", ".title", "h2", "h3", "h4",
                    "[class*='name']", "[class*='title']", "dt"]:
            el = card.query_selector(sel)
            if el:
                name = el.inner_text().strip()
                if name:
                    break
        if not name:
            # リンクテキストを物件名とする
            name = link_el.inner_text().strip().split("\n")[0].strip()

        # 価格
        price_val = None
        price_text = ""
        for sel in [".price", ".bukken-price", "[class*='price']",
                    "[class*='kakaku']", "dd"]:
            els = card.query_selector_all(sel)
            for el in els:
                t = el.inner_text()
                v = extract_price(t)
                if v:
                    price_val = v
                    price_text = t.strip()
                    break
            if price_val:
                break
        if price_val is None:
            price_val = extract_price(full_text)
            m = re.search(r"[\d,]+\s*万円", full_text)
            price_text = m.group(0) if m else ""

        # 面積
        area_val = None
        area_text = ""
        for sel in [".area", ".menseki", "[class*='area']", "[class*='menseki']", "dd"]:
            els = card.query_selector_all(sel)
            for el in els:
                t = el.inner_text()
                v = extract_area(t)
                if v:
                    area_val = v
                    area_text = t.strip()
                    break
            if area_val:
                break
        if area_val is None:
            area_val = extract_area(full_text)
            m = re.search(r"[\d.]+\s*(?:㎡|m²|ｍ²|m2)", full_text)
            area_text = m.group(0) if m else ""

        # 所在地
        location = ""
        for sel in [".address", ".location", ".place", "[class*='address']",
                    "[class*='location']", "[class*='chiiki']"]:
            el = card.query_selector(sel)
            if el:
                location = el.inner_text().strip()
                if location:
                    break
        if not location:
            # page_url からエリア名を推測
            area_map = {
                "nahashi": "那覇市",
                "urasoeshi": "浦添市",
                "ginowanshi": "宜野湾市",
                "tomigusukushi": "豊見城市",
                "okinawashi": "沖縄市",
                "chatancho": "北谷町",
                "itomanshi": "糸満市",
                "nishiharacho": "西原町",
            }
            for key, val in area_map.items():
                if key in page_url:
                    location = val
                    break

        return {
            "id": prop_url,  # URLをユニークキーとして使用
            "name": name,
            "price": price_val,
            "price_text": price_text,
            "area": area_val,
            "area_text": area_text,
            "location": location,
            "url": prop_url,
        }

    except Exception as e:
        print(f"  警告: 物件情報抽出エラー: {e}")
        return None


def scrape_all(debug: bool = False) -> dict[str, dict]:
    """全URLをスクレイピングして物件辞書を返す"""
    all_properties = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = context.new_page()

        for url in URLS:
            try:
                props = scrape_page(page, url, debug=debug)
                for prop in props:
                    # 面積フィルタ
                    if prop["area"] is not None and prop["area"] < MIN_AREA:
                        continue
                    all_properties[prop["id"]] = prop
                time.sleep(2)  # サーバー負荷軽減
            except Exception as e:
                print(f"  エラー: {url}: {e}")

        browser.close()

    print(f"合計 {len(all_properties)} 件取得（面積50㎡以上）")
    return all_properties


# ─────────────────────────────────────────
# データ比較
# ─────────────────────────────────────────

def load_previous() -> dict[str, dict]:
    """前回データを読み込む"""
    if not DATA_FILE.exists():
        return {}
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"警告: 前回データ読み込みエラー: {e}")
        return {}


def save_current(properties: dict[str, dict]) -> None:
    """現在データを保存"""
    DATA_FILE.write_text(
        json.dumps(properties, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def compare(prev: dict, curr: dict) -> list[dict]:
    """差分を検出してイベントリストを返す"""
    events = []

    # 新着・価格変更
    for pid, prop in curr.items():
        if pid not in prev:
            events.append({"type": "new", "prop": prop})
        else:
            old = prev[pid]
            if (
                prop["price"] is not None
                and old["price"] is not None
                and prop["price"] != old["price"]
            ):
                events.append({
                    "type": "price_change",
                    "prop": prop,
                    "old_price": old["price"],
                    "old_price_text": old.get("price_text", f"{old['price']}万円"),
                })

    # 削除・成約済み
    for pid, prop in prev.items():
        if pid not in curr:
            events.append({"type": "removed", "prop": prop})

    return events


# ─────────────────────────────────────────
# LINE通知
# ─────────────────────────────────────────

def format_message(events: list[dict]) -> str:
    """イベントリストをLINEメッセージにフォーマット"""
    lines = []
    now = datetime.now().strftime("%Y/%m/%d %H:%M")
    lines.append(f"🔔 物件情報更新（{now}）\n")

    for ev in events:
        prop = ev["prop"]
        name = prop.get("name") or "（名称不明）"
        area = prop.get("area_text") or (f"{prop['area']}㎡" if prop.get("area") else "不明")
        location = prop.get("location") or "不明"
        url = prop.get("url", "")
        price_text = prop.get("price_text") or (f"{prop['price']}万円" if prop.get("price") else "不明")

        if ev["type"] == "new":
            lines.append("🏠 新着物件")
            lines.append(f"物件名: {name}")
            lines.append(f"価格: {price_text}")
            lines.append(f"面積: {area}")
            lines.append(f"場所: {location}")
            lines.append(f"👉 {url}")

        elif ev["type"] == "price_change":
            old_text = ev.get("old_price_text") or f"{ev['old_price']}万円"
            lines.append("💰 価格変更")
            lines.append(f"物件名: {name}")
            lines.append(f"変更: {old_text} → {price_text}")
            lines.append(f"面積: {area}")
            lines.append(f"場所: {location}")
            lines.append(f"👉 {url}")

        elif ev["type"] == "removed":
            lines.append("❌ 掲載終了／成約済み")
            lines.append(f"物件名: {name}")
            lines.append(f"価格: {price_text}")
            lines.append(f"面積: {area}")
            lines.append(f"場所: {location}")
            lines.append(f"👉 {url}")

        lines.append("")  # 空行区切り

    return "\n".join(lines).strip()


def send_line_notification(message: str) -> bool:
    """LINE Messaging APIでメッセージを送信"""
    if not LINE_ACCESS_TOKEN or not LINE_USER_ID:
        print("エラー: LINE_ACCESS_TOKEN または LINE_USER_ID が未設定です")
        return False

    headers = {
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "to": LINE_USER_ID,
        "messages": [{"type": "text", "text": message}],
    }

    try:
        resp = requests.post(LINE_API_URL, headers=headers, json=payload, timeout=10)
        if resp.status_code == 200:
            print("LINE通知: 送信成功")
            return True
        else:
            print(f"LINE通知: 送信失敗 ({resp.status_code}): {resp.text}")
            return False
    except Exception as e:
        print(f"LINE通知: 送信エラー: {e}")
        return False


def send_in_batches(events: list[dict], batch_size: int = 10) -> None:
    """大量の通知はバッチ分割して送信"""
    for i in range(0, len(events), batch_size):
        batch = events[i : i + batch_size]
        msg = format_message(batch)
        send_line_notification(msg)
        if i + batch_size < len(events):
            time.sleep(1)


# ─────────────────────────────────────────
# メイン
# ─────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="e-uchina.net 物件監視スクレイパー")
    parser.add_argument(
        "--debug",
        action="store_true",
        help="デバッグモード: HTMLをdebug_dump.htmlに保存し、通知は送らずログ出力のみ",
    )
    parser.add_argument(
        "--notify-test",
        action="store_true",
        help="LINE通知テスト送信（スクレイピングなし）",
    )
    args = parser.parse_args()

    if args.notify_test:
        test_msg = (
            "🔔 テスト通知\n"
            "🏠 新着物件\n"
            "物件名: テストマンション 3LDK\n"
            "価格: 3,800万円\n"
            "面積: 72㎡\n"
            "場所: 那覇市テスト\n"
            "👉 https://www.e-uchina.net/"
        )
        send_line_notification(test_msg)
        return

    print(f"=== 物件監視スクレイパー 開始: {datetime.now().strftime('%Y/%m/%d %H:%M:%S')} ===")

    # スクレイピング
    current = scrape_all(debug=args.debug)

    if not current:
        print("警告: 物件データを取得できませんでした。セレクタの確認が必要です。")
        print("  --debug オプションで debug_dump.html を確認してください。")
        sys.exit(1)

    # 差分比較
    previous = load_previous()
    events = compare(previous, current)

    print(f"変化: {len(events)} 件")
    for ev in events:
        prop = ev["prop"]
        if ev["type"] == "new":
            print(f"  [新着] {prop.get('name', '?')} {prop.get('price_text', '?')}")
        elif ev["type"] == "price_change":
            print(f"  [価格変更] {prop.get('name', '?')} {ev['old_price']}万円→{prop.get('price', '?')}万円")
        elif ev["type"] == "removed":
            print(f"  [削除] {prop.get('name', '?')}")

    # 通知送信
    if events:
        if args.debug:
            print("\n[DEBUG] 通知内容プレビュー:")
            print("─" * 40)
            # バッチごとにプレビュー
            for i in range(0, len(events), 10):
                print(format_message(events[i : i + 10]))
                print("─" * 40)
        else:
            send_in_batches(events)
    else:
        print("変化なし: 通知なし")

    # データ保存
    save_current(current)
    print(f"=== 完了: {DATA_FILE} に {len(current)} 件保存 ===")


if __name__ == "__main__":
    main()
