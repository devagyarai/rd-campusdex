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
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Attendance percentage
    const totalAttendance = await db.attendance.count({ where: { studentId: student.id } });
    const presentCount = await db.attendance.count({ where: { studentId: student.id, status: "PRESENT" } });
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Subjects count
    const totalSubjects = await db.subject.count({ where: { semester: student.semester, department: student.department } });

    // Assignments
    const submissions = await db.assignmentSubmission.findMany({ where: { studentId: student.id } });
    const pendingAssignments = submissions.filter(s => s.status === "PENDING" || s.status === "IN_PROGRESS").length;
    const completedAssignments = submissions.filter(s => s.status === "COMPLETED").length;

    // Notices
    const totalNotices = await db.notice.count({ where: { isPublished: true } });

    // Today's classes
    const today = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase();
    const todayClasses = await db.timetable.count({
      where: { day: today as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY", semester: student.semester, department: student.department },
    });

    // Upcoming classes (next 5 classes in weekly schedule)
    const upcomingClasses = await db.timetable.findMany({
      where: { semester: student.semester, department: student.department },
      include: { subject: true },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
      take: 5,
    });

    // Recent notices
    const recentNotices = await db.notice.findMany({
      where: { isPublished: true },
      include: { admin: { select: { firstName: true, lastName: true } } },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    });

    // Assignment deadlines
    const allAssignments = await db.assignment.findMany({
      where: {
        subject: { semester: student.semester, department: student.department },
        isPublished: true,
      },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: { where: { studentId: student.id } },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    const assignmentDeadlines = allAssignments.map(a => ({
      id: a.id,
      title: a.title,
      subject: a.subject.name,
      dueDate: a.dueDate,
      priority: a.priority,
      status: a.submissions[0]?.status || "PENDING",
    }));

    // Attendance by subject
    const subjects = await db.subject.findMany({
      where: { semester: student.semester, department: student.department },
    });

    const attendanceBySubject = await Promise.all(
      subjects.slice(0, 6).map(async (s) => {
        const total = await db.attendance.count({ where: { studentId: student.id, subjectId: s.id } });
        const present = await db.attendance.count({ where: { studentId: student.id, subjectId: s.id, status: "PRESENT" } });
        return {
          subject: s.name,
          present,
          absent: total - present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
    );

    // Weekly attendance for chart
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const weeklyAttendance = await Promise.all(
      days.map(async (day) => {
        const classes = await db.timetable.count({ where: { day: day as never, semester: student.semester, department: student.department } });
        const present = Math.floor(Math.random() * (classes || 0)); // Placeholder
        return { day: day.slice(0, 3), present, absent: (classes || 0) - present };
      })
    );

    return NextResponse.json({
      attendancePercentage,
      totalSubjects,
      pendingAssignments,
      completedAssignments,
      totalNotices,
      todayClasses,
      upcomingClasses: upcomingClasses.map(c => ({
        id: c.id,
        subject: c.subject.name,
        time: `${c.startTime} - ${c.endTime}`,
        room: c.room,
        day: c.day,
      })),
      recentNotices: recentNotices.map(n => ({
        id: n.id,
        title: n.title,
        category: n.category,
        createdAt: n.createdAt,
        isPinned: n.isPinned,
      })),
      assignmentDeadlines,
      attendanceBySubject,
      weeklyAttendance,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
