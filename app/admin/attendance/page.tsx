/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, Plus, Search, Filter, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  department: string;
}

interface AttendanceRecord {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
}

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord["status"]>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/subjects")
      .then(r => r.json())
      .then(setSubjects)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadStudentsForSubject();
    }
  }, [selectedSubject]);

  const loadStudentsForSubject = async () => {
    setLoading(true);
    try {
      const subjectObj = subjects.find(s => s.id === selectedSubject);
      if (!subjectObj) return;
      const res = await fetch(`/api/admin/students?department=${encodeURIComponent(subjectObj.department)}&semester=${subjectObj.semester}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        // Initialize all as PRESENT
        const init: Record<string, AttendanceRecord["status"]> = {};
        data.students.forEach((s: Student) => { init[s.id] = "PRESENT"; });
        setAttendance(init);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const setStatus = (studentId: string, status: AttendanceRecord["status"]) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceRecord["status"]) => {
    const all: Record<string, AttendanceRecord["status"]> = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const submitAttendance = async () => {
    if (!selectedSubject) { toast.error("Select a subject first"); return; }
    if (students.length === 0) { toast.error("No students found"); return; }

    setSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        subjectId: selectedSubject,
        date: attendanceDate,
        status: attendance[s.id] || "ABSENT",
      }));

      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });

      if (res.ok) {
        toast.success(`Attendance submitted for ${students.length} students`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const presentCount = Object.values(attendance).filter(s => s === "PRESENT").length;
  const absentCount = Object.values(attendance).filter(s => s === "ABSENT").length;

  const STATUS_BUTTONS: { status: AttendanceRecord["status"]; label: string; class: string }[] = [
    { status: "PRESENT", label: "P", class: "status-present" },
    { status: "ABSENT", label: "A", class: "status-absent" },
    { status: "LATE", label: "L", class: "status-late" },
    { status: "EXCUSED", label: "E", class: "status-excused" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-500" />
          Attendance Management
        </h1>
        <p className="page-subtitle">Mark and manage student attendance</p>
      </div>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Subject</label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none"
          >
            <option value="">Select a subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code}) — Sem {s.semester}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={e => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Stats + Actions */}
      {students.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-3 text-sm flex-1">
            <span className="flex items-center gap-1 text-emerald-500 font-medium"><Check className="w-4 h-4" />{presentCount} Present</span>
            <span className="flex items-center gap-1 text-red-500 font-medium"><X className="w-4 h-4" />{absentCount} Absent</span>
            <span className="text-muted-foreground">{students.length} Total</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => markAll("PRESENT")} className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg">All Present</button>
            <button onClick={() => markAll("ABSENT")} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg">All Absent</button>
          </div>
          <button
            onClick={submitAttendance}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
            Submit Attendance
          </button>
        </div>
      )}

      {/* Student List */}
      {!selectedSubject ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a subject to start marking attendance</p>
        </div>
      ) : loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-lg skeleton-shimmer" />)}</div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No students found for this subject
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Roll No.</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-muted-foreground">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {STATUS_BUTTONS.map(btn => (
                          <button
                            key={btn.status}
                            onClick={() => setStatus(student.id, btn.status)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              attendance[student.id] === btn.status
                                ? `${btn.class} scale-110 shadow-sm`
                                : "bg-accent text-muted-foreground hover:bg-accent/80"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
