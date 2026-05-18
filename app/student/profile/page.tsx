"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Award, BookOpen } from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/";
      return;
    }

    const { id } = JSON.parse(userData);

    fetch("/api/user/profile", {
      method: "POST",
      body: JSON.stringify({ userId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">View your learning progress and account details</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 uppercase">
              {profile?.name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{profile?.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="text-blue-600" /> Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Current Class</label>
                <p className="text-lg font-bold text-gray-900">{profile?.class?.className || "-"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Join Date</label>
                <p className="text-lg font-bold text-gray-900">{new Date(profile?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-600" /> Learning Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile?.vocabularies?.length || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Vocab Bank</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile?.masteryRate || 0}%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mastery Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile?.quizCount || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Quizzes Taken</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
