/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Users, ClipboardCheck, BookOpen,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/overview")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container">
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-xl skeleton-shimmer" />)}
      </div>
    </div>
  );

  const monthlyAttendance = (data?.monthlyAttendance as unknown[]) || [];
  const subjectWiseAttendance = (data?.subjectWiseAttendance as unknown[]) || [];
  const assignmentStatus = (data?.assignmentStatus as { status: string; count: number }[]) || [];
  const topStudents = (data?.topStudents as { name: string; rollNumber: string; attendance: number }[]) || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          Analytics Dashboard
        </h1>
        <p className="page-subtitle">Deep insights into campus performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: data?.totalStudents, icon: Users, color: "text-violet-500" },
          { label: "Attendance Rate", value: `${data?.attendanceRate}%`, icon: ClipboardCheck, color: "text-emerald-500" },
          { label: "Assignments", value: data?.totalAssignments, icon: BookOpen, color: "text-blue-500" },
          { label: "Notices", value: data?.totalNotices, icon: TrendingUp, color: "text-orange-500" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <kpi.icon className={`w-6 h-6 ${kpi.color} mb-3`} />
            <div className="text-2xl font-bold">{String(kpi.value ?? 0)}</div>
            <div className="text-sm text-muted-foreground">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Attendance Area Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">6-Month Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyAttendance} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#8b5cf6" fill="url(#attendanceGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assignment Pie */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Assignment Completion Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={assignmentStatus} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="count" nameKey="status">
                {assignmentStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Attendance Bar */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Subject-wise Attendance Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectWiseAttendance} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" name="Rate %" radius={[4, 4, 0, 0]}>
                {subjectWiseAttendance.map((s: unknown, i: number) => (
                  <Cell key={i} fill={(s as { rate: number }).rate >= 75 ? "#10b981" : (s as { rate: number }).rate >= 60 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Students */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.rollNumber} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-amber-600/20 text-amber-600" : "bg-accent text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.rollNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-500">{s.attendance}%</span>
                  <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                    <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${s.attendance}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {topStudents.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
