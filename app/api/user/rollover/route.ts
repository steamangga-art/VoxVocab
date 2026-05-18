import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Rollover API Route
 * Handles student class self-updates when a new school year starts.
 * When a student logs in and a rollover is required, this endpoint updates their class
 * and ensures their previous academic records are logically separated by the academicYear field.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, newClassId, currentAcademicYear } = await req.json();

    if (!userId || !newClassId || !currentAcademicYear) {
      return NextResponse.json(
        { error: "Missing required fields: userId, newClassId, or currentAcademicYear" },
        { status: 400 }
      );
    }

    // 1. Verify the user exists and is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can perform class rollover" }, { status: 403 });
    }

    // 2. Verify the new class exists and is active
    const targetClass = await prisma.class.findUnique({
      where: { id: newClassId, isActive: true }
    });

    if (!targetClass) {
      return NextResponse.json({ error: "Target class not found or is inactive" }, { status: 404 });
    }

    // 3. Update the user's class
    // Note: Old vocabularies and quiz scores are already "archived" by virtue of their 
    // 'academicYear' field which stays as the previous year. 
    // New entries will use the new 'currentAcademicYear'.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        classId: newClassId,
      },
      include: {
        class: true
      }
    });

    // 4. (Optional) We could also explicitly mark old vocabularies as ARCHIVED 
    // if the PRD requirement "Old vocabulary logs ... are dynamically archived" 
    // implies a status change rather than just a filter change.
    await prisma.vocabulary.updateMany({
      where: {
        userId: userId,
        academicYear: { not: currentAcademicYear },
        status: { not: "ARCHIVED" }
      },
      data: {
        status: "ARCHIVED"
      }
    });

    return NextResponse.json({
      message: "Rollover successful. Welcome to your new class!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        className: updatedUser.class?.className
      }
    });

  } catch (error: any) {
    console.error("Rollover API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during rollover processing." },
      { status: 500 }
    );
  }
}
