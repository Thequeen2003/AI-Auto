import GlassCard from "@/components/GlassCard";

export default function Reports() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-8 md:p-12">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports</h1>
                <p className="text-sm text-gray-500 mt-1">Production analytics and export</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">Analytics Engine Ready</h3>
                <p className="text-gray-500 mt-2 mb-6">Detailed production velocity and error rate reports will appear here.</p>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    Export Current Data
                </button>
            </div>
        </div>
    );
}
