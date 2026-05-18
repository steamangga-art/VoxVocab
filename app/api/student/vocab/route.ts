import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const vocabs = await prisma.vocabulary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vocabs);
  } catch (error) {
    console.error("Fetch vocab error:", error);
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, word, partOfSpeech, meaning, sentence } = await request.json();

    // In a real app, you would call the Gemini validation API here
    // or ensure it was called before hitting this endpoint.

    const vocab = await prisma.vocabulary.create({
      data: {
        userId,
        word,
        partOfSpeech,
        meaning,
        sentence,
        status: "LEARNING",
        academicYear: "2025/2026", // Should be dynamic in production
      },
    });

    return NextResponse.json(vocab);
  } catch (error) {
    console.error("Create vocab error:", error);
    return NextResponse.json({ error: "Failed to create vocabulary" }, { status: 500 });
  }
}
