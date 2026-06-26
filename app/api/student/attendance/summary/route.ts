/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const subjects = await db.subject.findMany({
      where: { semester: student.semester, department: student.department },
    });

    const summary = await Promise.all(
      subjects.map(async (s) => {
        const attendances = await db.attendance.findMany({
          where: { studentId: student.id, subjectId: s.id },
        });
        const totalClasses = attendances.length;
        const presentCount = attendances.filter(a => a.status === "PRESENT").length;
        const absentCount = totalClasses - presentCount;
        const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

        return {
          subjectId: s.id,
          subjectName: s.name,
          subjectCode: s.code,
          totalClasses,
          presentCount,
          absentCount,
          percentage,
        };
      })
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Attendance summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
