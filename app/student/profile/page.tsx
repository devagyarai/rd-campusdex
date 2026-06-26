/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Camera, Lock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  rollNumber: string;
  department: string;
  semester: number;
  batch: string;
  profileImage?: string;
}

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { register, handleSubmit, reset } = useForm<ProfileData>();
  const { register: registerPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();

  const profile = user?.student;
  const initials = profile ? `${profile.firstName[0]}${profile.lastName[0]}` : "S";

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: (profile as unknown as ProfileData).phone || "",
        address: (profile as unknown as ProfileData).address || "",
        dateOfBirth: (profile as unknown as ProfileData).dateOfBirth ? new Date((profile as unknown as ProfileData).dateOfBirth).toISOString().split("T")[0] : "",
        gender: (profile as unknown as ProfileData).gender || "",
        rollNumber: profile.rollNumber || "",
        department: profile.department || "",
        semester: (profile as unknown as ProfileData).semester || 1,
        batch: (profile as unknown as ProfileData).batch || "",
      });
    }
  }, [profile, reset]);

  const onProfileSubmit = async (data: ProfileData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/profile", {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        await fetch("/api/student/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileImage: url }),
        });
        toast.success("Profile picture updated");
        refreshUser();
      } else {
        toast.error("Upload failed. Check Cloudinary configuration.");
      }
    } catch { toast.error("Upload failed"); }
    finally { setUploadingImage(false); }
  };

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          My Profile
        </h1>
        <p className="page-subtitle">Manage your account information and security settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border bg-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs px-2 py-1 bg-accent rounded-lg">{profile?.rollNumber}</span>
              <span className="text-xs px-2 py-1 bg-accent rounded-lg">{profile?.department}</span>
              <span className="text-xs px-2 py-1 bg-violet-500/10 text-violet-500 rounded-lg font-medium">Student</span>
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
                <input {...register("firstName")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <input {...register("lastName")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input {...register("phone")} placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input {...register("dateOfBirth")} type="date" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Gender</label>
                <select {...register("gender")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Semester</label>
                <select {...register("semester")} className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <textarea {...register("address")} rows={2} placeholder="Your address..." className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500 resize-none" />
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
              <input {...registerPwd("currentPassword", { required: true })} type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input {...registerPwd("newPassword", { required: true, minLength: 8 })} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input {...registerPwd("confirmPassword", { required: true })} type="password" placeholder="••••••••" className="w-full px-3 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:border-violet-500" />
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
