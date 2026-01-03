"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Truck, Anchor, Plane, MapPin, Package, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Shipment {
    id: string;
    po: string;
    carrier: string;
    tracking_number: string;
    status: string;
    location: string;
    eta: string;
    progress: number;
}

export default function Logistics() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/logistics")
            .then((res) => res.json())
            .then((data) => {
                setShipments(data);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    const getIcon = (carrier: string) => {
        if (carrier.includes("Air") || carrier.includes("DHL")) return <Plane size={20} className="text-sky-400" />;
        return <Anchor size={20} className="text-blue-400" />;
    };

    return (
        <div className="min-h-screen p-8 md:p-12">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-bold text-white/90">Global Logistics</h1>
                <p className="mt-2 text-white/50">Real-time shipment tracking and carrier integration.</p>
            </motion.div>

            {loading ? (
                <div className="text-white/50">Loading tracking data...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shipments.map((shipment, i) => (
                        <GlassCard key={shipment.id} delay={i * 0.1} className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-white/5 border border-white/10">
                                            {getIcon(shipment.carrier)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{shipment.carrier}</h3>
                                            <p className="text-xs text-white/40 font-mono">{shipment.tracking_number}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${shipment.status === 'Delivered'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        {shipment.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Package size={16} className="text-white/40 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-white/80">PO #{shipment.po}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-white/40 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-white/80">{shipment.location}</p>
                                            <p className="text-xs text-white/40">Current Location</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock size={16} className="text-white/40 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-white/80">{shipment.eta}</p>
                                            <p className="text-xs text-white/40">Estimated Arrival</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-white/40 mb-2">
                                    <span>Progress</span>
                                    <span>{shipment.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${shipment.progress}%` }}
                                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                        className={`h-full rounded-full ${shipment.progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                                            }`}
                                    />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
