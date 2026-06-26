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

    const records = await db.attendance.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records.map(r => ({
      id: r.id,
      date: r.date,
      status: r.status,
      subject: r.subject.name,
      subjectCode: r.subject.code,
      remarks: r.remarks,
    })));
  } catch (error) {
    console.error("Attendance records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
