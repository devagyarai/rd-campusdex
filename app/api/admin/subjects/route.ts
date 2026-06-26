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
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subjects = await db.subject.findMany({
      orderBy: [{ department: "asc" }, { semester: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const subject = await db.subject.create({
      data: {
        name: body.name,
        code: body.code,
        credits: parseInt(body.credits) || 3,
        semester: parseInt(body.semester) || 1,
        department: body.department,
        description: body.description,
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: unknown) {
    const msg = (error as Error).message?.includes("Unique constraint") ? "Subject code already exists" : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
