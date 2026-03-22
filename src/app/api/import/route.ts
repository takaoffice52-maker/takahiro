import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeText, parseCsvLine } from "@/lib/utils";

type ImportType = "mansions" | "sales" | "transactions" | "managements";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let csvText = "";
    let importType: ImportType = "mansions";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const typeField = formData.get("type") as string | null;
      importType = (typeField as ImportType) || "mansions";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
      csvText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      csvText = body.csv || "";
      importType = body.type || "mansions";
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV data is empty" }, { status: 400 });
    }

    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have header and at least one data row" }, { status: 400 });
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
    const dataLines = lines.slice(1);

    let imported = 0;
    let errors: string[] = [];

    if (importType === "mansions") {
      const result = await importMansions(headers, dataLines);
      imported = result.imported;
      errors = result.errors;
    } else if (importType === "sales") {
      const result = await importSales(headers, dataLines);
      imported = result.imported;
      errors = result.errors;
    } else if (importType === "transactions") {
      const result = await importTransactions(headers, dataLines);
      imported = result.imported;
      errors = result.errors;
    } else if (importType === "managements") {
      const result = await importManagements(headers, dataLines);
      imported = result.imported;
      errors = result.errors;
    } else {
      return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      imported,
      total: dataLines.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error("POST /api/import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getField(headers: string[], row: string[], field: string): string {
  const idx = headers.indexOf(field);
  if (idx === -1) return "";
  return row[idx]?.trim() || "";
}

async function importMansions(headers: string[], lines: string[]) {
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const lineNum = i + 2;

    try {
      const name = getField(headers, row, "name") || getField(headers, row, "マンション名");
      const address = getField(headers, row, "address") || getField(headers, row, "所在地");
      const city = getField(headers, row, "city") || getField(headers, row, "市区町村");
      const areaName = getField(headers, row, "areaname") || getField(headers, row, "エリア名");

      if (!name || !address || !city) {
        errors.push(`行${lineNum}: name/address/cityは必須です`);
        continue;
      }

      let slug = getField(headers, row, "slug");
      if (!slug) {
        slug = generateSlug(name + "-" + city);
      }
      const normalizedName = normalizeText(name);

      const builtYearMonth = getField(headers, row, "builtyearmonth") || getField(headers, row, "築年月");
      const builtYearStr = getField(headers, row, "builtyear") || getField(headers, row, "築年");
      const builtYear = builtYearStr ? parseInt(builtYearStr) : null;
      const ageYearsStr = getField(headers, row, "ageyears") || getField(headers, row, "築年数");
      const ageYears = ageYearsStr ? parseInt(ageYearsStr) : builtYear ? new Date().getFullYear() - builtYear : null;

      const totalUnitsStr = getField(headers, row, "totalunits") || getField(headers, row, "総戸数");
      const floorsStr = getField(headers, row, "floors") || getField(headers, row, "階数");
      const latStr = getField(headers, row, "latitude") || getField(headers, row, "緯度");
      const lngStr = getField(headers, row, "longitude") || getField(headers, row, "経度");

      // Check for existing slug
      const existing = await prisma.mansion.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}-${i}` : slug;

      await prisma.mansion.create({
        data: {
          slug: finalSlug,
          name,
          nameKana: getField(headers, row, "namekana") || getField(headers, row, "名前カナ") || null,
          normalizedName,
          address,
          areaName: areaName || city,
          city,
          latitude: latStr ? parseFloat(latStr) : null,
          longitude: lngStr ? parseFloat(lngStr) : null,
          landRights: getField(headers, row, "landrights") || getField(headers, row, "土地権利") || null,
          totalUnits: totalUnitsStr ? parseInt(totalUnitsStr) : null,
          builtYearMonth: builtYearMonth || null,
          builtYear,
          ageYears,
          developer: getField(headers, row, "developer") || getField(headers, row, "デベロッパー") || null,
          constructorName: getField(headers, row, "constructor") || getField(headers, row, "施工会社") || null,
          accessInfo: getField(headers, row, "accessinfo") || getField(headers, row, "交通") || null,
          schoolDistrict: getField(headers, row, "schooldistrict") || getField(headers, row, "学区") || null,
          zoning: getField(headers, row, "zoning") || getField(headers, row, "用途地域") || null,
          structureText: getField(headers, row, "structuretext") || getField(headers, row, "構造") || null,
          floors: floorsStr ? parseInt(floorsStr) : null,
          parkingInfo: getField(headers, row, "parkinginfo") || getField(headers, row, "駐車場") || null,
          layoutTypes: getField(headers, row, "layouttypes") || getField(headers, row, "間取り") || null,
          description: getField(headers, row, "description") || getField(headers, row, "説明") || null,
          featuredImageUrl: getField(headers, row, "featuredimageurl") || null,
          isPublished: true,
        },
      });

      imported++;
    } catch (e) {
      errors.push(`行${lineNum}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return { imported, errors };
}

async function importSales(headers: string[], lines: string[]) {
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const lineNum = i + 2;

    try {
      const mansionIdStr = getField(headers, row, "mansionid") || getField(headers, row, "マンションid");
      const mansionName = getField(headers, row, "mansionname") || getField(headers, row, "マンション名");

      let mansionId: number | null = mansionIdStr ? parseInt(mansionIdStr) : null;

      if (!mansionId && mansionName) {
        const mansion = await prisma.mansion.findFirst({
          where: { name: { contains: mansionName } },
        });
        if (mansion) mansionId = mansion.id;
      }

      if (!mansionId) {
        errors.push(`行${lineNum}: マンションが見つかりません`);
        continue;
      }

      const priceStr = getField(headers, row, "price") || getField(headers, row, "価格");
      const pricePerTsuboStr = getField(headers, row, "priceperstsubo") || getField(headers, row, "坪単価");
      const exclusiveAreaStr = getField(headers, row, "exclusivearea") || getField(headers, row, "専有面積");
      const balconyAreaStr = getField(headers, row, "balconyarea") || getField(headers, row, "バルコニー面積");
      const floorStr = getField(headers, row, "floornumber") || getField(headers, row, "階数");

      await prisma.mansionSale.create({
        data: {
          mansionId,
          roomNumber: getField(headers, row, "roomnumber") || getField(headers, row, "部屋番号") || null,
          floorNumber: floorStr ? parseInt(floorStr) : null,
          layout: getField(headers, row, "layout") || getField(headers, row, "間取り") || null,
          exclusiveArea: exclusiveAreaStr ? parseFloat(exclusiveAreaStr) : null,
          balconyArea: balconyAreaStr ? parseFloat(balconyAreaStr) : null,
          direction: getField(headers, row, "direction") || getField(headers, row, "向き") || null,
          price: priceStr ? parseInt(priceStr) : null,
          pricePerTsubo: pricePerTsuboStr ? parseInt(pricePerTsuboStr) : null,
          status: getField(headers, row, "status") || "for_sale",
          listingSourceName: getField(headers, row, "listingsourcename") || getField(headers, row, "情報元") || null,
          listingSourceUrl: getField(headers, row, "listingsourceurl") || null,
          isPublished: true,
        },
      });

      imported++;
    } catch (e) {
      errors.push(`行${lineNum}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return { imported, errors };
}

async function importTransactions(headers: string[], lines: string[]) {
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const lineNum = i + 2;

    try {
      const mansionIdStr = getField(headers, row, "mansionid") || getField(headers, row, "マンションid");
      const mansionName = getField(headers, row, "mansionname") || getField(headers, row, "マンション名");

      let mansionId: number | null = mansionIdStr ? parseInt(mansionIdStr) : null;

      if (!mansionId && mansionName) {
        const mansion = await prisma.mansion.findFirst({
          where: { name: { contains: mansionName } },
        });
        if (mansion) mansionId = mansion.id;
      }

      if (!mansionId) {
        errors.push(`行${lineNum}: マンションが見つかりません`);
        continue;
      }

      const priceMinStr = getField(headers, row, "contractpricemin") || getField(headers, row, "成約価格下限");
      const priceMaxStr = getField(headers, row, "contractpricemax") || getField(headers, row, "成約価格上限");
      const tsuboMinStr = getField(headers, row, "priceperstsubomin") || getField(headers, row, "坪単価下限");
      const tsuboMaxStr = getField(headers, row, "priceperstsubomax") || getField(headers, row, "坪単価上限");
      const exclusiveAreaStr = getField(headers, row, "exclusivearea") || getField(headers, row, "専有面積");
      const floorStr = getField(headers, row, "floornumber") || getField(headers, row, "階数");

      await prisma.mansionTransaction.create({
        data: {
          mansionId,
          contractYearMonth: getField(headers, row, "contractyearmonth") || getField(headers, row, "契約年月") || null,
          floorNumber: floorStr ? parseInt(floorStr) : null,
          layout: getField(headers, row, "layout") || getField(headers, row, "間取り") || null,
          exclusiveArea: exclusiveAreaStr ? parseFloat(exclusiveAreaStr) : null,
          contractPriceMin: priceMinStr ? parseInt(priceMinStr) : null,
          contractPriceMax: priceMaxStr ? parseInt(priceMaxStr) : null,
          pricePerTsuboMin: tsuboMinStr ? parseInt(tsuboMinStr) : null,
          pricePerTsuboMax: tsuboMaxStr ? parseInt(tsuboMaxStr) : null,
          sourceName: getField(headers, row, "sourcename") || getField(headers, row, "情報元") || null,
          notes: getField(headers, row, "notes") || getField(headers, row, "備考") || null,
          isPublished: true,
        },
      });

      imported++;
    } catch (e) {
      errors.push(`行${lineNum}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return { imported, errors };
}

async function importManagements(headers: string[], lines: string[]) {
  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const lineNum = i + 2;

    try {
      const mansionIdStr = getField(headers, row, "mansionid") || getField(headers, row, "マンションid");
      const mansionName = getField(headers, row, "mansionname") || getField(headers, row, "マンション名");

      let mansionId: number | null = mansionIdStr ? parseInt(mansionIdStr) : null;

      if (!mansionId && mansionName) {
        const mansion = await prisma.mansion.findFirst({
          where: { name: { contains: mansionName } },
        });
        if (mansion) mansionId = mansion.id;
      }

      if (!mansionId) {
        errors.push(`行${lineNum}: マンションが見つかりません`);
        continue;
      }

      const mgmtFeeStr = getField(headers, row, "monthlymanagementfee") || getField(headers, row, "管理費");
      const repairFeeStr = getField(headers, row, "monthlyrepairreservefee") || getField(headers, row, "修繕積立金");
      const petStr = getField(headers, row, "petallowed") || getField(headers, row, "ペット可");
      const parkingStr = getField(headers, row, "parkingavailable") || getField(headers, row, "駐車場");

      await prisma.mansionManagement.create({
        data: {
          mansionId,
          managementCompany: getField(headers, row, "managementcompany") || getField(headers, row, "管理会社") || null,
          managementStyle: getField(headers, row, "managementstyle") || getField(headers, row, "管理形態") || null,
          monthlyManagementFee: mgmtFeeStr ? parseInt(mgmtFeeStr) : null,
          monthlyRepairReserveFee: repairFeeStr ? parseInt(repairFeeStr) : null,
          petAllowed: petStr ? petStr === "1" || petStr.toLowerCase() === "true" || petStr === "あり" : null,
          parkingAvailable: parkingStr ? parkingStr === "1" || parkingStr.toLowerCase() === "true" || parkingStr === "あり" : null,
          notes: getField(headers, row, "notes") || getField(headers, row, "備考") || null,
        },
      });

      imported++;
    } catch (e) {
      errors.push(`行${lineNum}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return { imported, errors };
}
