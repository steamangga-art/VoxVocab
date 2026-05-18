"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/layout/Toast";

const loginSchema = z.object({
  email: z.string().min(1, "Email/NISN is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Redirect if already logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === "TEACHER") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/student/dashboard";
        }
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Login failed", "error");
        return;
      }

      // Store user data in localStorage for session handling
      localStorage.setItem("user", JSON.stringify(result.user));

      // Simple routing based on role
      if (result.user.role === "TEACHER") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("An error occurred during login", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/70 p-8 rounded-3xl shadow-2xl border border-white/20">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center">
            <span className="text-4xl font-black tracking-tighter text-blue-600 italic">Vox</span>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">Vocab</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-600 mb-8 text-center">Login to continue your learning journey.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or NISN</label>
            <input {...register("email")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" {...register("password")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
