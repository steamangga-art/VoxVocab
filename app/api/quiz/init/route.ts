import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Cek batas 3 kuis per minggu (7 hari terakhir)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const quizCount = await prisma.quizScore.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (quizCount >= 3) {
      return NextResponse.json({ error: "Limit reached" }, { status: 400 });
    }

    // Ambil vocab untuk kuis sesuai goal mingguan
    const weeklyGoal = parseInt(process.env.WEEKLY_VOCAB_GOAL || "7", 10);
    const vocabs = await prisma.vocabulary.findMany({
      where: { userId, status: "LEARNING" },
      take: weeklyGoal * 2,
    });

    if (vocabs.length < weeklyGoal) return NextResponse.json({ error: "Not enough vocab" }, { status: 400 });

    const questions = vocabs
      .sort(() => Math.random() - 0.5)
      .slice(0, weeklyGoal)
      .map((v) => ({
        id: v.id,
        word: v.word,
        meaning: v.meaning,
      }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz init error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
