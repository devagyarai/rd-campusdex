/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: number;
  batch: string;
  department: string;
  subject: { id: string; name: string; code: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  department: string;
}

interface TimetableForm {
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: number;
  batch: string;
  department: string;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [semFilter, setSemFilter] = useState("3");

  const { register, handleSubmit, reset, setValue } = useForm<TimetableForm>({
    defaultValues: { semester: 3, batch: "2022-2026", department: "Computer Science" }
  });

  useEffect(() => {
    fetchData();
  }, [semFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ttRes, subRes] = await Promise.all([
        fetch(`/api/admin/timetable?semester=${semFilter}`),
        fetch("/api/admin/subjects"),
      ]);
      if (ttRes.ok) setTimetable(await ttRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingEntry(null);
    reset({ semester: parseInt(semFilter), batch: "2022-2026", department: "Computer Science" });
    setModalOpen(true);
  };

  const openEdit = (e: TimetableEntry) => {
    setEditingEntry(e);
    setValue("subjectId", e.subject.id);
    setValue("day", e.day);
    setValue("startTime", e.startTime);
    setValue("endTime", e.endTime);
    setValue("room", e.room);
    setValue("semester", e.semester);
    setValue("batch", e.batch);
    setValue("department", e.department);
    setModalOpen(true);
  };

  const onSubmit = async (data: TimetableForm) => {
    setSaving(true);
    try {
      const url = editingEntry ? `/api/admin/timetable/${editingEntry.id}` : "/api/admin/timetable";
      const method = editingEntry ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, semester: parseInt(String(data.semester)) }),
      });
      if (res.ok) {
        toast.success(editingEntry ? "Entry updated" : "Class added");
        setModalOpen(false);
        fetchData();
      } else {
        toast.error("Failed to save");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Remove this class?")) return;
    try {
      const res = await fetch(`/api/admin/timetable/${id}`, { method: "DELETE" });
      if (res.ok) { setTimetable(prev => prev.filter(t => t.id !== id)); toast.success("Class removed"); }
    } catch { toast.error("Failed to delete"); }
  };

  const getClassesForDay = (day: string) => timetable.filter(t => t.day === day);

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Timetable Management
          </h1>
          <p className="page-subtitle">{timetable.length} scheduled classes</p>
        </div>
        <div className="flex gap-3">
          <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className="px-3 py-2 text-sm bg-card border border-border rounded-lg">
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90">
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="h-96 rounded-xl skeleton-shimmer" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            <div className="p-3 border-r border-border" />
            {DAYS.map((day, i) => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground border-r border-border last:border-0">
                {DAY_LABELS[i]}
                <div className="text-xs font-normal">{getClassesForDay(day).length} classes</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-64">
            <div className="border-r border-border p-2 text-xs text-muted-foreground">Classes</div>
            {DAYS.map((day) => (
              <div key={day} className="border-r border-border last:border-0 p-2 space-y-1.5">
                {getClassesForDay(day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                  <div key={entry.id} className="group rounded-lg bg-violet-500/10 border border-violet-500/20 p-2 text-xs">
                    <div className="font-semibold text-violet-600 dark:text-violet-400 truncate">{entry.subject.code}</div>
                    <div className="text-muted-foreground">{entry.startTime}</div>
                    <div className="text-muted-foreground">{entry.room}</div>
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(entry)} className="p-0.5 rounded hover:bg-accent"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => deleteEntry(entry.id)} className="p-0.5 rounded hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{editingEntry ? "Edit Class" : "Add Class"}</h2>
                <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <select {...register("subjectId", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Day</label>
                    <select {...register("day", { required: true })} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Room</label>
                    <input {...register("room", { required: true })} placeholder="LH-101" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Time</label>
                    <input {...register("startTime", { required: true })} type="time" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Time</label>
                    <input {...register("endTime", { required: true })} type="time" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Semester</label>
                    <select {...register("semester")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Batch</label>
                    <input {...register("batch", { required: true })} placeholder="2022-2026" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Department</label>
                  <input {...register("department", { required: true })} placeholder="Computer Science" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingEntry ? "Update" : "Add Class"}
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
