/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { records } = body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No attendance records provided" }, { status: 400 });
    }

    // Upsert each record
    const results = await Promise.allSettled(
      records.map(r =>
        db.attendance.upsert({
          where: {
            studentId_subjectId_date: {
              studentId: r.studentId,
              subjectId: r.subjectId,
              date: new Date(r.date),
            },
          },
          create: {
            studentId: r.studentId,
            subjectId: r.subjectId,
            date: new Date(r.date),
            status: r.status,
            markedBy: session.userId,
            remarks: r.remarks,
          },
          update: {
            status: r.status,
            remarks: r.remarks,
            markedBy: session.userId,
          },
        })
      )
    );

    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({ success: true, succeeded, failed });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");

    const where: Record<string, unknown> = {};
    if (subjectId) where.subjectId = subjectId;
    if (studentId) where.studentId = studentId;
    if (date) where.date = new Date(date);

    const records = await db.attendance.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, rollNumber: true } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
