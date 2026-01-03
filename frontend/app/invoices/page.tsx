"use client";

import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Invoices() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) await processFile(file);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            await processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        setAnalyzing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/parse-invoice", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen p-8 md:p-12 flex flex-col items-center">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-3xl mb-12 text-center"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    AI Invoice & Packing List Parser
                </h1>
                <p className="mt-2 text-white/50">
                    Drop any PDF to instantly verify against Purchase Orders.
                </p>
            </motion.div>

            <div className="w-full max-w-2xl grid gap-8">
                {/* Upload Area */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative group cursor-pointer transition-all duration-300 ${analyzing ? "pointer-events-none opacity-50" : ""
                        }`}
                >

                    <input
                        type="file"
                        className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.png"
                    />

                    <GlassCard className={`border-2 border-dashed transition-all h-64 flex flex-col items-center justify-center gap-4 ${isDragOver ? "border-white/50 bg-white/10" : "border-white/10 hover:border-white/30"
                        }`}>
                        {analyzing ? (
                            <div className="flex flex-col items-center">
                                <Loader2 size={48} className="text-blue-400 animate-spin mb-4" />
                                <span className="text-lg font-medium text-white/80">Analyzing Document...</span>
                                <span className="text-sm text-white/40">Extracting Line Items & Totals</span>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={48} />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-medium text-white/90">Click or drag file to this area to upload</p>
                                    <p className="text-sm text-white/40 mt-1">Support for PDF, JPG, PNG</p>
                                </div>
                            </>
                        )}
                    </GlassCard>
                </div>

                {/* Results Area */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <GlassCard className={`border-l-4 ${result.decision.action === "APPROVE_INVOICE" ? "border-l-emerald-500" :
                                result.decision.action === "BLOCK_PAYMENT" ? "border-l-red-500" :
                                    result.decision.action === "ESCALATE_TO_FINANCE" ? "border-l-purple-500" :
                                        "border-l-amber-500"
                                }`}>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-white/40">AI Decision</span>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${result.decision.risk_level === "CRITICAL" ? "bg-red-500/20 border-red-500/50 text-red-400" :
                                                result.decision.risk_level === "HIGH" ? "bg-purple-500/20 border-purple-500/50 text-purple-400" :
                                                    result.decision.risk_level === "LOW" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                                                        "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                }`}>
                                                {result.decision.risk_level} RISK
                                            </span>
                                        </div>

                                        <h3 className={`text-2xl font-bold ${result.decision.action === "APPROVE_INVOICE" ? "text-emerald-400" :
                                            result.decision.action === "BLOCK_PAYMENT" ? "text-red-400" :
                                                result.decision.action === "ESCALATE_TO_FINANCE" ? "text-purple-400" :
                                                    "text-amber-400"
                                            }`}>
                                            {result.decision.action.replace(/_/g, " ")}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{result.extracted.total_amount}</div>
                                        <div className="text-xs text-white/40">Expected: {result.extracted.expected_amount}</div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-white/90 mb-6 flex gap-3 items-start">
                                    <div className="mt-0.5">
                                        {result.decision.action === "APPROVE_INVOICE" ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-amber-500" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Reasoning</p>
                                        <p className="text-white/70">{result.decision.reasoning}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">Extracted Line Items</h4>
                                    {result.extracted.line_items.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                            <div>
                                                <span className="block font-medium text-white/90">{item.sku}</span>
                                                <span className="text-xs text-white/50">Qty: {item.qty}</span>
                                            </div>
                                            <span className="text-white/70">${item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => alert("Opening detailed line-item comparison view...")}
                                        className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                                    >
                                        View Mismatch Details
                                    </button>
                                    {result.decision.action !== "APPROVE_INVOICE" && (
                                        <button
                                            onClick={() => alert("Override requested. Manager approval sent.")}
                                            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                                        >
                                            Override Decision
                                        </button>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
