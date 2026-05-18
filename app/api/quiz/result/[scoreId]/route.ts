import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ scoreId: string }> }) {
  const { scoreId } = await params;
  
  const score = await prisma.quizScore.findUnique({
    where: { id: scoreId },
    include: { 
      results: true 
    },
  });

  if (!score) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Enrich results with the correct meaning
  const enrichedResults = await Promise.all(score.results.map(async (r) => {
    const vocab = await prisma.vocabulary.findFirst({
      where: { 
        word: r.word,
        userId: score.userId
      }
    });
    return {
      ...r,
      correctMeaning: vocab?.meaning || "Unknown"
    };
  }));

  return NextResponse.json({ ...score, results: enrichedResults });
}
