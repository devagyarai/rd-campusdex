/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const notes = await db.note.findMany({
      where: { studentId: student.id },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const body = await req.json();

    const note = await db.note.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category || "LECTURE",
        tags: body.tags,
        studentId: student.id,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
