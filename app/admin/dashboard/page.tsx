"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalVocabs: 0,
    efficiency: "0%",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate session
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== "TEACHER") {
        router.push("/student/dashboard");
        return;
      }
      setUserName(user.name);
    } catch (e) {
      router.push("/");
      return;
    }

    // Fetch data
    Promise.all([
      fetch("/api/admin/stats").then(res => res.json()),
      fetch("/api/admin/recent-activity").then(res => res.json())
    ]).then(([statsData, activityData]) => {
      setStats(statsData);
      setActivities(activityData);
      setLoading(false);
    }).catch(err => {
      console.error("Dashboard data error:", err);
      setLoading(false);
    });
  }, [router]);

  const statCards = [
    { label: "Active Students", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Classes", value: stats.totalClasses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Vocab Words", value: stats.totalVocabs, icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Mastery Rate", value: stats.efficiency, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Overview</h1>
        <p className="text-gray-500">Welcome back, {userName || "Administrator"}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${card.bg} rounded-2xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Student Activity</h2>
          <button 
            onClick={() => router.push("/admin/students")}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-6">
          {activities.length > 0 ? activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {item.user[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.user}</p>
                  <p className="text-sm text-gray-500">{item.action}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">{item.time}</span>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-8">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
