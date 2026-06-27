/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Admin notices CRUD with admin-specific prefix
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notices = await db.notice.findMany({
      include: { 
        admin: { select: { firstName: true, lastName: true } },
        attachment: true
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(notices);
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

    const notice = await db.notice.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category || "GENERAL",
        isPinned: Boolean(body.isPinned),
        adminId: admin.id,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        attachmentId: body.attachmentId,
      },
      include: { 
        admin: { select: { firstName: true, lastName: true } },
        attachment: true
      },
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
