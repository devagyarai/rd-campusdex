import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyInternalRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    if (!verifyInternalRequest(req)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const result = await db.securityAuditLog.deleteMany({
      where: {
        timestamp: { lt: ninetyDaysAgo }
      }
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (error) {
    console.error("Cleanup audit logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
