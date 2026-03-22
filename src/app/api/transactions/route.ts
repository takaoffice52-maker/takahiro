import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const mansionId = searchParams.get("mansionId") ? parseInt(searchParams.get("mansionId")!) : undefined;
  const layout = searchParams.get("layout") || undefined;
  const contractYearMonth = searchParams.get("contractYearMonth") || undefined;
  const publishedOnly = searchParams.get("publishedOnly") !== "false";

  const where: Record<string, unknown> = {};

  if (publishedOnly) where.isPublished = true;
  if (mansionId) where.mansionId = mansionId;
  if (layout) where.layout = { contains: layout };
  if (contractYearMonth) where.contractYearMonth = contractYearMonth;

  try {
    const [total, transactions] = await Promise.all([
      prisma.mansionTransaction.count({ where }),
      prisma.mansionTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ contractYearMonth: "desc" }, { createdAt: "desc" }],
        include: {
          mansion: {
            select: { id: true, name: true, slug: true, address: true, city: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      mansionId,
      contractYearMonth,
      floorNumber,
      layout,
      exclusiveArea,
      contractPriceMin,
      contractPriceMax,
      pricePerTsuboMin,
      pricePerTsuboMax,
      sourceName,
      notes,
      isPublished,
    } = body;

    if (!mansionId) {
      return NextResponse.json({ error: "mansionId is required" }, { status: 400 });
    }

    const mansion = await prisma.mansion.findUnique({ where: { id: parseInt(mansionId) } });
    if (!mansion) {
      return NextResponse.json({ error: "Mansion not found" }, { status: 404 });
    }

    const transaction = await prisma.mansionTransaction.create({
      data: {
        mansionId: parseInt(mansionId),
        contractYearMonth,
        floorNumber: floorNumber ? parseInt(floorNumber) : null,
        layout,
        exclusiveArea: exclusiveArea ? parseFloat(exclusiveArea) : null,
        contractPriceMin: contractPriceMin ? parseInt(contractPriceMin) : null,
        contractPriceMax: contractPriceMax ? parseInt(contractPriceMax) : null,
        pricePerTsuboMin: pricePerTsuboMin ? parseInt(pricePerTsuboMin) : null,
        pricePerTsuboMax: pricePerTsuboMax ? parseInt(pricePerTsuboMax) : null,
        sourceName,
        notes,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
