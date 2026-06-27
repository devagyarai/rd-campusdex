/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Pencil, Trash2, Pin, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { CloudFileDTO, MediaGallery } from "@/components/upload/MediaGallery";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  admin: { firstName: string; lastName: string };
  attachment?: CloudFileDTO;
}

const CATEGORY_COLORS: Record<string, string> = {
  ACADEMIC: "badge-academic",
  EVENT: "badge-event",
  EXAMINATION: "badge-examination",
  GENERAL: "badge-general",
  EMERGENCY: "badge-emergency",
};

interface NoticeForm {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  expiresAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [attachedFile, setAttachedFile] = useState<CloudFileDTO | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<NoticeForm>({
    defaultValues: { category: "GENERAL", isPinned: false }
  });

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/admin/notices");
      if (res.ok) setNotices(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchNotices(); }, []);


  const openCreate = () => {
    setEditingNotice(null);
    setAttachedFile(null);
    reset({ title: "", content: "", category: "GENERAL", isPinned: false, expiresAt: "" });
    setModalOpen(true);
  };

  const openEdit = (n: Notice) => {
    setEditingNotice(n);
    setAttachedFile(n.attachment || null);
    setValue("title", n.title);
    setValue("content", n.content);
    setValue("category", n.category);
    setValue("isPinned", n.isPinned);
    setModalOpen(true);
  };

  const onSubmit = async (data: NoticeForm) => {
    setSaving(true);
    try {
      const url = editingNotice ? `/api/admin/notices/${editingNotice.id}` : "/api/admin/notices";
      const method = editingNotice ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, attachmentId: attachedFile?.id || null }),
      });
      if (res.ok) {
        toast.success(editingNotice ? "Notice updated" : "Notice published");
        setModalOpen(false);
        fetchNotices();
      } else {
        toast.error("Failed to save notice");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setSaving(false); }
  };

  const deleteNotice = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotices(prev => prev.filter(n => n.id !== id));
        toast.success("Notice deleted");
      }
    } catch { toast.error("Failed to delete"); }
  };

  const togglePin = async (n: Notice) => {
    try {
      const res = await fetch(`/api/admin/notices/${n.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...n, isPinned: !n.isPinned }),
      });
      if (res.ok) fetchNotices();
    } catch { toast.error("Failed to update"); }
  };

  const filtered = notices.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "ALL" || n.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-500" />
            Notice Management
          </h1>
          <p className="page-subtitle">{notices.length} notices published</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90">
          <Plus className="w-4 h-4" />
          New Notice
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notices..." className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none" />
        </div>
        {["ALL", "ACADEMIC", "EVENT", "EXAMINATION", "GENERAL", "EMERGENCY"].map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${catFilter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-accent"}`}>
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl skeleton-shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((notice, i) => (
            <motion.div key={notice.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm flex-1">{notice.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {notice.isPinned && <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded font-medium">📌 Pinned</span>}
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[notice.category] || "badge-general"}`}>{notice.category}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{notice.admin.firstName} {notice.admin.lastName}</span>
                    <span>·</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => togglePin(notice)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Toggle pin">
                    <Pin className={`w-4 h-4 ${notice.isPinned ? "text-orange-500" : "text-muted-foreground"}`} />
                  </button>
                  <button onClick={() => openEdit(notice)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Edit">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteNotice(notice.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{editingNotice ? "Edit Notice" : "New Notice"}</h2>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input {...register("title", { required: true })} placeholder="Notice title..." className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Category</label>
                    <select {...register("category")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                      {["ACADEMIC", "EVENT", "EXAMINATION", "GENERAL", "EMERGENCY"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Expires At</label>
                    <input {...register("expiresAt")} type="date" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Content</label>
                  <textarea {...register("content", { required: true })} rows={5} placeholder="Notice content..." className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Attachment (Optional)</label>
                  {attachedFile ? (
                    <MediaGallery 
                      files={[attachedFile]} 
                      onDelete={() => setAttachedFile(null)} 
                      className="mb-4"
                    />
                  ) : (
                    <FileDropzone
                      folder="notices"
                      maxSizeMB={20}
                      allowedExtensions={["pdf", "doc", "docx", "jpg", "png"]}
                      onUploadComplete={setAttachedFile}
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register("isPinned")} type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm font-medium">Pin this notice</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingNotice ? "Update" : "Publish"}
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
