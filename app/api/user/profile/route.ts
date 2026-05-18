import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        class: true,
        vocabularies: true,
        quizScores: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const masteredCount = user.vocabularies.filter(v => v.status === "MASTERED").length;
    const masteryRate = user.vocabularies.length > 0 
      ? Math.round((masteredCount / user.vocabularies.length) * 100) 
      : 0;

    return NextResponse.json({
      ...user,
      masteryRate,
      quizCount: user.quizScores.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
