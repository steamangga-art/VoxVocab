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

    const resultsToCreate = vocabs.map((v) => {
      const isCorrect = answers[v.id]?.toLowerCase().trim() === v.meaning.toLowerCase().trim();
      return {
        word: v.word,
        userAnswer: answers[v.id] || "",
        isCorrect,
      };
    });

    const correctCount = resultsToCreate.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / vocabs.length) * 100);

    const newScore = await prisma.quizScore.create({
      data: {
        userId,
        score,
        totalQuestions: vocabs.length,
        academicYear: "2025/2026",
        results: {
          create: resultsToCreate,
        },
      },
    });

    return NextResponse.json({ success: true, score, scoreId: newScore.id });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
