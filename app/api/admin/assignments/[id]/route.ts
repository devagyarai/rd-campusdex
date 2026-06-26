/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    const assignment = await db.assignment.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subjectId: body.subjectId,
        dueDate: new Date(body.dueDate),
        totalMarks: parseInt(body.totalMarks),
        priority: body.priority,
        isPublished: Boolean(body.isPublished),
      },
      include: {
        subject: { select: { name: true, code: true } },
        admin: { select: { firstName: true, lastName: true } },
        _count: { select: { submissions: true } },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await db.assignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
