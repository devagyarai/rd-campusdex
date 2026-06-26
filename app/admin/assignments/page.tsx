/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Search, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  totalMarks: number;
  isPublished: boolean;
  _count?: { submissions: number };
  subject: { name: string; code: string };
  admin: { firstName: string; lastName: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AssignmentForm {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  priority: string;
  totalMarks: number;
  isPublished: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<AssignmentForm>({
    defaultValues: { priority: "MEDIUM", totalMarks: 100, isPublished: true }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, subjectRes] = await Promise.all([
        fetch("/api/admin/assignments"),
        fetch("/api/admin/subjects"),
      ]);
      if (assignRes.ok) setAssignments(await assignRes.json());
      if (subjectRes.ok) setSubjects(await subjectRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingAssignment(null);
    reset({ priority: "MEDIUM", totalMarks: 100, isPublished: true });
    setModalOpen(true);
  };

  const openEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setValue("title", a.title);
    setValue("description", a.description);
    setValue("dueDate", new Date(a.dueDate).toISOString().split("T")[0]);
    setValue("priority", a.priority);
    setValue("totalMarks", a.totalMarks);
    setValue("isPublished", a.isPublished);
    setModalOpen(true);
  };

  const onSubmit = async (data: AssignmentForm) => {
    setSaving(true);
    try {
      const url = editingAssignment ? `/api/admin/assignments/${editingAssignment.id}` : "/api/admin/assignments";
      const method = editingAssignment ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, totalMarks: parseInt(String(data.totalMarks)) }),
      });
      if (res.ok) {
        toast.success(editingAssignment ? "Assignment updated" : "Assignment created");
        setModalOpen(false);
        fetchData();
      } else {
        toast.error("Failed to save");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      const res = await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
      if (res.ok) { setAssignments(prev => prev.filter(a => a.id !== id)); toast.success("Deleted"); }
    } catch { toast.error("Failed to delete"); }
  };

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Assignment Management
          </h1>
          <p className="page-subtitle">{assignments.length} assignments created</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90">
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..." className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl skeleton-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">No assignments found</div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm data-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">Assignment</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Subject</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Due Date</th>
                  <th className="px-4 py-3 text-center">Priority</th>
                  <th className="px-4 py-3 text-center hidden lg:table-cell">Marks</th>
                  <th className="px-4 py-3 text-center hidden lg:table-cell">Submissions</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((assignment, i) => {
                  const dueDate = new Date(assignment.dueDate);
                  const isOverdue = dueDate < new Date();
                  return (
                    <motion.tr key={assignment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium truncate max-w-48">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.isPublished ? "Published" : "Draft"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                        {assignment.subject.name} <span className="font-mono">({assignment.subject.code})</span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`text-xs font-medium ${isOverdue ? "text-red-500" : "text-emerald-500"}`}>
                          {dueDate.toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[assignment.priority]}`}>
                          {assignment.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell text-muted-foreground text-xs">
                        {assignment.totalMarks}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className="text-xs font-medium">{assignment._count?.submissions || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(assignment)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteAssignment(assignment.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{editingAssignment ? "Edit Assignment" : "New Assignment"}</h2>
                <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input {...register("title", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <select {...register("subjectId", { required: !editingAssignment })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea {...register("description", { required: true })} rows={4} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Due Date</label>
                    <input {...register("dueDate", { required: true })} type="date" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total Marks</label>
                    <input {...register("totalMarks")} type="number" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select {...register("priority")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register("isPublished")} type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">Publish immediately</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingAssignment ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
