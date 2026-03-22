import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const txId = parseInt(id);

  if (isNaN(txId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const transaction = await prisma.mansionTransaction.findUnique({
      where: { id: txId },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const txId = parseInt(id);

  if (isNaN(txId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionTransaction.findUnique({ where: { id: txId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
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

    const updateData: Record<string, unknown> = {};

    if (contractYearMonth !== undefined) updateData.contractYearMonth = contractYearMonth;
    if (floorNumber !== undefined) updateData.floorNumber = floorNumber ? parseInt(floorNumber) : null;
    if (layout !== undefined) updateData.layout = layout;
    if (exclusiveArea !== undefined) updateData.exclusiveArea = exclusiveArea ? parseFloat(exclusiveArea) : null;
    if (contractPriceMin !== undefined) updateData.contractPriceMin = contractPriceMin ? parseInt(contractPriceMin) : null;
    if (contractPriceMax !== undefined) updateData.contractPriceMax = contractPriceMax ? parseInt(contractPriceMax) : null;
    if (pricePerTsuboMin !== undefined) updateData.pricePerTsuboMin = pricePerTsuboMin ? parseInt(pricePerTsuboMin) : null;
    if (pricePerTsuboMax !== undefined) updateData.pricePerTsuboMax = pricePerTsuboMax ? parseInt(pricePerTsuboMax) : null;
    if (sourceName !== undefined) updateData.sourceName = sourceName;
    if (notes !== undefined) updateData.notes = notes;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    const transaction = await prisma.mansionTransaction.update({
      where: { id: txId },
      data: updateData,
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const txId = parseInt(id);

  if (isNaN(txId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionTransaction.findUnique({ where: { id: txId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mansionTransaction.delete({ where: { id: txId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
