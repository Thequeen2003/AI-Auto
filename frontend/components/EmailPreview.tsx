"use client";

import { motion } from "framer-motion";
import { X, Send, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface EmailPreviewProps {
    data: any;
    onClose: () => void;
}

export default function EmailPreview({ data, onClose }: EmailPreviewProps) {
    if (!data) return null;

    const isOverdue = data.status === "Overdue";
    const statusColor = isOverdue ? "text-red-600" : "text-amber-600";
    const statusBg = isOverdue ? "bg-red-50" : "bg-amber-50";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${statusBg} ${statusColor}`}>
                            {isOverdue ? <AlertCircle size={16} /> : <Clock size={16} />}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Email Preview</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</p>
                        <p className="text-sm font-medium text-gray-900">
                            {isOverdue
                                ? `Action Required: ${data.milestone.name} Overdue – PO ${data.po}`
                                : `Reminder: ${data.milestone.name} Due Soon – PO ${data.po}`
                            }
                        </p>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Body</p>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            Hi {data.factory},

                            This is a reminder that the {data.milestone.name} for PO {data.po} was due on {data.milestone.date} and is now {data.status.toLowerCase()}.

                            Please confirm submission as soon as possible to avoid shipment delays.

                            Thank you,
                            Production Team
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <span>Generated automatically by Production OS</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 size={14} />
                        <span>Sent today at 9:41 AM</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
