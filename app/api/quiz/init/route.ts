import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Cek batas 3 kuis per minggu (dari awal minggu)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const quizCount = await prisma.quizScore.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    });

    if (quizCount >= 3) {
      return NextResponse.json({ error: "Limit reached: You can only take the quiz 3 times a week." }, { status: 400 });
    }

    // Ambil semua vocab status LEARNING untuk kuis
    const weeklyGoal = parseInt(process.env.WEEKLY_VOCAB_GOAL || "7", 10);
    const vocabs = await prisma.vocabulary.findMany({
      where: { userId, status: "LEARNING" },
    });

    if (vocabs.length < weeklyGoal) {
      return NextResponse.json({ error: `Bank soal tidak cukup. Anda membutuhkan minimal ${weeklyGoal} kata yang sedang dipelajari. Saat ini Anda baru memiliki ${vocabs.length} kata.` }, { status: 400 });
    }

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
