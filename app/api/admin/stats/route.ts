import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalStudents, totalClasses, totalVocabs] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.class.count({ where: { isActive: true } }),
      prisma.vocabulary.count(),
    ]);

    // Calculate learning efficiency (example: % of mastered vocabs)
    const masteredVocabs = await prisma.vocabulary.count({
      where: { status: "MASTERED" },
    });
    
    const efficiency = totalVocabs > 0 
      ? Math.round((masteredVocabs / totalVocabs) * 100) 
      : 0;

    return NextResponse.json({
      totalStudents,
      totalClasses,
      totalVocabs,
      efficiency: `${efficiency}%`,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
