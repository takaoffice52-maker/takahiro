#!/usr/bin/env python3
"""
e-uchina.net 不動産物件監視スクリプト
- Playwright (JS対応) でスクレイピング
- 新着/価格変更/掲載終了を検知してLINE通知
- 30分ごとにcronで実行
"""
import json
import sys
import os
import re
import argparse
import logging
from datetime import datetime
from pathlib import Path
# --- 設定 ---
BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / "properties.json"
LOG_FILE = BASE_DIR / "scraper.log"
LINE_ACCESS_TOKEN = os.environ.get("LINE_ACCESS_TOKEN", "HJDR3GCHnP5i4Et6S7pIyvUV5u7VNyb3cfL5nndQlUKU+ltgNvnG3xQLtdV7qxglVDib7/ShOKdwRAnU3Rjl976YvNllZ8YbEVYZNQvVA8jWbdwNyM9YB+SJwPUOd8KNS/SNTasJZ2oXloIs2+WlswdB04t89/1O/w1cDnyilFU=")
LINE_USER_ID = os.environ.get("LINE_USER_ID", "U58eb97f473a640fe4c71fe42fef0be1a")
MIN_AREA_M2 = 50
URLS = [
    ("那覇市",   "https://www.e-uchina.net/mansion/nahashi?priceHigh=5000"),
    ("浦添市",   "https://www.e-uchina.net/mansion/urasoeshi?priceHigh=5000"),
    ("宜野湾市", "https://www.e-uchina.net/mansion/ginowanshi?priceHigh=5000"),
    ("豊見城市", "https://www.e-uchina.net/mansion/tomigusukushi?priceHigh=5000"),
    ("沖縄市",   "https://www.e-uchina.net/mansion/okinawashi?priceHigh=5000"),
    ("北谷町",   "https://www.e-uchina.net/mansion/chatancho?priceHigh=5000"),
    ("糸満市",   "https://www.e-uchina.net/mansion/itomanshi?priceHigh=5000"),
    ("西原町",   "https://www.e-uchina.net/mansion/nishiharacho?priceHigh=5000"),
]
def setup_logging(debug=False):
    level = logging.DEBUG if debug else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
logger = logging.getLogger(__name__)
def load_data() -> dict:
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"データファイル読み込みエラー: {e}")
    return {}
def save_data(data: dict):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
def parse_price(price_text: str) -> float | None:
    text = price_text.replace(",", "").replace(" ", "")
    m = re.search(r"([\d.]+)万円", text)
    if m:
        return float(m.group(1))
    return None
def parse_area(area_text: str) -> float | None:
    text = area_text.replace(",", "").replace(" ", "")
    m = re.search(r"([\d.]+)[㎡m²]", text)
    if m:
        return float(m.group(1))
    return None
def scrape_with_playwright(url: str, location: str, debug: bool = False) -> list[dict]:
    from playwright.sync_api import sync_playwright
    properties = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_selector("ul.objectList > li", timeout=15000)
            items = page.query_selector_all("ul.objectList > li")
            for item in items:
                try:
                    link_el = item.query_selector("a[href*='/bukken/']")
                    if not link_el:
                        continue
                    href = link_el.get_attribute("href") or ""
                    if not href.startswith("http"):
                        href = "https://www.e-uchina.net" + href
                    name = link_el.inner_text().strip() or "不明"
                    price_el = item.query_selector("span.price")
                    price_text = price_el.inner_text().strip() if price_el else ""
                    price = parse_price(price_text)
                    area_el = item.query_selector("span.menseki")
                    area_text = area_el.inner_text().strip() if area_el else ""
                    area = parse_area(area_text)
                    if area is not None and area < MIN_AREA_M2:
                        continue
                    prop_id = href.split("/bukken/")[-1].split("?")[0].strip("/")
                    prop = {
                        "id": prop_id,
                        "name": name,
                        "price": price,
                        "price_text": price_text,
                        "area": area,
                        "area_text": area_text,
                        "location": location,
                        "url": href,
                        "first_seen": datetime.now().isoformat(),
                    }
                    properties.append(prop)
                except Exception as e:
                    logger.warning(f"item解析エラー: {e}")
        except Exception as e:
            logger.error(f"ページ取得エラー({url}): {e}")
        finally:
            browser.close()
    return properties
def scrape_with_requests(url: str, location: str, debug: bool = False) -> list[dict]:
    import requests
    from bs4 import BeautifulSoup
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    properties = []
    try:
        r = requests.get(url, headers=headers, timeout=20)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "lxml")
        items = soup.select("ul.objectList > li")
        for item in items:
            try:
                link_el = item.select_one("a[href*='/bukken/']")
                if not link_el:
                    continue
                href = link_el.get("href", "")
                if not href.startswith("http"):
                    href = "https://www.e-uchina.net" + href
                name = link_el.get_text(strip=True) or "不明"
                price_el = item.select_one("span.price")
                price_text = price_el.get_text(strip=True) if price_el else ""
                price = parse_price(price_text)
                area_el = item.select_one("span.menseki")
                area_text = area_el.get_text(strip=True) if area_el else ""
                area = parse_area(area_text)
                if area is not None and area < MIN_AREA_M2:
                    continue
                prop_id = href.split("/bukken/")[-1].split("?")[0].strip("/")
                prop = {
                    "id": prop_id,
                    "name": name,
                    "price": price,
                    "price_text": price_text,
                    "area": area,
                    "area_text": area_text,
                    "location": location,
                    "url": href,
                    "first_seen": datetime.now().isoformat(),
                }
                properties.append(prop)
            except Exception as e:
                logger.warning(f"item解析エラー: {e}")
    except Exception as e:
        logger.error(f"ページ取得エラー({url}): {e}")
    return properties
def scrape_url(url: str, location: str, debug: bool = False) -> list[dict]:
    try:
        import playwright
        return scrape_with_playwright(url, location, debug)
    except ImportError:
        logger.warning("Playwright未インストール、requestsにフォールバック")
    except Exception as e:
        logger.warning(f"Playwrightエラー: {e}, requestsにフォールバック")
    return scrape_with_requests(url, location, debug)
def send_line(message: str):
    import requests
    url = "https://api.line.me/v2/bot/message/push"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
    }
    payload = {"to": LINE_USER_ID, "messages": [{"type": "text", "text": message}]}
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=10)
        if r.status_code == 200:
            logger.info("LINE通知 送信成功")
        else:
            logger.warning(f"LINE通知 失敗: {r.status_code} {r.text[:200]}")
    except Exception as e:
        logger.error(f"LINE通知 エラー: {e}")
def format_new(prop):
    return f"🏠 新着物件\n物件名: {prop['name']}\n価格: {prop['price_text']}\n面積: {prop['area_text']}\n場所: {prop['location']}\n👉 {prop['url']}"
def format_price_change(prop, old_price_text):
    return f"💰 価格変更\n物件名: {prop['name']}\n価格: {old_price_text} → {prop['price_text']}\n面積: {prop['area_text']}\n場所: {prop['location']}\n👉 {prop['url']}"
def format_delisted(prop):
    return f"❌ 掲載終了/成約済み\n物件名: {prop['name']}\n価格: {prop['price_text']}\n場所: {prop['location']}\n👉 {prop['url']}"
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--no-notify", action="store_true")
    args = parser.parse_args()
    setup_logging(debug=args.debug)
    logger.info("=" * 60)
    logger.info(f"スクレイピング開始: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    old_data = load_data()
    all_current = {}
    total_found = 0
    for location, url in URLS:
        logger.info(f"[{location}] スクレイピング中...")
        props = scrape_url(url, location, debug=args.debug)
        logger.info(f"  {location}: {len(props)}件取得")
        total_found += len(props)
        for p in props:
            all_current[p["id"]] = p
    logger.info(f"合計取得件数: {total_found}件")
    notifications = []
    for pid, prop in all_current.items():
        if pid not in old_data:
            logger.info(f"[新着] {prop['name']} / {prop['price_text']}")
            notifications.append(("new", prop, None))
        else:
            old = old_data[pid]
            if prop["price"] != old.get("price") and prop["price"] is not None:
                logger.info(f"[価格変更] {prop['name']}: {old.get('price_text','?')} → {prop['price_text']}")
                notifications.append(("price", prop, old.get("price_text", "?")))
    for pid, old_prop in old_data.items():
        if pid not in all_current and not old_prop.get("delisted"):
            logger.info(f"[掲載終了] {old_prop['name']}")
            notifications.append(("delisted", old_prop, None))
            old_prop["delisted"] = True
            all_current[pid] = old_prop
    if notifications and not args.no_notify:
        for ntype, prop, extra in notifications:
            if ntype == "new":
                msg = format_new(prop)
            elif ntype == "price":
                msg = format_price_change(prop, extra)
            else:
                msg = format_delisted(prop)
            send_line(msg)
    elif not notifications:
        logger.info("変化なし。通知不要。")
    save_data(all_current)
    logger.info(f"スクレイピング終了: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)
    return total_found
if __name__ == "__main__":
    found = main()
    sys.exit(0 if found >= 0 else 1)
