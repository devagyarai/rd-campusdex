import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Basic auth check for CRON
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users
    const users = await db.user.findMany({ select: { id: true } });
    let totalRepaired = 0;

    for (const user of users) {
      // Calculate true storage used
      const aggregation = await db.cloudFile.aggregate({
        where: { 
          uploadedById: user.id,
          state: "ACTIVE"
        },
        _sum: {
          bytes: true
        }
      });

      const actualStorage = aggregation._sum.bytes || 0;

      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      
      if (dbUser && dbUser.storageUsed !== actualStorage) {
        await db.user.update({
          where: { id: user.id },
          data: { storageUsed: actualStorage }
        });
        totalRepaired++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Storage reconciliation complete",
      usersChecked: users.length,
      driftRepaired: totalRepaired
    });
  } catch (error) {
    console.error("Cron reconcile-storage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
