/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Users,
  BarChart3,
  Bell,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Globe,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Smart Attendance",
    description: "Real-time attendance tracking with analytics, subject-wise reports, and automated alerts for low attendance.",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/25",
  },
  {
    icon: Calendar,
    title: "Timetable Management",
    description: "Dynamic weekly schedules with daily views, conflict detection, and calendar integration.",
    gradient: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/25",
  },
  {
    icon: BookOpen,
    title: "Assignment Tracking",
    description: "Create, submit, and track assignments with priority levels, due dates, and progress monitoring.",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
  },
  {
    icon: Bell,
    title: "Notice Board",
    description: "Centralized notice system with categories, pinning, and real-time notifications for all stakeholders.",
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-500/25",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics with attendance trends, performance metrics, and custom reports.",
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/25",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Enterprise-grade security with JWT authentication and separate dashboards for students and administrators.",
    gradient: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/25",
  },
];

const stats = [
  { value: "10K+", label: "Students", icon: Users },
  { value: "500+", label: "Institutions", icon: Globe },
  { value: "98%", label: "Uptime", icon: Zap },
  { value: "4.9★", label: "Rating", icon: Star },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "HOD, Computer Science",
    college: "IIT Bombay",
    content: "CampusDex transformed how we manage our department. Attendance tracking alone saved us 3 hours per week.",
    avatar: "PS",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Rahul Mehta",
    role: "Final Year Student",
    college: "NIT Trichy",
    content: "Finally a platform that feels modern. I can track all my assignments, attendance, and notes in one place.",
    avatar: "RM",
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Prof. Anjali Nair",
    role: "Principal",
    college: "BITS Pilani",
    content: "The analytics dashboard gives us insights we never had before. Student performance has improved by 23%.",
    avatar: "AN",
    color: "from-emerald-500 to-teal-600",
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#stats" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                RD <span className="gradient-text">CampusDex</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid opacity-40" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Enterprise Smart Campus ERP Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              The Future of{" "}
              <span className="gradient-text">Campus Management</span>
              <br />
              is Here
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              RD CampusDex unifies attendance, timetables, assignments, notices, and analytics
              into one premium platform. Built for modern universities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl shadow-white/10"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-8 py-4 border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all duration-300"
              >
                View Demo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Admin: admin@campusdex.com / Admin@123</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Student: student1@campusdex.com / Student@123</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50 animate-pulse-glow">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <div className="flex-1 mx-4">
                    <div className="bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500">
                      https://campusdex.vercel.app/student/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock dashboard grid */}
                <div className="p-6 grid grid-cols-12 gap-4 min-h-64">
                  {/* Sidebar mock */}
                  <div className="col-span-2 space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`h-8 rounded-lg ${i === 0 ? "bg-violet-500/40" : "bg-white/5"}`} />
                    ))}
                  </div>
                  {/* Main content mock */}
                  <div className="col-span-10 space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { color: "from-violet-500/20 to-purple-600/20", label: "89%" },
                        { color: "from-blue-500/20 to-cyan-600/20", label: "6" },
                        { color: "from-emerald-500/20 to-teal-600/20", label: "12" },
                        { color: "from-orange-500/20 to-amber-600/20", label: "8" },
                      ].map((card, i) => (
                        <div key={i} className={`h-20 rounded-xl bg-gradient-to-br ${card.color} border border-white/10 flex items-center justify-center`}>
                          <span className="text-2xl font-bold text-white/70">{card.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 h-32 rounded-xl bg-white/5 border border-white/10" />
                      <div className="h-32 rounded-xl bg-white/5 border border-white/10" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow under card */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-violet-500/20 blur-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Everything you need
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="gradient-text">Modern Campuses</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Every tool your institution needs, beautifully integrated into one platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} shadow-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">Educators</span>
            </h2>
            <p className="text-gray-400 text-lg">Trusted by institutions across India</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role} · {t.college}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">&quot;{t.content}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-blue-600/10 to-purple-600/20 p-12 overflow-hidden">
              <div className="absolute inset-0 hero-grid opacity-20" />
              <div className="relative">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Transform Your Campus?
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of students and educators already using RD CampusDex.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/register"
                    className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-8 py-4 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Try Demo
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">RD CampusDex</span>
            </Link>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <span>© 2024 RD CampusDex</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-600">
              Built with ❤️ for modern education
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
