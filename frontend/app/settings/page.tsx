export default function Settings() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-8 md:p-12">
            <div className="mb-10">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">System configuration</p>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Daily Summary Email</span>
                            <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Escalation Alerts</span>
                            <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">System Actions</h3>
                    <button className="text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-md transition-colors -ml-3">
                        Reset Demo Data
                    </button>
                </div>
            </div>
        </div>
    );
}
