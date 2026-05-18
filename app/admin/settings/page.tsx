"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/layout/Toast";
import { Loader2, Save } from "lucide-react";

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
    showToast(`Setting ${key} saved`, "success");
    setSavingKey(null);
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold">Setting Key</th>
              <th className="p-4 font-bold">Value</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(settings).map(([key, value]) => (
              <tr key={key} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-700">{key}</td>
                <td className="p-4">
                  <input 
                    value={value}
                    onChange={(e) => setSettings({...settings, [key]: e.target.value})}
                    className="border p-2 rounded w-full"
                  />
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => saveSetting(key, value)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 mx-auto"
                  >
                    {savingKey === key ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
