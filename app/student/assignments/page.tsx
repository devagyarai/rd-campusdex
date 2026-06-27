/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, AlertCircle, CheckCircle2, Filter, Search, X } from "lucide-react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { AnimatePresence } from "framer-motion";

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  subjectCode: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  totalMarks: number;
  submission?: { status: string; submittedAt?: string; marksObtained?: number };
}

const PRIORITY_CONFIG = {
  LOW: { label: "Low", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  MEDIUM: { label: "Medium", class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  HIGH: { label: "High", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  URGENT: { label: "Urgent", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const STATUS_CONFIG = {
  PENDING: { label: "Pending", class: "status-pending", icon: Clock },
  IN_PROGRESS: { label: "In Progress", class: "status-in_progress", icon: AlertCircle },
  COMPLETED: { label: "Completed", class: "status-completed", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", class: "status-overdue", icon: AlertCircle },
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [submitModal, setSubmitModal] = useState<Assignment | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/student/assignments");
      if (res.ok) setAssignments(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchAssignments(); }, []);


  const updateStatus = async (id: string, status: string, fileId?: string) => {
    try {
      const res = await fetch(`/api/student/assignments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, fileId }),
      });
      if (res.ok) {
        setAssignments(prev => prev.map(a =>
          a.id === id ? { ...a, status: status as Assignment["status"] } : a
        ));
        toast.success(status === "COMPLETED" ? "Assignment submitted" : "Status updated");
        if (status === "COMPLETED") {
          setSubmitModal(null);
          setUploadedFile(null);
        }
      }
    } catch { toast.error("Failed to update status"); }
  };

  const handleFinalSubmit = async () => {
    if (!submitModal) return;
    setSubmitting(true);
    await updateStatus(submitModal.id, "COMPLETED", uploadedFile?.id);
    setSubmitting(false);
  };

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => a.status === "PENDING").length,
    in_progress: assignments.filter(a => a.status === "IN_PROGRESS").length,
    completed: assignments.filter(a => a.status === "COMPLETED").length,
    overdue: assignments.filter(a => a.status === "OVERDUE").length,
  };

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || a.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  if (loading) return (
    <div className="page-container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl skeleton-shimmer" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-xl skeleton-shimmer" />)}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-500" />
          Assignments
        </h1>
        <p className="page-subtitle">Track your assignments and submission status</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending", count: counts.pending, class: "status-pending", color: "text-yellow-600" },
          { label: "In Progress", count: counts.in_progress, class: "status-in_progress", color: "text-blue-600" },
          { label: "Completed", count: counts.completed, class: "status-completed", color: "text-emerald-600" },
          { label: "Overdue", count: counts.overdue, class: "status-overdue", color: "text-red-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
        >
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Assignment Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((assignment, i) => {
            const due = new Date(assignment.dueDate);
            // eslint-disable-next-line react-hooks/purity
              const daysLeft = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const StatusIcon = STATUS_CONFIG[assignment.status].icon;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border bg-card p-5 card-hover"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{assignment.subject} · {assignment.subjectCode}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_CONFIG[assignment.priority].class}`}>
                    {PRIORITY_CONFIG[assignment.priority].label}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{assignment.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1 font-medium ${isOverdue ? "text-red-500" : daysLeft <= 2 ? "text-orange-500" : "text-muted-foreground"}`}>
                    <Clock className="w-3 h-3" />
                    {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                    <span className="ml-1 opacity-60">· {due.toLocaleDateString()}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${STATUS_CONFIG[assignment.status].class}`}>
                    <StatusIcon className="w-3 h-3" />
                    {STATUS_CONFIG[assignment.status].label}
                  </span>
                </div>

                {/* Status actions */}
                {assignment.status !== "COMPLETED" && (
                  <div className="mt-3 flex gap-2">
                    {assignment.status === "PENDING" && (
                      <button
                        onClick={() => updateStatus(assignment.id, "IN_PROGRESS")}
                        className="flex-1 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        Start Working
                      </button>
                    )}
                    <button
                      onClick={() => setSubmitModal(assignment)}
                      className="flex-1 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                )}
                {assignment.status === "COMPLETED" && assignment.submission?.marksObtained !== undefined && (
                  <div className="mt-3 text-xs text-emerald-500 font-medium">
                    ✅ Marks: {assignment.submission.marksObtained}/{assignment.totalMarks}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {submitModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSubmitModal(null); setUploadedFile(null); }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-lg">Submit Assignment</h2>
                  <p className="text-sm text-muted-foreground mt-1">{submitModal.title}</p>
                </div>
                <button onClick={() => { setSubmitModal(null); setUploadedFile(null); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!uploadedFile ? (
                <FileDropzone
                  folder="assignments"
                  maxSizeMB={50}
                  allowedExtensions={["pdf", "doc", "docx", "zip", "rar", "ppt", "pptx"]}
                  onUploadComplete={setUploadedFile}
                />
              ) : (
                <div className="bg-accent p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="font-medium">{uploadedFile.originalName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ready to submit</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="flex-1 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Change File
                    </button>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={submitting}
                      className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Confirm Submit"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
