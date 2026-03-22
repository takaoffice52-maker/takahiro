import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample mansions
  const mansion1 = await prisma.mansion.upsert({
    where: { slug: "naha-park-residence" },
    update: {},
    create: {
      slug: "naha-park-residence",
      name: "那覇パークレジデンス",
      nameKana: "ナハパークレジデンス",
      normalizedName: "那覇パークレジデンス",
      address: "沖縄県那覇市おもろまち2丁目1-1",
      areaName: "おもろまち",
      city: "那覇市",
      latitude: 26.2172,
      longitude: 127.6814,
      landRights: "所有権",
      totalUnits: 120,
      builtYearMonth: "2015-03",
      builtYear: 2015,
      ageYears: 10,
      developer: "沖縄不動産開発",
      constructorName: "琉球建設",
      accessInfo: "ゆいレール「おもろまち駅」徒歩5分",
      structureText: "鉄筋コンクリート造 15階建",
      floors: 15,
      parkingInfo: "敷地内駐車場あり（月額8,000円）",
      layoutTypes: "1LDK, 2LDK, 3LDK",
      description:
        "那覇市おもろまちに位置する高級マンション。ゆいレール駅近で利便性抜群。オーシャンビューの部屋も多数あり。",
      featuredImageUrl: "https://via.placeholder.com/800x400?text=那覇パークレジデンス",
      isPublished: true,
    },
  });

  const mansion2 = await prisma.mansion.upsert({
    where: { slug: "naha-central-tower" },
    update: {},
    create: {
      slug: "naha-central-tower",
      name: "那覇セントラルタワー",
      nameKana: "ナハセントラルタワー",
      normalizedName: "那覇セントラルタワー",
      address: "沖縄県那覇市久茂地3丁目15-2",
      areaName: "久茂地",
      city: "那覇市",
      latitude: 26.2141,
      longitude: 127.6793,
      landRights: "所有権",
      totalUnits: 85,
      builtYearMonth: "2018-06",
      builtYear: 2018,
      ageYears: 7,
      developer: "南西不動産",
      constructorName: "沖縄建設工業",
      accessInfo: "ゆいレール「県庁前駅」徒歩3分",
      structureText: "鉄筋コンクリート造 20階建",
      floors: 20,
      parkingInfo: "機械式駐車場（月額10,000円）",
      layoutTypes: "1K, 1LDK, 2LDK",
      description:
        "那覇市中心部に位置する利便性最高のタワーマンション。国際通りまで徒歩圏内。",
      featuredImageUrl: "https://via.placeholder.com/800x400?text=那覇セントラルタワー",
      isPublished: true,
    },
  });

  const mansion3 = await prisma.mansion.upsert({
    where: { slug: "urasoe-garden-court" },
    update: {},
    create: {
      slug: "urasoe-garden-court",
      name: "浦添ガーデンコート",
      nameKana: "ウラソエガーデンコート",
      normalizedName: "浦添ガーデンコート",
      address: "沖縄県浦添市伊祖4丁目8-10",
      areaName: "伊祖",
      city: "浦添市",
      latitude: 26.246,
      longitude: 127.7165,
      landRights: "所有権",
      totalUnits: 64,
      builtYearMonth: "2012-09",
      builtYear: 2012,
      ageYears: 13,
      developer: "浦添住建",
      constructorName: "琉球建設",
      accessInfo: "バス停「伊祖」徒歩2分、那覇市内へ車で15分",
      structureText: "鉄筋コンクリート造 10階建",
      floors: 10,
      parkingInfo: "平面駐車場（月額5,000円）",
      layoutTypes: "2LDK, 3LDK",
      description:
        "浦添市の閑静な住宅地に位置するマンション。緑豊かな環境で子育てに最適。",
      featuredImageUrl: "https://via.placeholder.com/800x400?text=浦添ガーデンコート",
      isPublished: true,
    },
  });

  // Create management info
  await prisma.mansionManagement.createMany({
    data: [
      {
        mansionId: mansion1.id,
        managementCompany: "那覇マンション管理",
        managementStyle: "全部委託",
        monthlyManagementFee: 15000,
        monthlyRepairReserveFee: 8000,
        petAllowed: true,
        parkingAvailable: true,
        notes: "管理状態良好",
      },
      {
        mansionId: mansion2.id,
        managementCompany: "南西管理サービス",
        managementStyle: "全部委託",
        monthlyManagementFee: 18000,
        monthlyRepairReserveFee: 10000,
        petAllowed: false,
        parkingAvailable: true,
        notes: "24時間コンシェルジュサービスあり",
      },
      {
        mansionId: mansion3.id,
        managementCompany: "浦添住宅管理",
        managementStyle: "一部委託",
        monthlyManagementFee: 12000,
        monthlyRepairReserveFee: 6000,
        petAllowed: true,
        parkingAvailable: true,
        notes: "自主管理組合が積極的に活動",
      },
    ],
    skipDuplicates: true,
  });

  // Create sales listings
  await prisma.mansionSale.createMany({
    data: [
      {
        mansionId: mansion1.id,
        roomNumber: "501",
        floorNumber: 5,
        layout: "2LDK",
        exclusiveArea: 62.5,
        balconyArea: 8.2,
        direction: "南",
        price: 3200,
        pricePerTsubo: 170,
        status: "for_sale",
        listingSourceName: "SUUMO",
        isPublished: true,
      },
      {
        mansionId: mansion1.id,
        roomNumber: "1001",
        floorNumber: 10,
        layout: "3LDK",
        exclusiveArea: 82.0,
        balconyArea: 12.0,
        direction: "南東",
        price: 4800,
        pricePerTsubo: 194,
        status: "for_sale",
        listingSourceName: "at home",
        isPublished: true,
      },
      {
        mansionId: mansion2.id,
        roomNumber: "1502",
        floorNumber: 15,
        layout: "1LDK",
        exclusiveArea: 42.8,
        balconyArea: 5.5,
        direction: "北",
        price: 2500,
        pricePerTsubo: 194,
        status: "for_sale",
        listingSourceName: "SUUMO",
        isPublished: true,
      },
      {
        mansionId: mansion2.id,
        roomNumber: "2001",
        floorNumber: 20,
        layout: "2LDK",
        exclusiveArea: 68.0,
        balconyArea: 10.0,
        direction: "南西",
        price: 5500,
        pricePerTsubo: 268,
        status: "for_sale",
        listingSourceName: "楽天不動産",
        isPublished: true,
      },
      {
        mansionId: mansion3.id,
        roomNumber: "302",
        floorNumber: 3,
        layout: "3LDK",
        exclusiveArea: 75.5,
        balconyArea: 9.0,
        direction: "南",
        price: 2800,
        pricePerTsubo: 123,
        status: "for_sale",
        listingSourceName: "at home",
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  // Create transaction records
  await prisma.mansionTransaction.createMany({
    data: [
      {
        mansionId: mansion1.id,
        contractYearMonth: "2024-10",
        floorNumber: 3,
        layout: "2LDK",
        exclusiveArea: 62.5,
        contractPriceMin: 2900,
        contractPriceMax: 3100,
        pricePerTsuboMin: 154,
        pricePerTsuboMax: 165,
        sourceName: "国土交通省取引価格情報",
        notes: "",
      },
      {
        mansionId: mansion1.id,
        contractYearMonth: "2024-06",
        floorNumber: 8,
        layout: "3LDK",
        exclusiveArea: 82.0,
        contractPriceMin: 4500,
        contractPriceMax: 4700,
        pricePerTsuboMin: 181,
        pricePerTsuboMax: 190,
        sourceName: "国土交通省取引価格情報",
        notes: "",
      },
      {
        mansionId: mansion2.id,
        contractYearMonth: "2024-11",
        floorNumber: 12,
        layout: "2LDK",
        exclusiveArea: 65.0,
        contractPriceMin: 4200,
        contractPriceMax: 4500,
        pricePerTsuboMin: 213,
        pricePerTsuboMax: 228,
        sourceName: "国土交通省取引価格情報",
        notes: "",
      },
      {
        mansionId: mansion3.id,
        contractYearMonth: "2024-08",
        floorNumber: 5,
        layout: "3LDK",
        exclusiveArea: 75.5,
        contractPriceMin: 2500,
        contractPriceMax: 2700,
        pricePerTsuboMin: 110,
        pricePerTsuboMax: 118,
        sourceName: "国土交通省取引価格情報",
        notes: "",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
