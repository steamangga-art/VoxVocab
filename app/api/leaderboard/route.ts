import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "global";
    const userId = searchParams.get("userId");

    let classId = null;
    if (type === "class" && userId) {
      const teacher = await prisma.user.findUnique({
        where: { id: userId },
        select: { classId: true },
      });
      classId = teacher?.classId;
    }

    // Jika filter kelas tapi guru tidak punya kelas, kembalikan kosong atau global?
    // Asumsi: jika tidak punya classId, filter class tidak menghasilkan data.
    const whereCondition: any = { role: "STUDENT" };
    if (type === "class" && classId) {
      whereCondition.classId = classId;
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        quizScores: { select: { score: true, createdAt: true } }
      },
    });

    const sorted = users
      .map((u) => {
        const weeklyBest: Record<string, number> = {};
        u.quizScores.forEach((q) => {
          const date = new Date(q.createdAt);
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];

          if (!weeklyBest[weekStart] || q.score > weeklyBest[weekStart]) {
            weeklyBest[weekStart] = q.score;
          }
        });

        const totalScore = Object.values(weeklyBest).reduce((acc, curr) => acc + curr, 0);
        return { id: u.id, name: u.name, score: totalScore };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(sorted.slice(0, 5)); // Batasi 5 teratas
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

