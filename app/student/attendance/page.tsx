/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, TrendingUp, AlertCircle, Filter, Search } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  subject: string;
  subjectCode: string;
  remarks?: string;
}

const COLORS = ["#8b5cf6", "#ef4444", "#f59e0b", "#3b82f6"];
const STATUS_COLORS = {
  PRESENT: "status-present",
  ABSENT: "status-absent",
  LATE: "status-late",
  EXCUSED: "status-excused",
};

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchAttendance = async () => {
    try {
      const [summaryRes, recordsRes] = await Promise.all([
        fetch("/api/student/attendance/summary"),
        fetch("/api/student/attendance/records"),
      ]);
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (recordsRes.ok) setRecords(await recordsRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchAttendance(); }, []);


  const overallPercentage = summary.length
    ? Math.round(summary.reduce((a, s) => a + s.percentage, 0) / summary.length)
    : 0;

  const pieData = [
    { name: "Present", value: summary.reduce((a, s) => a + s.presentCount, 0) },
    { name: "Absent", value: summary.reduce((a, s) => a + s.absentCount, 0) },
  ];

  const filtered = records.filter(r => {
    const matchSearch = r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.subjectCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl skeleton-shimmer" />)}
      </div>
      <div className="h-64 rounded-xl skeleton-shimmer" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-violet-500" />
          Attendance Tracker
        </h1>
        <p className="page-subtitle">Monitor your subject-wise attendance and stay on track</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-500" />
            </div>
            <span className="text-sm text-muted-foreground">Overall</span>
          </div>
          <div className={`text-3xl font-bold ${overallPercentage >= 75 ? "text-emerald-500" : "text-red-500"}`}>
            {overallPercentage}%
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${overallPercentage >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {overallPercentage < 75 ? "⚠️ Below 75% minimum" : "✅ Above minimum requirement"}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Present</span>
          </div>
          <div className="text-3xl font-bold text-emerald-500">
            {summary.reduce((a, s) => a + s.presentCount, 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Classes attended</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Absent</span>
          </div>
          <div className="text-3xl font-bold text-red-500">
            {summary.reduce((a, s) => a + s.absentCount, 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Classes missed</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Subject-wise Bar Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={summary} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subjectCode" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="percentage" name="Attendance %" radius={[4, 4, 0, 0]}>
                {summary.map((s, i) => (
                  <Cell key={i} fill={s.percentage >= 75 ? "#10b981" : s.percentage >= 60 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={["#8b5cf6", "#ef4444"][i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-wise Summary Table */}
      <div className="rounded-xl border bg-card mb-6 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Subject Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Present</th>
                <th className="px-4 py-3 text-center">Absent</th>
                <th className="px-4 py-3 text-center">%</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summary.map((s) => (
                <tr key={s.subjectId} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.subjectName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.subjectCode}</td>
                  <td className="px-4 py-3 text-center">{s.totalClasses}</td>
                  <td className="px-4 py-3 text-center text-emerald-500 font-medium">{s.presentCount}</td>
                  <td className="px-4 py-3 text-center text-red-500 font-medium">{s.absentCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${s.percentage >= 75 ? "text-emerald-500" : s.percentage >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                      {s.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.percentage >= 75 ? "status-present" : s.percentage >= 60 ? "status-late" : "status-absent"}`}>
                      {s.percentage >= 75 ? "Good" : s.percentage >= 60 ? "Warning" : "Critical"}
                    </span>
                  </td>
                </tr>
              ))}
              {summary.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="font-semibold flex-1">Attendance History</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search subject..."
                className="pl-8 pr-3 py-1.5 text-sm bg-accent border border-border rounded-lg w-40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm bg-accent border border-border rounded-lg"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium">{r.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.subjectCode}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{r.remarks || "—"}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-border rounded-lg disabled:opacity-40 hover:bg-accent transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-border rounded-lg disabled:opacity-40 hover:bg-accent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
