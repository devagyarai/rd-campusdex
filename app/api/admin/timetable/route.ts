/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");

    const where = semester ? { semester: parseInt(semester) } : {};

    const timetable = await db.timetable.findMany({
      where,
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const entry = await db.timetable.create({
      data: {
        subjectId: body.subjectId,
        day: body.day,
        startTime: body.startTime,
        endTime: body.endTime,
        room: body.room,
        semester: parseInt(body.semester) || 1,
        batch: body.batch,
        department: body.department,
      },
      include: { subject: { select: { name: true, code: true } } },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
