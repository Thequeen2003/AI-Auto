"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EmailPreview from "@/components/EmailPreview";
import { MoreHorizontal } from "lucide-react";

interface Milestone {
  name: string;
  date: string;
  days_remaining: number;
  status: string;
  color: string;
}

interface POData {
  factory: string;
  po: string;
  sku: string;
  ship_date: string;
  milestones: Milestone[];
}

export default function Dashboard() {
  const [data, setData] = useState<POData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ po: string, factory: string, milestone: Milestone, status: string } | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 md:p-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Production Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Automated milestone tracking & reminders</p>
      </div>

      {/* Main Content Table (Card) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading monitoring data...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Factory</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Milestone</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">System Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row) => {
                // Find the defining milestone (simplification: first non-completed or critical one)
                // For demo, we stick to the last one in the list which usually drives status
                const currentMilestone = row.milestones[row.milestones.length - 2];
                if (!currentMilestone) return null;

                return (
                  <tr
                    key={row.po}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem({
                      po: row.po,
                      factory: row.factory,
                      milestone: currentMilestone,
                      status: currentMilestone.status
                    })}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.factory}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.po}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{currentMilestone.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">{currentMilestone.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentMilestone.status === "Overdue"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : currentMilestone.status === "Due Soon"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${currentMilestone.status === "Overdue" ? "bg-red-500" :
                            currentMilestone.status === "Due Soon" ? "bg-amber-500" :
                              "bg-emerald-500"
                          }`} />
                        {currentMilestone.status === "Overdue" ? "OVERDUE" :
                          currentMilestone.status === "Due Soon" ? "DUE SOON" :
                            "ON TRACK"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {currentMilestone.status === "Overdue" && (
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                          Escalation email sent today
                        </span>
                      )}
                      {currentMilestone.status === "Due Soon" && (
                        <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                          Reminder scheduled
                        </span>
                      )}
                      {currentMilestone.status === "On Track" && (
                        <span className="text-gray-300">
                          --
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Preview Modal */}
      {selectedItem && (
        <EmailPreview data={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

    </div>
  );
}
