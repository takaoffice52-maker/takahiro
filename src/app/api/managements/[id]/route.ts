import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mgmtId = parseInt(id);

  if (isNaN(mgmtId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const management = await prisma.mansionManagement.findUnique({
      where: { id: mgmtId },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    if (!management) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(management);
  } catch (error) {
    console.error("GET /api/managements/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mgmtId = parseInt(id);

  if (isNaN(mgmtId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionManagement.findUnique({ where: { id: mgmtId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      managementCompany,
      managementStyle,
      monthlyManagementFee,
      monthlyRepairReserveFee,
      petAllowed,
      parkingAvailable,
      notes,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (managementCompany !== undefined) updateData.managementCompany = managementCompany;
    if (managementStyle !== undefined) updateData.managementStyle = managementStyle;
    if (monthlyManagementFee !== undefined)
      updateData.monthlyManagementFee = monthlyManagementFee ? parseInt(monthlyManagementFee) : null;
    if (monthlyRepairReserveFee !== undefined)
      updateData.monthlyRepairReserveFee = monthlyRepairReserveFee ? parseInt(monthlyRepairReserveFee) : null;
    if (petAllowed !== undefined) updateData.petAllowed = petAllowed !== null ? Boolean(petAllowed) : null;
    if (parkingAvailable !== undefined) updateData.parkingAvailable = parkingAvailable !== null ? Boolean(parkingAvailable) : null;
    if (notes !== undefined) updateData.notes = notes;

    const management = await prisma.mansionManagement.update({
      where: { id: mgmtId },
      data: updateData,
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(management);
  } catch (error) {
    console.error("PUT /api/managements/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const mgmtId = parseInt(id);

  if (isNaN(mgmtId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const existing = await prisma.mansionManagement.findUnique({ where: { id: mgmtId } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mansionManagement.delete({ where: { id: mgmtId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/managements/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
