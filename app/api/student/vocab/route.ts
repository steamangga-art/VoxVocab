import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

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

    // 1. Ambil tahun aktif dari settings
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "CURRENT_ACADEMIC_YEAR" },
    });
    const academicYear = setting?.value || "2025/2026";

    // 2. Cek duplikasi di SELURUH riwayat kata siswa (lintas tahun)
    const existing = await prisma.vocabulary.findFirst({
      where: {
        userId: userId,
        word: {
          equals: word,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Word already exists in your history" }, { status: 409 });
    }

    const vocab = await prisma.vocabulary.create({
      data: {
        userId,
        word,
        partOfSpeech,
        meaning,
        sentence,
        status: "LEARNING",
        academicYear,
      },
    });

    return NextResponse.json(vocab);
  } catch (error) {
    console.error("Create vocab error:", error);
    return NextResponse.json({ error: "Failed to create vocabulary" }, { status: 500 });
  }
}
