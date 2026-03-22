# 沖縄マンション検索 MVP

沖縄県のマンション情報を検索・管理するウェブアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: PostgreSQL + Prisma ORM
- **ランタイム**: Node.js

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集してデータベース接続情報を設定:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/okinawa_mansion_db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. データベースのセットアップ

```bash
# マイグレーション実行
npm run db:migrate

# Prismaクライアント生成
npm run db:generate

# サンプルデータ投入
npm run db:seed
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## ディレクトリ構造

```
src/
├── app/
│   ├── page.tsx              # トップページ
│   ├── mansions/
│   │   ├── page.tsx          # マンション一覧
│   │   └── [slug]/page.tsx   # マンション詳細
│   ├── admin/
│   │   ├── page.tsx          # 管理ダッシュボード
│   │   ├── mansions/         # マンション管理
│   │   ├── sales/            # 販売中物件管理
│   │   ├── transactions/     # 成約事例管理
│   │   ├── managements/      # 管理情報
│   │   └── import/           # データインポート
│   └── api/
│       ├── mansions/         # マンションAPI
│       ├── sales/            # 販売物件API
│       ├── transactions/     # 成約事例API
│       ├── managements/      # 管理情報API
│       └── import/           # CSVインポートAPI
├── components/               # 共通コンポーネント
├── lib/
│   ├── prisma.ts             # Prismaクライアント
│   └── utils.ts              # ユーティリティ関数
└── types/
    └── index.ts              # TypeScript型定義
```

## データモデル

### mansions (マンション棟マスタ)
- id, slug, name, nameKana, normalizedName
- address, areaName, city, latitude, longitude
- builtYearMonth, builtYear, ageYears, totalUnits, floors
- developer, constructor, structureText, landRights
- accessInfo, schoolDistrict, zoning, parkingInfo
- layoutTypes, description, featuredImageUrl
- isPublished, createdAt, updatedAt

### mansion_managements (管理情報)
- mansionId, managementCompany, managementStyle
- monthlyManagementFee, monthlyRepairReserveFee
- petAllowed, parkingAvailable, notes

### mansion_sales (販売中住戸)
- mansionId, roomNumber, floorNumber, layout
- exclusiveArea, balconyArea, direction
- price, pricePerTsubo, status
- listingSourceName, listingSourceUrl
- isPublished

### mansion_transactions (成約事例)
- mansionId, contractYearMonth, floorNumber, layout
- exclusiveArea
- contractPriceMin, contractPriceMax
- pricePerTsuboMin, pricePerTsuboMax
- sourceName, notes, isPublished

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | /api/mansions | マンション一覧（検索・ページネーション対応） |
| POST | /api/mansions | マンション新規作成 |
| GET | /api/mansions/[id] | マンション詳細 |
| PUT | /api/mansions/[id] | マンション更新 |
| DELETE | /api/mansions/[id] | マンション削除 |
| GET | /api/sales | 販売中物件一覧 |
| POST | /api/sales | 販売中物件作成 |
| GET/PUT/DELETE | /api/sales/[id] | 販売中物件詳細・更新・削除 |
| GET | /api/transactions | 成約事例一覧 |
| POST | /api/transactions | 成約事例作成 |
| GET/PUT/DELETE | /api/transactions/[id] | 成約事例詳細・更新・削除 |
| GET | /api/managements | 管理情報一覧 |
| POST | /api/managements | 管理情報作成 |
| GET/PUT/DELETE | /api/managements/[id] | 管理情報詳細・更新・削除 |
| POST | /api/import | CSVインポート |

### マンション一覧 クエリパラメータ

| パラメータ | 説明 |
|-----------|------|
| city | 市区町村でフィルタ |
| keyword | キーワード検索 |
| layout | 間取りでフィルタ |
| minPrice | 最低価格（万円） |
| maxPrice | 最高価格（万円） |
| minArea | 最小専有面積（m²） |
| maxArea | 最大専有面積（m²） |
| builtYearFrom | 築年（以降） |
| page | ページ番号 |
| limit | 1ページの件数 |

## CSVインポート形式

### マンション情報 (mansions)
```
name,nameKana,address,city,areaName,builtYearMonth,builtYear,...
那覇パークレジデンス,ナハパークレジデンス,沖縄県那覇市...,那覇市,...
```

### 販売中物件 (sales)
```
mansionId,roomNumber,floorNumber,layout,exclusiveArea,...
1,501,5,2LDK,62.50,...
```

### 成約事例 (transactions)
```
mansionId,contractYearMonth,floorNumber,layout,...
1,2024-10,3,2LDK,...
```

## スクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # Lint実行
npm run db:generate  # Prismaクライアント生成
npm run db:migrate   # マイグレーション実行
npm run db:seed      # サンプルデータ投入
npm run db:studio    # Prisma Studio起動
```
