import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    const where: any = { role: "STUDENT" };
    if (classId) {
      where.classId = classId;
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        class: {
          select: { className: true },
        },
        _count: {
          select: { vocabularies: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Admin student fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
