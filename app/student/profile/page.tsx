"use client";

import { useState, useEffect } from "react";
import { User, GraduationCap, Award, BookOpen, Clock } from "lucide-react";

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

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
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {user?.name?.[0]}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{user?.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                STUDENT
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Award size={20} /> Achievement Level
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Level 4: Word Collector</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[75%]"></div>
                </div>
              </div>
              <p className="text-[10px] text-blue-100 italic">250 more words to reach Master level</p>
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
                <p className="text-lg font-bold text-gray-900">XII RPL 1</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Major</label>
                <p className="text-lg font-bold text-gray-900">Software Engineering</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Academic Year</label>
                <p className="text-lg font-bold text-gray-900">2025/2026</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Join Date</label>
                <p className="text-lg font-bold text-gray-900">Jan 12, 2025</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="text-blue-600" /> Learning Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">124</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Vocab Bank</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">82%</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mastery Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Quizzes Taken</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
