import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatToWIB } from "@/utils/date";

export async function GET() {
  try {
    const recentVocabs = await prisma.vocabulary.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    const activities = recentVocabs.map((v) => ({
      id: v.id,
      user: v.user.name,
      action: `Added new word: "${v.word}"`,
      time: formatToWIB(v.createdAt),
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Activity fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
