import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
// Note: Ensure you import your Modal component here if it's a custom component, e.g.:
import Modal from "../common/Modal"; 

const AIActions = () => {
    const { id: documentId } = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [concept, setConcept] = useState("");

    const handleGenerateSummary = async () => {
        setLoadingAction("summary");
        try {
            const { summary } = await aiService.generateSummary(documentId);
            setModalTitle("Generated Summary");
            setModalContent(summary);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Failed to generate summary.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if (!concept.trim()) {
            toast.error("Please enter a concept to explain.");
            return;
        }

        setLoadingAction("explain");
        try {
            const { explanation } = await aiService.explainConcept(
                documentId,
                concept
            );
            setModalTitle(`Explanation of "${concept}"`);
            setModalContent(explanation);
            setIsModalOpen(true);
            setConcept("");
        } catch (error) {
            toast.error("Failed to explain concept.");
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <>
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Sparkles className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            AI Assistant
                        </h3>
                        <p className="text-xs text-slate-500">Powered by advanced AI</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Action 1: Generate Summary */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3">
                        <div>
                            <div className="flex items-center space-x-2 text-slate-700 font-medium mb-1">
                                <BookOpen className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                                <h4 className="text-sm font-semibold">Generate Summary</h4>
                            </div>
                            <p className="text-xs text-slate-500">
                                Get a concise summary of the entire document.
                            </p>
                        </div>
                        
                        <button
                            onClick={handleGenerateSummary}
                            disabled={loadingAction !== null}
                            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            {loadingAction === "summary" ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Summarizing...</span>
                                </span>
                            ) : (
                                <span>Summarize</span>
                            )}
                        </button>
                    </div>

                    {/* Action 2: Explain Concept */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                        <div>
                            <div className="flex items-center space-x-2 text-slate-700 font-medium mb-1">
                                <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={2} />
                                <h4 className="text-sm font-semibold">Explain Concept</h4>
                            </div>
                            <p className="text-xs text-slate-500">
                                Enter a specific term or idea from the text to dissect.
                            </p>
                        </div>

                        <form onSubmit={handleExplainConcept} className="space-y-2">
                            <input
                                type="text"
                                value={concept}
                                onChange={(e) => setConcept(e.target.value)}
                                placeholder="e.g., Quantum Computing"
                                disabled={loadingAction !== null}
                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                            />
                            <button
                                type="submit"
                                disabled={loadingAction !== null}
                                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                {loadingAction === "explain" ? (
                                    <span className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Explaining...</span>
                                    </span>
                                ) : (
                                    <span>Explain</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/*Result Modal*/}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
            >
                <div className="max-h-[60vh] overflow-y-auto prose prose-slate max-w-none text-sm text-slate-600 line-height-relaxed">
                    <MarkdownRenderer content={modalContent} />
                </div>
            </Modal>
        </>
    );
};

export default AIActions;