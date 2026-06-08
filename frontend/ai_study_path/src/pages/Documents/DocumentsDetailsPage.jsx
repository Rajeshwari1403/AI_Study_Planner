import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager'
import QuizManager from '../../components/quizzes/QuizManager';


const DocumentDetailPage = () => {

    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Content');

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

    // Helper function to get the full PDF URL
const getPdfUrl = () => {
  if (!document?.data?.filePath) return null;

  let filePath = document.data.filePath;

  // Fix old URLs stored with port 8000
  filePath = filePath.replace(
    "http://localhost:8000",
    "http://localhost:5000"
  );

  console.log("PDF URL:", filePath);

  return filePath;
};

const renderContent = () => {
    if (loading) {
        return <Spinner />;
    }
    if (!document || !document.data || !document.data.filePath) {
        return <div className="p-6 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">PDF not available.</div>
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
                    style={{
                        colorScheme: 'light',
              }}/>
          </div>
           </div>
    );
  };
  const renderChat = () => {
    return <ChatInterface/>
  };

  const renderAIActions = () => {
    return <AIActions/>
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id}/>
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
];

if (loading) {
    return <Spinner />;
}

if (!document) {
    return <div className='flex items-center justify-center p-12 text-lg font-medium text-slate-600 bg-slate-50 rounded-2xl border border-slate-200 m-6'>Document Not Found.</div>
}
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10">
            <div className="mb-4">
                <Link to="/documents" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back to Documents
                </Link>
            </div>
            <PageHeader title={document.data.title} />
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    )
}

export default DocumentDetailPage;