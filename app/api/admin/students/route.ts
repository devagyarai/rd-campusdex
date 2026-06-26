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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "ALL";
    const semester = searchParams.get("semester") || "ALL";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { rollNumber: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }
    if (department !== "ALL") where.department = department;
    if (semester !== "ALL") where.semester = parseInt(semester);

    const [students, total] = await Promise.all([
      db.student.findMany({
        where,
        include: { user: { select: { email: true, isActive: true, createdAt: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.student.count({ where }),
    ]);

    return NextResponse.json({ students, total, page, limit });
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("Student@123", 12);

    const student = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: body.email, password: hashedPassword, role: "STUDENT" },
      });
      return tx.student.create({
        data: {
          userId: user.id,
          firstName: body.firstName,
          lastName: body.lastName,
          rollNumber: body.rollNumber,
          department: body.department,
          semester: parseInt(body.semester) || 1,
          batch: body.batch,
          phone: body.phone,
        },
        include: { user: { select: { email: true, isActive: true, createdAt: true } } },
      });
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: unknown) {
    console.error("Students POST error:", error);
    const msg = (error as Error).message?.includes("Unique constraint") ? "Email or roll number already exists" : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
