import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mansionId = parseInt(id);

  if (isNaN(mansionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const mansion = await prisma.mansion.findUnique({
      where: { id: mansionId },
      include: {
        managements: true,
        sales: { orderBy: { price: "asc" } },
        transactions: { orderBy: { contractYearMonth: "desc" } },
        _count: { select: { sales: true, transactions: true } },
      },
    });

    if (!mansion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(mansion);
  } catch (error) {
    console.error("GET /api/mansions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mansionId = parseInt(id);

  if (isNaN(mansionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const existing = await prisma.mansion.findUnique({ where: { id: mansionId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      updateData.name = name;
      updateData.normalizedName = normalizeText(name);
    }
    if (nameKana !== undefined) updateData.nameKana = nameKana;
    if (address !== undefined) updateData.address = address;
    if (areaName !== undefined) updateData.areaName = areaName;
    if (city !== undefined) updateData.city = city;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (landRights !== undefined) updateData.landRights = landRights;
    if (totalUnits !== undefined) updateData.totalUnits = totalUnits ? parseInt(totalUnits) : null;
    if (builtYearMonth !== undefined) updateData.builtYearMonth = builtYearMonth;
    if (builtYear !== undefined) updateData.builtYear = builtYear ? parseInt(builtYear) : null;
    if (ageYears !== undefined) updateData.ageYears = ageYears ? parseInt(ageYears) : null;
    if (developer !== undefined) updateData.developer = developer;
    if (constructorValue !== undefined) updateData.constructorName = constructorValue;
    if (accessInfo !== undefined) updateData.accessInfo = accessInfo;
    if (schoolDistrict !== undefined) updateData.schoolDistrict = schoolDistrict;
    if (zoning !== undefined) updateData.zoning = zoning;
    if (structureText !== undefined) updateData.structureText = structureText;
    if (floors !== undefined) updateData.floors = floors ? parseInt(floors) : null;
    if (parkingInfo !== undefined) updateData.parkingInfo = parkingInfo;
    if (layoutTypes !== undefined) updateData.layoutTypes = layoutTypes;
    if (description !== undefined) updateData.description = description;
    if (featuredImageUrl !== undefined) updateData.featuredImageUrl = featuredImageUrl;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

    const mansion = await prisma.mansion.update({
      where: { id: mansionId },
      data: updateData,
    });

    return NextResponse.json(mansion);
  } catch (error) {
    console.error("PUT /api/mansions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mansionId = parseInt(id);

  if (isNaN(mansionId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansion.findUnique({ where: { id: mansionId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mansion.delete({ where: { id: mansionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/mansions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
