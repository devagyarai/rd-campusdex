/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, role, rollNumber, department, semester, batch, employeeId, designation } = validation.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, password: hashedPassword, role },
      });

      if (role === "STUDENT") {
        // Check roll number uniqueness
        if (rollNumber) {
          const existingRoll = await tx.student.findUnique({ where: { rollNumber } });
          if (existingRoll) throw new Error("Roll number already exists");
        }
        await tx.student.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
            rollNumber: rollNumber || `STU${Date.now()}`,
            department: department || "General",
            semester: semester || 1,
            batch: batch || "2024-2028",
          },
        });
      } else {
        if (employeeId) {
          const existingEmp = await tx.admin.findUnique({ where: { employeeId } });
          if (existingEmp) throw new Error("Employee ID already exists");
        }
        await tx.admin.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
            employeeId: employeeId || `EMP${Date.now()}`,
            designation: designation || "Faculty",
            department: department || "General",
          },
        });
      }

      return newUser;
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role as "STUDENT" | "ADMIN" });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    }, { status: 201 });

    response.cookies.set("campusdex-token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Register error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
