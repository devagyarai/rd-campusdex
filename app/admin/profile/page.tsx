/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";

interface AdminProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
}

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { register, handleSubmit, reset } = useForm<AdminProfileData>();
  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();

  const profile = user?.admin;
  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : "A";

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: (profile as unknown as AdminProfileData).phone || "",
        employeeId: profile.employeeId || "",
        designation: (profile as unknown as AdminProfileData).designation || "",
        department: profile.department || "",
      });
    }
  }, [profile, reset]);

  const onProfileSubmit = async (data: AdminProfileData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        refreshUser();
      } else {
        toast.error("Failed to update profile");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const onPasswordSubmit = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        resetPwd();
      } else {
        const result = await res.json();
        toast.error(result.error || "Failed to change password");
      }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <User className="w-6 h-6 text-orange-500" />
          Admin Profile
        </h1>
        <p className="page-subtitle">Manage your administrator account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-2 py-1 bg-accent rounded-lg font-mono">{profile?.employeeId}</span>
              <span className="text-xs px-2 py-1 bg-accent rounded-lg">{(profile as unknown as AdminProfileData)?.designation}</span>
              <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg font-medium">Administrator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-0">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "profile" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "password" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Lock className="w-4 h-4" />
          Security
        </button>
      </div>

      {activeTab === "profile" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="rounded-xl border bg-card p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name</label>
                <input {...register("firstName")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <input {...register("lastName")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input {...register("phone")} placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Department</label>
                <input {...register("department")} disabled className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed" />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="rounded-xl border bg-card p-6 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input {...registerPwd("currentPassword", { required: true })} type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input {...registerPwd("newPassword", { required: true, minLength: 8 })} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input {...registerPwd("confirmPassword", { required: true })} type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-orange-500" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
