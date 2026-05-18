import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let settings = await prisma.systemSetting.findMany();
  
  if (settings.length === 0) {
    const defaults = [
      { key: "CURRENT_ACADEMIC_YEAR", value: "2025/2026" },
      { key: "WEEKLY_VOCAB_GOAL", value: "7" },
    ];
    await prisma.systemSetting.createMany({ data: defaults });
    settings = await prisma.systemSetting.findMany();
  }
  
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const { key, value } = await req.json();
  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return NextResponse.json(setting);
}
