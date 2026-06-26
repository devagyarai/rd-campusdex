/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Pencil, Trash2, Eye, X, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  semester: number;
  batch: string;
  phone?: string;
  gender?: string;
  profileImage?: string;
  user: { email: string; isActive: boolean; createdAt: string };
}

interface StudentForm {
  email: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  semester: number;
  batch: string;
  phone: string;
  gender: string;
}

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Management", "Mathematics", "Physics"];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [semFilter, setSemFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const { register, handleSubmit, reset, setValue } = useForm<StudentForm>();

  useEffect(() => { fetchStudents(); }, [search, deptFilter, semFilter, page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(perPage), search, department: deptFilter, semester: semFilter });
      const res = await fetch(`/api/admin/students?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setTotal(data.total);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setSelectedStudent(null);
    reset({ semester: 1, gender: "" });
    setModalMode("create");
  };

  const openEdit = (s: Student) => {
    setSelectedStudent(s);
    setValue("firstName", s.firstName);
    setValue("lastName", s.lastName);
    setValue("rollNumber", s.rollNumber);
    setValue("department", s.department);
    setValue("semester", s.semester);
    setValue("batch", s.batch);
    setValue("phone", s.phone || "");
    setValue("gender", s.gender || "");
    setValue("email", s.user.email);
    setModalMode("edit");
  };

  const openView = (s: Student) => {
    setSelectedStudent(s);
    setModalMode("view");
  };

  const onSubmit = async (data: StudentForm) => {
    setSaving(true);
    try {
      const url = modalMode === "edit" && selectedStudent
        ? `/api/admin/students/${selectedStudent.id}`
        : "/api/admin/students";
      const method = modalMode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(modalMode === "edit" ? "Student updated" : "Student created");
        setModalMode(null);
        fetchStudents();
      } else {
        const result = await res.json();
        toast.error(result.error || "Failed to save");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Student deleted");
        fetchStudents();
      } else {
        toast.error("Failed to delete");
      }
    } catch { toast.error("Something went wrong"); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-500" />
            Student Management
          </h1>
          <p className="page-subtitle">{total} students enrolled</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, roll, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={semFilter}
          onChange={(e) => { setSemFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
        >
          <option value="ALL">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Roll No.</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Department</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Semester</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Batch</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded skeleton-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{student.rollNumber}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{student.department}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="px-2 py-0.5 bg-accent rounded text-xs">{student.semester}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{student.batch}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${student.user.isActive ? "status-present" : "status-absent"}`}>
                        {student.user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openView(student)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteStudent(student.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {students.length > 0 ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total}` : "0 results"}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-border rounded-lg disabled:opacity-40 hover:bg-accent transition-colors">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="px-3 py-1 border border-border rounded-lg disabled:opacity-40 hover:bg-accent transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalMode(null)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">
                  {modalMode === "create" ? "Add Student" : modalMode === "edit" ? "Edit Student" : "Student Details"}
                </h2>
                <button onClick={() => setModalMode(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalMode === "view" && selectedStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
                      {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                      <p className="text-muted-foreground text-sm">{selectedStudent.user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Roll Number", selectedStudent.rollNumber],
                      ["Department", selectedStudent.department],
                      ["Semester", String(selectedStudent.semester)],
                      ["Batch", selectedStudent.batch],
                      ["Phone", selectedStudent.phone || "—"],
                      ["Gender", selectedStudent.gender || "—"],
                      ["Status", selectedStudent.user.isActive ? "Active" : "Inactive"],
                      ["Joined", new Date(selectedStudent.user.createdAt).toLocaleDateString()],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 bg-accent rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {modalMode === "create" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input {...register("email", { required: true })} type="email" placeholder="student@example.com" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name</label>
                      <input {...register("firstName", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input {...register("lastName", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Roll Number</label>
                      <input {...register("rollNumber", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Semester</label>
                      <select {...register("semester")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Department</label>
                    <select {...register("department", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Batch</label>
                      <input {...register("batch", { required: true })} placeholder="2021-2025" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone</label>
                      <input {...register("phone")} placeholder="+91..." className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {modalMode === "edit" ? "Update" : "Create Student"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
