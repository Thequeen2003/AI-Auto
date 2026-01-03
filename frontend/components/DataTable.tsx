"use client";

import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

interface Milestone {
    name: string;
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

export default function DataTable({ data }: { data: POData[] }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm text-white/70">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/50">
                    <tr>
                        <th className="px-6 py-4 font-medium">Factory</th>
                        <th className="px-6 py-4 font-medium">PO Number</th>
                        <th className="px-6 py-4 font-medium">Milestone Progress</th>
                        <th className="px-6 py-4 font-medium">Ship Date</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((row, i) => (
                        <motion.tr
                            key={row.po}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-white/5 transition-colors"
                        >
                            <td className="px-6 py-4 font-medium text-white">{row.factory}</td>
                            <td className="px-6 py-4 font-mono text-white/60">{row.po}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 h-2 max-w-[150px]">
                                    {row.milestones.map((ms, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex-1 rounded-full ${ms.color === 'red' ? 'bg-red-500' :
                                                    ms.color === 'yellow' ? 'bg-amber-400' :
                                                        'bg-emerald-500/30'
                                                }`}
                                            title={`${ms.name}: ${ms.status}`}
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-white/60">{row.ship_date}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="rounded-lg p-2 hover:bg-white/10 text-white/40 hover:text-white">
                                    <MoreHorizontal size={16} />
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
