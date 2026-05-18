import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper untuk mendapatkan awal minggu (Senin 00:00:00)
function getStartOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const startOfWeek = getStartOfWeek();
    const deadline = new Date(startOfWeek);
    deadline.setDate(deadline.getDate() + 6);
    deadline.setHours(23, 59, 59, 999);
    
    // Ambil goal dari database
    const goalSetting = await prisma.systemSetting.findUnique({
      where: { key: "WEEKLY_VOCAB_GOAL" },
    });
    const weeklyGoal = parseInt(goalSetting?.value || "7", 10);

    const [vocabCount, weeklyVocabs, quizScores, allQuizScores] = await Promise.all([
      prisma.vocabulary.count({ where: { userId, status: "LEARNING" } }),
      prisma.vocabulary.count({ where: { userId, createdAt: { gte: startOfWeek } } }),
      prisma.quizScore.findMany({
        where: { userId, createdAt: { gte: startOfWeek } },
        orderBy: { score: "desc" },
      }),
      prisma.quizScore.findMany({
        where: { userId },
      }),
    ]);

    const bestQuizScore = quizScores.length > 0 ? quizScores[0].score : 0;
    const quizTakenCount = quizScores.length;
    const perfectScoreCount = allQuizScores.filter(q => q.score === 100).length;

    return NextResponse.json({
      vocabCount,
      weeklyVocabs,
      weeklyGoal,
      bestQuizScore,
      quizTakenCount,
      perfectScoreCount,
      deadline: deadline.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
