/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Pin, Filter, AlertTriangle, Calendar, BookOpen, Info } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: "ACADEMIC" | "EVENT" | "EXAMINATION" | "GENERAL" | "EMERGENCY";
  isPinned: boolean;
  createdAt: string;
  admin: { firstName: string; lastName: string };
}

const CATEGORY_CONFIG = {
  ACADEMIC: { label: "Academic", class: "badge-academic", icon: BookOpen, color: "border-blue-500/20 bg-blue-500/5" },
  EVENT: { label: "Event", class: "badge-event", icon: Calendar, color: "border-purple-500/20 bg-purple-500/5" },
  EXAMINATION: { label: "Exam", class: "badge-examination", icon: BookOpen, color: "border-orange-500/20 bg-orange-500/5" },
  GENERAL: { label: "General", class: "badge-general", icon: Info, color: "border-gray-500/20 bg-gray-500/5" },
  EMERGENCY: { label: "Emergency", class: "badge-emergency", icon: AlertTriangle, color: "border-red-500/20 bg-red-500/5" },
};

const CATEGORIES = ["ALL", "ACADEMIC", "EVENT", "EXAMINATION", "GENERAL", "EMERGENCY"];

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      if (res.ok) setNotices(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchNotices(); }, []);


  const filtered = notices.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || n.category === categoryFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Bell className="w-6 h-6 text-rose-500" />
          Notice Board
        </h1>
        <p className="page-subtitle">Stay updated with campus announcements and events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none"
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
              {cat === "ALL" ? "All" : CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground mb-4">{filtered.length} notice{filtered.length !== 1 ? "s" : ""}</p>

      {/* Notices */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl skeleton-shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice, i) => {
            const config = CATEGORY_CONFIG[notice.category];
            const CategoryIcon = config.icon;
            const isExpanded = expanded === notice.id;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border ${config.color} overflow-hidden`}
              >
                <button
                  className="w-full p-5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : notice.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notice.category === "EMERGENCY" ? "bg-red-500/20" : "bg-primary/10"}`}>
                      {notice.isPinned ? (
                        <Pin className="w-4 h-4 text-orange-500" />
                      ) : (
                        <CategoryIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm flex-1">{notice.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {notice.isPinned && (
                            <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded font-medium">
                              📌 Pinned
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.class}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>By {notice.admin.firstName} {notice.admin.lastName}</span>
                        <span>·</span>
                        <span>{new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{notice.content}</p>
                      )}
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="px-5 pb-5"
                  >
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
