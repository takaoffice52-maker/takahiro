/**
 * DELETE /api/report/subscribers/[id]  → 配信停止（isActive=false）
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.reportSubscriber.update({
    where:  { id },
    data:   { isActive: false },
  });

  return NextResponse.json({ success: true });
}
