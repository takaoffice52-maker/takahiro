/**
 * GET  /api/report/subscribers  → 購読者一覧
 * POST /api/report/subscribers  → 購読者追加
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subscribers = await prisma.reportSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subscribers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const subscriber = await prisma.reportSubscriber.upsert({
    where:  { email },
    update: { isActive: true, name: name ?? null },
    create: { email, name: name ?? null, isActive: true },
  });

  return NextResponse.json(subscriber, { status: 201 });
}
