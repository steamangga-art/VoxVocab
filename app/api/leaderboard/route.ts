import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Leaderboard API Route
 * Provides aggregated ranking data filtered by academicYear and optionally classId.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get("academicYear");
    const classId = searchParams.get("classId"); // Optional: for Class Leaderboard

    if (!academicYear) {
      return NextResponse.json(
        { error: "academicYear query parameter is required" },
        { status: 400 }
      );
    }

    // Build the filters
    const filter: any = {
      role: "STUDENT",
    };

    if (classId) {
      filter.classId = classId;
    }

    // Fetch students with their vocab count and quiz scores for the specific year
    // We'll aggregate this in memory for more complex scoring logic if needed,
    // or use Prisma's aggregate features for simple counts.
    const students = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        class: {
          select: {
            className: true,
            major: true,
          },
        },
        _count: {
          select: {
            vocabularies: {
              where: { 
                academicYear,
                status: "MASTERED" // Ranking based on mastered words
              },
            },
          },
        },
        quizScores: {
          where: { academicYear },
          select: {
            score: true,
            totalQuestions: true,
          },
        },
      },
    });

    // Calculate ranking metrics
    const leaderboardData = students.map((student) => {
      const totalMastered = student._count.vocabularies;
      const totalQuizScore = student.quizScores.reduce((sum, qs) => sum + qs.score, 0);
      const averageQuizAccuracy = student.quizScores.length > 0
        ? (student.quizScores.reduce((sum, qs) => sum + (qs.score / qs.totalQuestions), 0) / student.quizScores.length) * 100
        : 0;

      return {
        id: student.id,
        name: student.name,
        className: student.class?.className || "N/A",
        major: student.class?.major || "N/A",
        masteredCount: totalMastered,
        totalQuizScore: totalQuizScore,
        accuracy: Math.round(averageQuizAccuracy * 10) / 10,
        // Combined score formula: (Mastered Words * 10) + Total Quiz Points
        rankScore: (totalMastered * 10) + totalQuizScore,
      };
    });

    // Sort by rankScore descending
    leaderboardData.sort((a, b) => b.rankScore - a.rankScore);

    return NextResponse.json({
      academicYear,
      level: classId ? "class" : "global",
      data: leaderboardData,
    });

  } catch (error: any) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching leaderboard." },
      { status: 500 }
    );
  }
}
