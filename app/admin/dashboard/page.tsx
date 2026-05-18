"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Menu,
  Bell,
  Search
} from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      window.location.href = "/";
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== "TEACHER") {
        window.location.href = "/student/dashboard";
        return;
      }
    } catch (e) {
      window.location.href = "/";
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
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 bg-white border border-gray-100 rounded-lg text-gray-600"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
              <p className="text-gray-500">Welcome back, Administrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white border border-gray-200 px-3 py-2 rounded-xl">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search..." className="bg-transparent outline-none px-2 text-sm w-40" />
            </div>
            <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
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

        {/* Tables/Lists Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Activity */}
          <div className="xl:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Student Activity</h2>
              <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
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

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 lg:p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                <Users size={24} />
                <span className="text-xs font-medium">Add Student</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                <BookOpen size={24} />
                <span className="text-xs font-medium">New Class</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                <Bell size={24} />
                <span className="text-xs font-medium">Broadcast</span>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                <GraduationCap size={24} />
                <span className="text-xs font-medium">Reports</span>
              </button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-sm text-blue-100 mb-4">Live vocabulary insight</p>
              <div className="text-4xl font-bold">Real-time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
