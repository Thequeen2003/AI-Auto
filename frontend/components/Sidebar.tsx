"use client";

import { Home, FileText, Truck, Settings, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const navItems = [
    { name: "Production", href: "/", icon: Home },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Logistics", href: "/logistics", icon: Truck },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
            <div className="flex h-full flex-col">
                {/* Logo Area */}
                <div className="flex h-16 items-center px-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gray-900" />
                        <span className="text-sm font-semibold tracking-tight text-gray-900">Production OS</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon size={16} className={clsx(isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Footer */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">Demo User</span>
                            <span className="text-xs text-gray-500">Production Mgr</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
