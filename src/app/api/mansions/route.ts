import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSlug, normalizeText } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "12")));
  const skip = (page - 1) * limit;

  const city = searchParams.get("city") || undefined;
  const areaName = searchParams.get("areaName") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const layout = searchParams.get("layout") || undefined;
  const slug = searchParams.get("slug") || undefined;
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
  const minArea = searchParams.get("minArea") ? parseFloat(searchParams.get("minArea")!) : undefined;
  const maxArea = searchParams.get("maxArea") ? parseFloat(searchParams.get("maxArea")!) : undefined;
  const builtYearFrom = searchParams.get("builtYearFrom")
    ? parseInt(searchParams.get("builtYearFrom")!)
    : undefined;

  // Build where clause
  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (slug) {
    where.slug = slug;
  }
  if (city) {
    where.city = city;
  }
  if (areaName) {
    where.areaName = { contains: areaName };
  }
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { normalizedName: { contains: keyword } },
      { address: { contains: keyword } },
      { areaName: { contains: keyword } },
      { city: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }
  if (builtYearFrom) {
    where.builtYear = { gte: builtYearFrom };
  }

  // Sales filter (price, layout, area)
  if (minPrice != null || maxPrice != null || layout || minArea != null || maxArea != null) {
    const salesFilter: Record<string, unknown> = { isPublished: true };
    if (layout) salesFilter.layout = { contains: layout };
    if (minPrice != null) {
      salesFilter.price = { ...(salesFilter.price as object || {}), gte: minPrice };
    }
    if (maxPrice != null) {
      salesFilter.price = { ...(salesFilter.price as object || {}), lte: maxPrice };
    }
    if (minArea != null) {
      salesFilter.exclusiveArea = { ...(salesFilter.exclusiveArea as object || {}), gte: minArea };
    }
    if (maxArea != null) {
      salesFilter.exclusiveArea = { ...(salesFilter.exclusiveArea as object || {}), lte: maxArea };
    }
    where.sales = { some: salesFilter };
  }

  try {
    const [total, mansions] = await Promise.all([
      prisma.mansion.count({ where }),
      prisma.mansion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { sales: true, transactions: true } },
          managements: { take: 1 },
          sales: {
            where: { isPublished: true },
            orderBy: { price: "asc" },
          },
          transactions: {
            where: { isPublished: true },
            orderBy: { contractYearMonth: "desc" },
            take: 5,
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: mansions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/mansions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      nameKana,
      address,
      areaName,
      city,
      latitude,
      longitude,
      landRights,
      totalUnits,
      builtYearMonth,
      builtYear,
      ageYears,
      developer,
      constructor: constructorValue,
      accessInfo,
      schoolDistrict,
      zoning,
      structureText,
      floors,
      parkingInfo,
      layoutTypes,
      description,
      featuredImageUrl,
      isPublished,
    } = body;

    if (!name || !address || !areaName || !city) {
      return NextResponse.json(
        { error: "name, address, areaName, city are required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(name + "-" + city);
    const normalizedName = normalizeText(name);

    // Ensure unique slug
    const existing = await prisma.mansion.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const mansion = await prisma.mansion.create({
      data: {
        slug,
        name,
        nameKana,
        normalizedName,
        address,
        areaName,
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        landRights,
        totalUnits: totalUnits ? parseInt(totalUnits) : null,
        builtYearMonth,
        builtYear: builtYear ? parseInt(builtYear) : null,
        ageYears: ageYears ? parseInt(ageYears) : null,
        developer,
        constructorName: constructorValue,
        accessInfo,
        schoolDistrict,
        zoning,
        structureText,
        floors: floors ? parseInt(floors) : null,
        parkingInfo,
        layoutTypes,
        description,
        featuredImageUrl,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
    });

    return NextResponse.json(mansion, { status: 201 });
  } catch (error) {
    console.error("POST /api/mansions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
