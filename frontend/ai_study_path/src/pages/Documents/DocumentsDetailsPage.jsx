import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import aiService from '../../services/aiService';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';
import MindMap from "../../components/ai/MindMap";
import { 
    BookOpen, 
    MessageSquare, 
    Sparkles, 
    Layers, 
    Award, 
    Network, 
    ArrowRight 
} from 'lucide-react';

const DocumentDetailPage = () => {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState('');
    const [activeTab, setActiveTab] = useState('Content');
    const [mindMap, setMindMap] = useState(null);
    // FIX 1: Declared missing state variable to prevent ReferenceError
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchDocumentDetails = async () => {
            try {
                const data = await documentService.getDocumentById(id);
                setDocument(data);
            } catch (error) {
                toast.error('Failed to fetch document details.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocumentDetails();
    }, [id]);

    const handleGenerateMindMap = async () => {
        if (!topic.trim()) return;
        
        setIsGenerating(true);
        try {
            const data = await aiService.generateMindMap(id, topic);
            setMindMap(data);
        } catch (error) {
            toast.error('Failed to generate blueprint.');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper function to get the full PDF URL
    const getPdfUrl = () => {
        if (!document?.data?.filePath) return null;
        let filePath = document.data.filePath;
        
        // Fix old URLs stored with port 8000
        return filePath.replace("http://localhost:8000", "http://localhost:5000");
    };

    const renderContent = () => {
        if (loading) return <Spinner />;
        if (!document?.data?.filePath) {
            return <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">PDF not available.</div>;
        }
        const pdfUrl = getPdfUrl();

        return (
            <div className="flex flex-col gap-4 w-full h-full p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Document Viewer</span>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ExternalLink size={16} />
                        Open in new tab
                    </a>
                </div>
                <div className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Viewer"
                        frameBorder="0"
                        style={{ colorScheme: 'light' }}
                    />
                </div>
            </div>
        );
    };

    // FIX 2: Defined tabs configuration inside a useMemo block so it doesn't break reference on re-renders
    const tabs = React.useMemo(() => [
        { 
            name: 'Content', 
            label: (
                <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-emerald-500" />
                    <span>Study Material</span>
                </div>
            ), 
            content: renderContent() 
        },
        { 
            name: 'Chat', 
            label: (
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-500" />
                    <span>AI Friend</span>
                </div>
            ), 
            content: <ChatInterface />
        },
        { 
            name: 'AI Actions', 
            label: (
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    <span>AI Insights</span>
                </div>
            ), 
            content: <AIActions />
        },
        { 
            name: 'Flashcards', 
            label: (
                <div className="flex items-center gap-2">
                    <Layers size={16} className="text-amber-500" />
                    <span>Evaluate Yourself</span>
                </div>
            ), 
            content: <FlashcardManager documentId={id} /> 
        },
        { 
            name: 'Quizzes', 
            label: (
                <div className="flex items-center gap-2">
                    <Award size={16} className="text-rose-500" />
                    <span>Knowledge Check</span>
                </div>
            ), 
            content: <QuizManager documentId={id} /> 
        },
        {
            name: 'Mind Map',
            label: (
                <div className="flex items-center gap-2">
                    <Network size={16} className="text-indigo-500" />
                    <span>Visual Map</span>
                </div>
            ),
            content: (
                <div className="max-w-4xl mx-auto p-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                    AI Knowledge Mapper
                                </h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Turn any complex subject into an interactive visual breaking down key hierarchies.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis Light-Dependent Reactions, Roman Empire..."
                                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleGenerateMindMap}
                                disabled={!topic.trim() || isGenerating}
                                className="group flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm focus:outline-none disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <span>Generating...</span>
                                        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Blueprint</span>
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {mindMap ? (
                        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <MindMap data={mindMap} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-16 px-4 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-800">
                                <Network size={22} />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                No active map generated
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                                Type your target study module topic above to spawn your visual mind map instantly.
                            </p>
                        </div>
                    )}
                </div>
            )
        }
    ], [id, topic, isGenerating, mindMap, loading, document]);

    if (loading) {
        return <Spinner />;
    }

    if (!document) {
        return <div className='flex items-center justify-center p-12 text-lg font-medium text-slate-600 bg-slate-50 rounded-2xl border border-slate-200 m-6'>Document Not Found.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10">
            <div className="mb-4">
                <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back to Documents
                </Link>
            </div>
            <PageHeader title={document?.data?.title || 'Document Details'} />
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default DocumentDetailPage;