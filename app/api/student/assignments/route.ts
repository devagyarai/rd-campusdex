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

    const assignments = await db.assignment.findMany({
      where: {
        subject: { semester: student.semester, department: student.department },
        isPublished: true,
      },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
    });

    // Auto-update overdue status
    const now = new Date();
    const result = assignments.map(a => {
      const submission = a.submissions[0];
      let status = submission?.status || "PENDING";
      if (status !== "COMPLETED" && new Date(a.dueDate) < now) {
        status = "OVERDUE";
      }
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject.name,
        subjectCode: a.subject.code,
        dueDate: a.dueDate,
        priority: a.priority,
        status,
        totalMarks: a.totalMarks,
        submission: submission ? {
          status: submission.status,
          submittedAt: submission.submittedAt,
          marksObtained: submission.marksObtained,
        } : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
