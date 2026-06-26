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
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assignments = await db.assignment.findMany({
      include: {
        subject: { select: { name: true, code: true } },
        admin: { select: { firstName: true, lastName: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const admin = await db.admin.findUnique({ where: { userId: session.userId } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const assignment = await db.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        subjectId: body.subjectId,
        adminId: admin.id,
        dueDate: new Date(body.dueDate),
        totalMarks: parseInt(body.totalMarks) || 100,
        priority: body.priority || "MEDIUM",
        isPublished: Boolean(body.isPublished),
      },
      include: {
        subject: { select: { name: true, code: true } },
        admin: { select: { firstName: true, lastName: true } },
        _count: { select: { submissions: true } },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
