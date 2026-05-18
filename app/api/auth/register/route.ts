import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, identifier, email, password, classId } = await request.json();

    // Cek duplikasi berdasarkan identifier
    const existingUser = await prisma.user.findUnique({
      where: { identifier },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Identifier (NISN/NIK) already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        identifier,
        email: email || null,
        passwordHash,
        classId,
        role: "STUDENT",
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        identifier: user.identifier,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
