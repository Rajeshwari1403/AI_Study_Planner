import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
    // If the modal isn't supposed to be open, render nothing
    if (!isOpen) return null;

    return (
        // Modal Wrapper Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Clickable Backdrop Overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Content Card Container */}
            <div className="relative w-full max-w-lg transform rounded-2xl bg-white p-6 shadow-xl transition-all border border-slate-100 flex flex-col max-h-[85vh]">
                
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            {title}
                        </h3>
                    </div>
                    
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                </div>

                {/* Modal Body (Children) */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;