import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, answers } = body;
    const vocabIds = Object.keys(answers);

    const vocabs = await prisma.vocabulary.findMany({
      where: { id: { in: vocabIds } },
    });

    let correctCount = 0;
    vocabs.forEach((v) => {
      if (answers[v.id]?.toLowerCase().trim() === v.meaning.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / vocabs.length) * 100);

    await prisma.quizScore.create({
      data: {
        userId,
        score,
        totalQuestions: vocabs.length,
        academicYear: "2025/2026",
      },
    });

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
