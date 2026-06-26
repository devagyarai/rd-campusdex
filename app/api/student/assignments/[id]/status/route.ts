/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Upsert submission
    const submission = await db.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: id, studentId: student.id } },
      create: {
        assignmentId: id,
        studentId: student.id,
        status: body.status,
        submittedAt: body.status === "COMPLETED" ? new Date() : null,
      },
      update: {
        status: body.status,
        submittedAt: body.status === "COMPLETED" ? new Date() : undefined,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Assignment status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
