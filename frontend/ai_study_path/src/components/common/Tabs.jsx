import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="w-full">
            <div className="border-b border-slate-200">
                <nav className="flex gap-2 -mb-px overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap
                                ${activeTab === tab.name
                                    ? 'text-emerald-600'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <span className="relative z-10">{tab.label}</span>
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 z-20 animate-fade-in" />
                            )}
                            {activeTab === tab.name && (
                                <div className="absolute inset-0 bg-slate-50/50 rounded-t-lg z-0" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6 w-full">
    {tabs.map((tab) => {
        if (tab.name === activeTab) {
            return (
                <div
                    key={tab.name}
                    className="w-full animation-fade-in text-slate-700"
                >
                    {tab.content}
                </div>
            );
        }
        return null;
    })}
</div>
        </div>
    );
};

export default Tabs;