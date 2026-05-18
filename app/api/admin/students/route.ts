import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const searchQuery = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const where: any = { 
      role: "STUDENT",
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ]
    };
    
    if (classId) {
      where.classId = classId;
    }

    const [students, totalCount] = await Promise.all([
      prisma.user.findMany({
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
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ students, totalCount, totalPages: Math.ceil(totalCount / pageSize) });
  } catch (error) {
    console.error("Admin student fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
