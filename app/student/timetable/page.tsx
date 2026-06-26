/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const COLORS = [
  "bg-violet-500/20 border-violet-500/40 text-violet-600 dark:text-violet-400",
  "bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  "bg-orange-500/20 border-orange-500/40 text-orange-600 dark:text-orange-400",
  "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400",
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-400",
];

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  subject: { name: string; code: string };
}

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"weekly" | "daily">("weekly");
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    return DAYS[today === 0 ? 6 : today - 1] || "MONDAY";
  });

  const fetchTimetable = async () => {
    try {
      const res = await fetch("/api/student/timetable");
      if (res.ok) setTimetable(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

useEffect(() => { fetchTimetable(); }, []);


  const getClassesForDay = (day: string) => timetable.filter(t => t.day === day);
  const todayClasses = getClassesForDay(selectedDay);

  const subjectColorMap: Record<string, string> = {};
  timetable.forEach((t, i) => {
    if (!subjectColorMap[t.subject.code]) {
      subjectColorMap[t.subject.code] = COLORS[Object.keys(subjectColorMap).length % COLORS.length];
    }
  });

  if (loading) return (
    <div className="page-container">
      <div className="h-64 rounded-xl skeleton-shimmer" />
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Timetable
          </h1>
          <p className="page-subtitle">Your weekly class schedule</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === "weekly" ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === "daily" ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-accent/80"}`}
          >
            Daily
          </button>
        </div>
      </div>

      {view === "weekly" ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            <div className="p-3 text-xs font-medium text-muted-foreground border-r border-border" />
            {DAYS.map((day, i) => {
              const todayIdx = new Date().getDay();
              const isToday = (todayIdx === 0 ? 6 : todayIdx - 1) === i;
              return (
                <div
                  key={day}
                  className={`p-3 text-center text-xs font-semibold border-r border-border last:border-r-0 ${isToday ? "bg-violet-500/10 text-violet-500" : "text-muted-foreground"}`}
                >
                  {DAY_LABELS[i]}
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          {TIME_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-7 border-b border-border min-h-14">
              <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-start">
                {time}
              </div>
              {DAYS.map((day) => {
                const classes = timetable.filter(t => t.day === day && t.startTime <= time && t.endTime > time);
                return (
                  <div key={day} className="border-r border-border last:border-r-0 p-1">
                    {classes.map((cls) => (
                      <div
                        key={cls.id}
                        className={`rounded-md border p-1.5 text-xs ${subjectColorMap[cls.subject.code]}`}
                      >
                        <div className="font-semibold truncate">{cls.subject.code}</div>
                        <div className="text-xs opacity-70 truncate">{cls.room}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Day tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {DAYS.map((day, i) => {
              const todayIdx = new Date().getDay();
              const isToday = (todayIdx === 0 ? 6 : todayIdx - 1) === i;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedDay === day
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                      : "bg-accent hover:bg-accent/80"
                  }`}
                >
                  {DAY_LABELS[i]}
                  {isToday && <span className="ml-1 text-xs">•</span>}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No classes on {selectedDay.toLowerCase()}</p>
              </div>
            ) : (
              todayClasses
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((cls, i) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-xl border p-4 ${subjectColorMap[cls.subject.code]}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{cls.subject.name}</h3>
                        <p className="text-xs opacity-70 mt-0.5">{cls.subject.code}</p>
                      </div>
                      <div className="text-right text-xs opacity-70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.startTime} – {cls.endTime}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
