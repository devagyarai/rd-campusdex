/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, ClipboardCheck, BookOpen, Bell, TrendingUp, TrendingDown,
  GraduationCap, Activity, BarChart3,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

interface AdminStats {
  totalStudents: number;
  totalAttendance: number;
  totalAssignments: number;
  totalNotices: number;
  attendanceRate: number;
  newStudentsThisMonth: number;
  monthlyAttendance: { month: string; rate: number }[];
  subjectWiseAttendance: { subject: string; rate: number }[];
  assignmentStatus: { status: string; count: number }[];
  recentActivity: { action: string; time: string; type: string }[];
  topStudents: { name: string; rollNumber: string; attendance: number }[];
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: Users, gradient: "from-violet-500 to-purple-600", suffix: "" },
  { key: "totalAttendance", label: "Attendance Records", icon: ClipboardCheck, gradient: "from-blue-500 to-cyan-600", suffix: "" },
  { key: "totalAssignments", label: "Assignments", icon: BookOpen, gradient: "from-emerald-500 to-teal-600", suffix: "" },
  { key: "totalNotices", label: "Notices", icon: Bell, gradient: "from-orange-500 to-amber-600", suffix: "" },
  { key: "attendanceRate", label: "Avg Attendance", icon: Activity, gradient: "from-rose-500 to-pink-600", suffix: "%" },
  { key: "newStudentsThisMonth", label: "New This Month", icon: TrendingUp, gradient: "from-indigo-500 to-blue-600", suffix: "" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/analytics/overview");
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchStats(); }, []);


  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl skeleton-shimmer" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-xl skeleton-shimmer" />)}
      </div>
    </div>
  );

  const assignmentPieData = stats?.assignmentStatus || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          Admin Dashboard
        </h1>
        <p className="page-subtitle">Enterprise analytics and campus overview</p>
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
              className="stat-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold">{String(value ?? 0)}{card.suffix}</div>
              <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Monthly Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats?.monthlyAttendance || []} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="rate" name="Attendance %" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Assignment Status Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Assignment Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={assignmentPieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="count" nameKey="status">
                {assignmentPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend formatter={(v) => v.toLowerCase().replace("_", " ")} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Subject-wise Attendance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-violet-500" />
            Subject-wise Attendance Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.subjectWiseAttendance || []} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" name="Attendance %" radius={[4, 4, 0, 0]}>
                {(stats?.subjectWiseAttendance || []).map((s, i) => (
                  <Cell key={i} fill={s.rate >= 75 ? "#10b981" : s.rate >= 60 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Students */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            Top Attendance
          </h3>
          <div className="space-y-3">
            {(stats?.topStudents || []).slice(0, 5).map((s, i) => (
              <div key={s.rollNumber} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.rollNumber}</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">{s.attendance}%</span>
              </div>
            ))}
            {(!stats?.topStudents || stats.topStudents.length === 0) && (
              <p className="text-muted-foreground text-sm text-center py-4">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {(stats?.recentActivity || []).slice(0, 8).map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                a.type === "ATTENDANCE" ? "bg-violet-500" :
                a.type === "ASSIGNMENT" ? "bg-blue-500" :
                a.type === "NOTICE" ? "bg-orange-500" : "bg-emerald-500"
              }`} />
              <span className="text-sm flex-1">{a.action}</span>
              <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
          {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
            <p className="text-muted-foreground text-sm text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
