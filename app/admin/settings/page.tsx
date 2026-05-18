"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/layout/Toast";
import { Loader2, Save, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setSettings(mapped);
        setLoading(false);
      });
  }, []);

  const saveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    await fetch("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
    showToast(`Setting "${key}" saved successfully`, "success");
    setSavingKey(null);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-blue-600" />
          System Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure and manage core system parameters.</p>
      </header>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 capitalize mb-1">
                {key.replace(/-/g, " ")}
              </label>
              <input 
                value={value}
                onChange={(e) => setSettings({...settings, [key]: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button 
              onClick={() => saveSetting(key, value)} 
              disabled={savingKey === key}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-xl font-semibold transition-all h-[42px] min-w-[120px]"
            >
              {savingKey === key ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <><Save size={18} /> Save</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
