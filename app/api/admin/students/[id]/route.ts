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

    const student = await db.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        gender: body.gender,
        semester: parseInt(body.semester) || 1,
        batch: body.batch,
        department: body.department,
      },
      include: { user: { select: { email: true, isActive: true, createdAt: true } } },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Student PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const student = await db.student.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await db.user.delete({ where: { id: student.userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, isActive: true, createdAt: true, lastLoginAt: true } },
        attendances: { include: { subject: true }, orderBy: { date: "desc" }, take: 10 },
      },
    });

    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    console.error("Student GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
