import React, { useState } from "react";
import { ChevronRight, Folder, FolderOpen, Network } from "lucide-react";

const TreeNode = ({ node }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex items-center relative my-4">
            {/* Dynamic Connecting SVG Line (Left side anchor connecting back to parent) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r from-slate-200 to-indigo-200 dark:from-slate-800 dark:to-indigo-950 pointer-events-none" />

            {/* Node Interactive Card */}
            <div className="ml-8 flex items-center relative group">
                <div 
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                    className={`
                        flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-300 min-w-[180px]
                        ${hasChildren ? 'cursor-pointer select-none' : 'cursor-default'}
                        ${isOpen && hasChildren
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none' 
                            : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-600'}
                        shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]
                    `}
                >
                    {/* Dynamic Folder/Leaf Icons */}
                    <span className={`transition-colors duration-200 ${isOpen && hasChildren ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {hasChildren ? (isOpen ? <FolderOpen size={16} /> : <Folder size={16} />) : <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />}
                    </span>
                    
                    <span className="flex-1">{node.name}</span>

                    {/* Toggle Indicator */}
                    {hasChildren && (
                        <ChevronRight 
                            size={16} 
                            className={`transform transition-transform duration-300 ${isOpen ? 'rotate-90 text-indigo-200' : 'text-slate-400'}`} 
                        />
                    )}
                </div>

                {/* Right side anchor line pointing forward to children */}
                {hasChildren && isOpen && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-8 h-[2px] bg-indigo-200 dark:bg-indigo-950 pointer-events-none z-0" />
                )}
            </div>

            {/* Horizontal Children Cascade */}
            {hasChildren && isOpen && (
                <div className="flex flex-col justify-center gap-2 pl-8 relative border-l-2 border-indigo-100/60 dark:border-indigo-950/40 ml-8 py-2">
                    {node.children.map((child, index) => (
                        <TreeNode key={child.id || index} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

const MindMap = ({ data }) => {
    if (!data) return null;

    return (
        <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-950/20 dark:shadow-none">
            {/* Extended Control Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur px-8 py-5 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Network size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            Workspace Mind Map
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Use horizontal trackpad shift or shift + scroll to explore branching details.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg dark:bg-slate-800 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Interactive Blueprint
                </div>
            </div>

            {/* Infinite Horizontal Scroll Canvas */}
            <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
                <div className="inline-flex p-12 min-w-full items-center">
                    {/* Main Root - Overridden to eliminate the left-most anchor string */}
                    <div className="flex items-center relative">
                        <div className="group flex items-center">
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-slate-900 text-white border border-slate-800 font-bold whitespace-nowrap min-w-[200px] shadow-xl dark:bg-white dark:text-slate-900 dark:border-white">
                                <Network size={18} className="text-indigo-400 dark:text-indigo-600" />
                                <span>{data.name}</span>
                            </div>
                            {data.children && data.children.length > 0 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-8 h-[2px] bg-slate-900 dark:bg-white pointer-events-none" />
                            )}
                        </div>

                        {data.children && data.children.length > 0 && (
                            <div className="flex flex-col justify-center gap-2 pl-8 relative border-l-2 border-slate-200 dark:border-slate-800 ml-8 py-4">
                                {data.children.map((child, index) => (
                                    <TreeNode key={child.id || index} node={child} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MindMap;