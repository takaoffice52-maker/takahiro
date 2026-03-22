import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const mansionId = searchParams.get("mansionId") ? parseInt(searchParams.get("mansionId")!) : undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (mansionId) where.mansionId = mansionId;

  try {
    const [total, managements] = await Promise.all([
      prisma.mansionManagement.count({ where }),
      prisma.mansionManagement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          mansion: {
            select: { id: true, name: true, slug: true, address: true, city: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: managements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/managements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      mansionId,
      managementCompany,
      managementStyle,
      monthlyManagementFee,
      monthlyRepairReserveFee,
      petAllowed,
      parkingAvailable,
      notes,
    } = body;

    if (!mansionId) {
      return NextResponse.json({ error: "mansionId is required" }, { status: 400 });
    }

    const mansion = await prisma.mansion.findUnique({ where: { id: parseInt(mansionId) } });
    if (!mansion) {
      return NextResponse.json({ error: "Mansion not found" }, { status: 404 });
    }

    const management = await prisma.mansionManagement.create({
      data: {
        mansionId: parseInt(mansionId),
        managementCompany,
        managementStyle,
        monthlyManagementFee: monthlyManagementFee ? parseInt(monthlyManagementFee) : null,
        monthlyRepairReserveFee: monthlyRepairReserveFee ? parseInt(monthlyRepairReserveFee) : null,
        petAllowed: petAllowed !== undefined ? Boolean(petAllowed) : null,
        parkingAvailable: parkingAvailable !== undefined ? Boolean(parkingAvailable) : null,
        notes,
      },
      include: {
        mansion: {
          select: { id: true, name: true, slug: true, address: true, city: true },
        },
      },
    });

    return NextResponse.json(management, { status: 201 });
  } catch (error) {
    console.error("POST /api/managements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
