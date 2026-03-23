#!/usr/bin/env python3
"""
セレクタ確認ツール
実際のHTML構造を調べてscraper.pyのセレクタを調整するために使用する
"""

import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.e-uchina.net/mansion/nahashi?priceHigh=5000"
OUTPUT = Path(__file__).parent / "debug_dump.html"


def main():
    print(f"URL: {URL}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()
        page.goto(URL, wait_until="networkidle", timeout=30000)

        html = page.content()
        OUTPUT.write_text(html, encoding="utf-8")
        print(f"HTMLを保存しました: {OUTPUT} ({len(html)} bytes)")

        # よくあるセレクタを試す
        candidates = [
            ".item", ".bukken-item", ".property-item",
            ".list-item", "li.item", ".object-list li",
            ".property-list li", ".search-result li",
            "article", ".card", ".listing",
            "[class*='item']", "[class*='bukken']", "[class*='property']",
            "[class*='listing']", "[class*='object']",
        ]

        print("\n--- セレクタ候補の調査 ---")
        for sel in candidates:
            els = page.query_selector_all(sel)
            if els:
                print(f"  {sel!r}: {len(els)} 件")
                if len(els) <= 5:
                    for i, el in enumerate(els[:3]):
                        t = el.inner_text()[:80].replace("\n", " ").strip()
                        print(f"    [{i}] {t}")

        # ul/li の構造調査
        print("\n--- ul > li 構造 ---")
        uls = page.query_selector_all("ul")
        for ul in uls[:10]:
            lis = ul.query_selector_all("li")
            if len(lis) >= 2:
                cls = ul.get_attribute("class") or "(no class)"
                iid = ul.get_attribute("id") or "(no id)"
                print(f"  ul.class={cls!r} id={iid!r}: {len(lis)} li要素")

        # 価格・面積テキストの調査
        print("\n--- 価格テキストを含む要素 ---")
        price_els = page.query_selector_all("*")
        count = 0
        for el in price_els:
            try:
                t = el.inner_text()
                if "万円" in t and len(t) < 50:
                    cls = el.get_attribute("class") or ""
                    tag = el.evaluate("el => el.tagName")
                    print(f"  <{tag.lower()} class={cls!r}>: {t.strip()!r}")
                    count += 1
                    if count >= 10:
                        break
            except Exception:
                pass

        browser.close()

    print(f"\ndebug_dump.html をブラウザで開いて構造を確認してください。")


if __name__ == "__main__":
    main()
