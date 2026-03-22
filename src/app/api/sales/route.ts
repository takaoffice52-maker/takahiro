import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const mansionId = searchParams.get("mansionId") ? parseInt(searchParams.get("mansionId")!) : undefined;
  const layout = searchParams.get("layout") || undefined;
  const status = searchParams.get("status") || undefined;
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
  const minArea = searchParams.get("minArea") ? parseFloat(searchParams.get("minArea")!) : undefined;
  const maxArea = searchParams.get("maxArea") ? parseFloat(searchParams.get("maxArea")!) : undefined;
  const publishedOnly = searchParams.get("publishedOnly") !== "false";

  const where: Record<string, unknown> = {};

  if (publishedOnly) where.isPublished = true;
  if (mansionId) where.mansionId = mansionId;
  if (layout) where.layout = { contains: layout };
  if (status) where.status = status;

  if (minPrice != null || maxPrice != null) {
    const priceFilter: Record<string, number> = {};
    if (minPrice != null) priceFilter.gte = minPrice;
    if (maxPrice != null) priceFilter.lte = maxPrice;
    where.price = priceFilter;
  }

  if (minArea != null || maxArea != null) {
    const areaFilter: Record<string, number> = {};
    if (minArea != null) areaFilter.gte = minArea;
    if (maxArea != null) areaFilter.lte = maxArea;
    where.exclusiveArea = areaFilter;
  }

  try {
    const [total, sales] = await Promise.all([
      prisma.mansionSale.count({ where }),
      prisma.mansionSale.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ price: "asc" }, { createdAt: "desc" }],
        include: {
          mansion: {
            select: { id: true, name: true, slug: true, address: true, city: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/sales error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      mansionId,
      roomNumber,
      floorNumber,
      layout,
      exclusiveArea,
      balconyArea,
      direction,
      price,
      pricePerTsubo,
      status,
      listingSourceName,
      listingSourceUrl,
      fetchedAt,
      publishedAt,
      isPublished,
    } = body;

    if (!mansionId) {
      return NextResponse.json({ error: "mansionId is required" }, { status: 400 });
    }

    const mansion = await prisma.mansion.findUnique({ where: { id: parseInt(mansionId) } });
    if (!mansion) {
      return NextResponse.json({ error: "Mansion not found" }, { status: 404 });
    }

    const sale = await prisma.mansionSale.create({
      data: {
        mansionId: parseInt(mansionId),
        roomNumber,
        floorNumber: floorNumber ? parseInt(floorNumber) : null,
        layout,
        exclusiveArea: exclusiveArea ? parseFloat(exclusiveArea) : null,
        balconyArea: balconyArea ? parseFloat(balconyArea) : null,
        direction,
        price: price ? parseInt(price) : null,
        pricePerTsubo: pricePerTsubo ? parseInt(pricePerTsubo) : null,
        status: status || "for_sale",
        listingSourceName,
        listingSourceUrl,
        fetchedAt: fetchedAt ? new Date(fetchedAt) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
