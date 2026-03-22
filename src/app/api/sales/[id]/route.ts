import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const saleId = parseInt(id);

  if (isNaN(saleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const sale = await prisma.mansionSale.findUnique({
      where: { id: saleId },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error("GET /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const saleId = parseInt(id);

  if (isNaN(saleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionSale.findUnique({ where: { id: saleId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
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

    const updateData: Record<string, unknown> = {};

    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (floorNumber !== undefined) updateData.floorNumber = floorNumber ? parseInt(floorNumber) : null;
    if (layout !== undefined) updateData.layout = layout;
    if (exclusiveArea !== undefined) updateData.exclusiveArea = exclusiveArea ? parseFloat(exclusiveArea) : null;
    if (balconyArea !== undefined) updateData.balconyArea = balconyArea ? parseFloat(balconyArea) : null;
    if (direction !== undefined) updateData.direction = direction;
    if (price !== undefined) updateData.price = price ? parseInt(price) : null;
    if (pricePerTsubo !== undefined) updateData.pricePerTsubo = pricePerTsubo ? parseInt(pricePerTsubo) : null;
    if (status !== undefined) updateData.status = status;
    if (listingSourceName !== undefined) updateData.listingSourceName = listingSourceName;
    if (listingSourceUrl !== undefined) updateData.listingSourceUrl = listingSourceUrl;
    if (fetchedAt !== undefined) updateData.fetchedAt = fetchedAt ? new Date(fetchedAt) : null;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    const sale = await prisma.mansionSale.update({
      where: { id: saleId },
      data: updateData,
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("PUT /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const saleId = parseInt(id);

  if (isNaN(saleId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionSale.findUnique({ where: { id: saleId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mansionSale.delete({ where: { id: saleId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
