# e-uchina.net 物件監視スクレイパー

沖縄の不動産サイト e-uchina.net をモニタリングし、新着・価格変更・削除をLINEで通知します。

## 対象エリア・条件

- 那覇市 / 浦添市 / 宜野湾市 / 豊見城市 / 沖縄市 / 北谷町 / 糸満市 / 西原町
- 価格 5,000万円以下
- 専有面積 50㎡以上

## セットアップ

### 1. Python環境（3.11以上推奨）

```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

### 2. 環境変数の設定

```bash
cp .env.example .env
# .env を編集して LINE_ACCESS_TOKEN と LINE_USER_ID を設定
```

### 3. 動作確認

```bash
# LINE通知テスト
python3 scraper.py --notify-test

# デバッグ実行（通知なし・HTML保存あり）
python3 scraper.py --debug

# 本番実行
python3 scraper.py
```

## セレクタの調整（初回必須）

サイトのHTML構造が変わった場合や、初回実行で物件が取得できない場合：

```bash
# セレクタ調査ツールを実行
python3 check_selectors.py

# debug_dump.html をブラウザで開いて構造を確認
# scraper.py の CARD_SELECTORS を実際のクラス名に更新
```

## cron設定（30分ごと）

### Linux / macOS

```bash
crontab -e
```

以下を追加：

```cron
# 30分ごとに物件監視を実行
*/30 * * * * /path/to/scraper/.venv/bin/python3 /path/to/scraper/scraper.py >> /path/to/scraper/scraper.log 2>&1
```

例（絶対パスに置き換えてください）：

```cron
*/30 * * * * /home/user/takahiro/scraper/.venv/bin/python3 /home/user/takahiro/scraper/scraper.py >> /home/user/takahiro/scraper/scraper.log 2>&1
```

### ログローテーション（オプション）

```bash
# /etc/logrotate.d/scraper として保存
/home/user/takahiro/scraper/scraper.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
```

### systemd タイマー（Linux代替）

`/etc/systemd/system/property-scraper.service`:

```ini
[Unit]
Description=Property Scraper

[Service]
Type=oneshot
WorkingDirectory=/home/user/takahiro/scraper
ExecStart=/home/user/takahiro/scraper/.venv/bin/python3 scraper.py
```

`/etc/systemd/system/property-scraper.timer`:

```ini
[Unit]
Description=Run Property Scraper every 30 minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=30min

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now property-scraper.timer
```

## ファイル構成

```
scraper/
├── scraper.py          # メインスクリプト
├── check_selectors.py  # セレクタ調査ツール
├── requirements.txt    # 依存パッケージ
├── .env                # 認証情報（gitignore対象）
├── .env.example        # 認証情報テンプレート
├── properties.json     # 前回取得データ（gitignore対象、自動生成）
├── debug_dump.html     # デバッグ用HTML（gitignore対象、自動生成）
└── README.md           # このファイル
```

## LINE通知フォーマット

```
🔔 物件情報更新（2024/01/15 10:30）

🏠 新着物件
物件名: ○○マンション 3LDK
価格: 3,800万円
面積: 72㎡
場所: 那覇市○○
👉 https://www.e-uchina.net/...

💰 価格変更
物件名: △△レジデンス
変更: 4,200万円 → 3,990万円
面積: 65㎡
場所: 浦添市○○
👉 https://www.e-uchina.net/...

❌ 掲載終了／成約済み
物件名: □□アパート
価格: 2,500万円
面積: 55㎡
場所: 宜野湾市○○
👉 https://www.e-uchina.net/...
```

## トラブルシューティング

| 症状 | 原因・対処 |
|------|-----------|
| 物件が0件取得される | `--debug` で HTML 確認 → セレクタ更新 |
| LINE通知が届かない | `--notify-test` でトークン確認 |
| PlaywrightTimeoutError | サーバー負荷高・ネット問題。`time.sleep` を増やす |
| 毎回全件が「新着」になる | `properties.json` の内容確認、IDが正しく設定されているか確認 |
