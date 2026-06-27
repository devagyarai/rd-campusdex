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
    if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
      totalStudents,
      totalAttendance,
      totalAssignments,
      totalNotices,
      totalStorageAgg,
      totalActiveFiles,
    ] = await Promise.all([
      db.student.count(),
      db.attendance.count(),
      db.assignment.count(),
      db.notice.count(),
      db.user.aggregate({ _sum: { storageUsed: true } }),
      db.cloudFile.count({ where: { state: "ACTIVE" } })
    ]);

    const totalStorageUsed = totalStorageAgg._sum.storageUsed || 0;

    // Calculate attendance rate
    const presentCount = await db.attendance.count({ where: { status: "PRESENT" } });
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // New students this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newStudentsThisMonth = await db.student.count({ where: { createdAt: { gte: startOfMonth } } });

    // Monthly attendance trend (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const total = await db.attendance.count({ where: { date: { gte: start, lte: end } } });
      const present = await db.attendance.count({ where: { date: { gte: start, lte: end }, status: "PRESENT" } });
      months.push({
        month: date.toLocaleString("default", { month: "short" }),
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }

    // Subject-wise attendance
    const subjects = await db.subject.findMany({ take: 8 });
    const subjectWiseAttendance = await Promise.all(
      subjects.map(async (s) => {
        const total = await db.attendance.count({ where: { subjectId: s.id } });
        const present = await db.attendance.count({ where: { subjectId: s.id, status: "PRESENT" } });
        return { subject: s.code, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
      })
    );

    // Assignment status distribution
    const [pending, inProgress, completed, overdue] = await Promise.all([
      db.assignmentSubmission.count({ where: { status: "PENDING" } }),
      db.assignmentSubmission.count({ where: { status: "IN_PROGRESS" } }),
      db.assignmentSubmission.count({ where: { status: "COMPLETED" } }),
      db.assignmentSubmission.count({ where: { status: "OVERDUE" } }),
    ]);
    const assignmentStatus = [
      { status: "PENDING", count: pending },
      { status: "IN_PROGRESS", count: inProgress },
      { status: "COMPLETED", count: completed },
      { status: "OVERDUE", count: overdue },
    ];

    // Top students by attendance
    const allStudents = await db.student.findMany({
      include: { attendances: true },
      take: 50,
    });
    const topStudents = allStudents
      .map(s => {
        const total = s.attendances.length;
        const present = s.attendances.filter(a => a.status === "PRESENT").length;
        return {
          name: `${s.firstName} ${s.lastName}`,
          rollNumber: s.rollNumber,
          attendance: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5);

    // Recent activity
    const recentAttendances = await db.attendance.findMany({
      include: { student: true, subject: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const recentNotices = await db.notice.findMany({
      include: { admin: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const recentActivity = [
      ...recentAttendances.map(a => ({
        action: `Attendance marked for ${a.student.firstName} in ${a.subject.code}`,
        time: new Date(a.createdAt).toLocaleDateString(),
        type: "ATTENDANCE",
      })),
      ...recentNotices.map(n => ({
        action: `Notice published: ${n.title}`,
        time: new Date(n.createdAt).toLocaleDateString(),
        type: "NOTICE",
      })),
    ].sort((a, b) => 0).slice(0, 8);

    return NextResponse.json({
      totalStudents,
      totalAttendance,
      totalAssignments,
      totalNotices,
      totalStorageUsed,
      totalActiveFiles,
      attendanceRate,
      newStudentsThisMonth,
      monthlyAttendance: months,
      subjectWiseAttendance,
      assignmentStatus,
      recentActivity,
      topStudents,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
