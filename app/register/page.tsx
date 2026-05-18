"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/layout/Toast";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email/NISN is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  classId: z.string().min(1, "Please select your class"),
});

export default function RegisterPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; className: string }[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClasses(data);
      })
      .catch(err => console.error("Failed to load classes", err));
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Registration failed", "error");
        return;
      }

      showToast("Registration successful! Please login.", "success");
      window.location.href = "/";
    } catch (error) {
      console.error("Registration error:", error);
      showToast("An error occurred during registration", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center">
            <span className="text-4xl font-black tracking-tighter text-blue-600 italic">Vox</span>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">Vocab</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Join VoxVocab</h1>
        <p className="text-gray-600 mb-8 text-center">Create your student account.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register("name")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email / NISN</label>
              <input {...register("email")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select {...register("classId")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Select your class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
            {errors.classId && <p className="text-xs text-red-500 mt-1">{errors.classId.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" {...register("password")} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link href="/" className="text-blue-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
