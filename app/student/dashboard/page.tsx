/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, BookOpen, Bell, Calendar, TrendingUp, TrendingDown,
  Clock, CheckCircle2, AlertCircle, Activity,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface DashboardStats {
  attendancePercentage: number;
  totalSubjects: number;
  pendingAssignments: number;
  completedAssignments: number;
  totalNotices: number;
  todayClasses: number;
  upcomingClasses: UpcomingClass[];
  recentNotices: Notice[];
  assignmentDeadlines: Assignment[];
  attendanceBySubject: AttendanceData[];
  weeklyAttendance: WeeklyData[];
}

interface UpcomingClass {
  id: string;
  subject: string;
  time: string;
  room: string;
  day: string;
}

interface Notice {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  isPinned: boolean;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: string;
  status: string;
}

interface AttendanceData {
  subject: string;
  present: number;
  absent: number;
  percentage: number;
}

interface WeeklyData {
  day: string;
  present: number;
  absent: number;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const statCards = [
  {
    key: "attendancePercentage",
    label: "Attendance",
    suffix: "%",
    icon: ClipboardCheck,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 to-purple-600/10",
    border: "border-violet-500/20",
    trend: "+2.1%",
    trendUp: true,
  },
  {
    key: "totalSubjects",
    label: "Total Subjects",
    suffix: "",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-600/10",
    border: "border-blue-500/20",
    trend: "This semester",
    trendUp: true,
  },
  {
    key: "pendingAssignments",
    label: "Pending",
    suffix: " tasks",
    icon: AlertCircle,
    gradient: "from-orange-500 to-amber-600",
    bgGradient: "from-orange-500/10 to-amber-600/10",
    border: "border-orange-500/20",
    trend: "Due soon",
    trendUp: false,
  },
  {
    key: "completedAssignments",
    label: "Completed",
    suffix: " tasks",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
    border: "border-emerald-500/20",
    trend: "This month",
    trendUp: true,
  },
  {
    key: "totalNotices",
    label: "Notices",
    suffix: "",
    icon: Bell,
    gradient: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-500/10 to-pink-600/10",
    border: "border-rose-500/20",
    trend: "Unread",
    trendUp: false,
  },
  {
    key: "todayClasses",
    label: "Today's Classes",
    suffix: "",
    icon: Calendar,
    gradient: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-500/10 to-blue-600/10",
    border: "border-indigo-500/20",
    trend: "Scheduled",
    trendUp: true,
  },
];

const categoryColors: Record<string, string> = {
  ACADEMIC: "badge-academic",
  EVENT: "badge-event",
  EXAMINATION: "badge-examination",
  GENERAL: "badge-general",
  EMERGENCY: "badge-emergency",
};

const priorityColors: Record<string, string> = {
  LOW: "text-blue-500",
  MEDIUM: "text-yellow-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/student/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const pieData = stats?.attendanceBySubject?.slice(0, 5).map((s) => ({
    name: s.subject.split(" ").slice(0, 2).join(" "),
    value: s.percentage,
  })) || [];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Activity className="w-6 h-6 text-violet-500" />
          Student Dashboard
        </h1>
        <p className="page-subtitle">Welcome back! Here&apos;s your academic overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => {
          const value = stats ? (stats as unknown as Record<string, unknown>)[card.key] : 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`stat-card bg-gradient-to-br ${card.bgGradient} border ${card.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.trendUp ? "text-emerald-500" : "text-orange-500"}`}>
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {String(value ?? 0)}{card.suffix}
              </div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts + Widgets Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Attendance Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 rounded-xl border bg-card p-5"
        >
          <h3 className="font-semibold mb-4">Attendance by Subject</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No attendance data yet
            </div>
          )}
          <div className="mt-3 space-y-1">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-28">{entry.name}</span>
                </div>
                <span className="font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Attendance Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-2 rounded-xl border bg-card p-5"
        >
          <h3 className="font-semibold mb-4">Weekly Attendance Overview</h3>
          {stats?.weeklyAttendance && stats.weeklyAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.weeklyAttendance} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No weekly data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Classes</h3>
            <a href="/student/timetable" className="text-xs text-violet-500 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {stats?.upcomingClasses?.slice(0, 4).map((cls) => (
              <div key={cls.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cls.subject}</p>
                  <p className="text-xs text-muted-foreground">{cls.time} · {cls.room}</p>
                </div>
              </div>
            ))}
            {(!stats?.upcomingClasses || stats.upcomingClasses.length === 0) && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No upcoming classes
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Notices</h3>
            <a href="/student/notices" className="text-xs text-violet-500 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {stats?.recentNotices?.slice(0, 4).map((notice) => (
              <div key={notice.id} className="p-2 rounded-lg bg-accent/50">
                <div className="flex items-start gap-2">
                  {notice.isPinned && <span className="text-orange-500 mt-0.5">📌</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notice.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${categoryColors[notice.category] || "badge-general"}`}>
                        {notice.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.recentNotices || stats.recentNotices.length === 0) && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No notices yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Assignment Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Deadlines</h3>
            <a href="/student/assignments" className="text-xs text-violet-500 hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {stats?.assignmentDeadlines?.slice(0, 4).map((a) => {
              const due = new Date(a.dueDate);
              // eslint-disable-next-line react-hooks/purity
              const daysLeft = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0;
              return (
                <div key={a.id} className="p-2 rounded-lg bg-accent/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.subject}</p>
                    </div>
                    <div className={`text-xs font-medium shrink-0 ${isOverdue ? "text-red-500" : daysLeft <= 2 ? "text-orange-500" : "text-emerald-500"}`}>
                      {isOverdue ? "Overdue" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </div>
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${priorityColors[a.priority] || ""}`}>
                    {a.priority}
                  </div>
                </div>
              );
            })}
            {(!stats?.assignmentDeadlines || stats.assignmentDeadlines.length === 0) && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No upcoming deadlines
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
