"use client";

import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, GraduationCap, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isRollingOver, setIsRollingOver] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleRollover = async () => {
    if (!confirm("WARNING: This will start a new academic year. All students will be forced to select new classes on their next login. Continue?")) return;
    
    setIsRollingOver(true);
    // In a real app, this would hit an API to update all students or set a system flag
    setTimeout(() => {
      alert("New academic year triggered successfully!");
      setIsRollingOver(false);
    }, 2000);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your profile and system preferences</p>
      </header>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <p className="text-lg font-bold text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </section>

        {/* System Management */}
        <section className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">System Management</h2>
          </div>
          
          <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-orange-900">Yearly Class Rollover</h3>
                <p className="text-sm text-orange-700 mt-1 mb-4">
                  Triggering a new academic year will archive current progress and force students to re-register their classes. This action cannot be undone.
                </p>
                <button 
                  onClick={handleRollover}
                  disabled={isRollingOver}
                  className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center gap-2"
                >
                  {isRollingOver ? <Loader2 className="animate-spin w-4 h-4" /> : <GraduationCap size={18} />}
                  Trigger New Academic Year
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
