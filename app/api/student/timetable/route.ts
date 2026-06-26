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

    const timetable = await db.timetable.findMany({
      where: { semester: student.semester, department: student.department, isActive: true },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(timetable);
  } catch (error) {
    console.error("Timetable error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
