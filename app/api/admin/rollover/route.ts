import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { studentIds, newClassId } = await req.json();

    if (!studentIds || !Array.isArray(studentIds) || !newClassId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Rollover logic: move student to new class
    const updated = await prisma.user.updateMany({
      where: { id: { in: studentIds } },
      data: { classId: newClassId },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
