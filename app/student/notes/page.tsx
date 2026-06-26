/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, Pin, Pencil, Trash2, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["ALL", "LECTURE", "STUDY", "PERSONAL", "PROJECT", "RESEARCH", "OTHER"];
const CATEGORY_COLORS: Record<string, string> = {
  LECTURE: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  STUDY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PERSONAL: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  PROJECT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  RESEARCH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<{
    title: string; content: string; category: string; tags: string;
  }>();

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/student/notes");
      if (res.ok) setNotes(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchNotes(); }, []);


  const openCreate = () => {
    setEditingNote(null);
    reset({ title: "", content: "", category: "LECTURE", tags: "" });
    setIsModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setValue("title", note.title);
    setValue("content", note.content);
    setValue("category", note.category);
    setValue("tags", note.tags || "");
    setIsModalOpen(true);
  };

  const onSubmit = async (data: { title: string; content: string; category: string; tags: string }) => {
    setSaving(true);
    try {
      const url = editingNote ? `/api/student/notes/${editingNote.id}` : "/api/student/notes";
      const method = editingNote ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(editingNote ? "Note updated" : "Note created");
        setIsModalOpen(false);
        fetchNotes();
      } else {
        toast.error("Failed to save note");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/student/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
        toast.success("Note deleted");
      }
    } catch { toast.error("Failed to delete"); }
  };

  const togglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/student/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, isPinned: !note.isPinned }),
      });
      if (res.ok) fetchNotes();
    } catch { toast.error("Failed to update"); }
  };

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || n.category === categoryFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-500" />
            My Notes
          </h1>
          <p className="page-subtitle">Create and organize your study notes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"
              }`}
            >
              {cat === "ALL" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl skeleton-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No notes found</p>
          <p className="text-muted-foreground text-sm">Create your first note to get started</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl border bg-card p-5 card-hover relative"
            >
              {note.isPinned && (
                <Pin className="w-4 h-4 text-orange-500 absolute top-4 right-4" />
              )}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate pr-6">{note.title}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${CATEGORY_COLORS[note.category] || ""}`}>
                    {note.category}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4 mb-4">{note.content}</p>
              {note.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.split(",").map(tag => (
                    <span key={tag} className="text-xs bg-accent px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" />{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => togglePin(note)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "text-orange-500" : "text-muted-foreground"}`} />
                  </button>
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{editingNote ? "Edit Note" : "New Note"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input
                    {...register("title", { required: true })}
                    placeholder="Note title..."
                    className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    {...register("category")}
                    className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== "ALL").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Content</label>
                  <textarea
                    {...register("content", { required: true })}
                    rows={6}
                    placeholder="Write your note..."
                    className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tags (comma-separated)</label>
                  <input
                    {...register("tags")}
                    placeholder="math, calculus, lecture"
                    className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingNote ? "Update" : "Create"}
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
