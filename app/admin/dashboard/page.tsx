"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  Award,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<"class" | "global">("global");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalVocabs: 0,
    efficiency: "0%",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      Promise.all([
        fetch("/api/admin/stats").then(res => res.json()),
        fetch("/api/admin/recent-activity").then(res => res.json()),
        fetch(`/api/leaderboard?type=${activeTab}&userId=${user.id}`).then(res => res.json())
      ]).then(([statsData, activityData, leaderboardData]) => {
        setStats(statsData);
        setActivities(activityData);
        setLeaderboard(leaderboardData);
        setLoading(false);
      });
    } catch (e) {
      router.push("/");
    }
  }, [router, activeTab]);

  const statCards = [
    { label: "Active Students", value: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Classes", value: stats.totalClasses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Vocab Words", value: stats.totalVocabs, icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Mastery Rate", value: stats.efficiency, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Overview</h1>
        <p className="text-gray-500">Welcome back, {userName || "Administrator"}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`p-3 ${card.bg} rounded-2xl mb-4 w-fit`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {activities.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{item.user[0]}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.user}</p>
                    <p className="text-sm text-gray-500">{item.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-yellow-500" /> Top Students
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setActiveTab("global")} className={`px-3 py-1 text-xs font-bold rounded-lg ${activeTab === 'global' ? 'bg-white shadow' : 'text-gray-500'}`}>Global</button>
              <button onClick={() => setActiveTab("class")} className={`px-3 py-1 text-xs font-bold rounded-lg ${activeTab === 'class' ? 'bg-white shadow' : 'text-gray-500'}`}>Class</button>
            </div>
          </div>
          <div className="space-y-4">
            {leaderboard.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-400 w-6">#{i + 1}</span>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                </div>
                <span className="font-bold text-blue-600">{item.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
