import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import MarkdownRenderer from '../common/MarkdownRenderer';

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);

                console.log("Chat History Response:", response);

                setHistory(
                Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : []
                );
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content);

            console.log("CHAT RESPONSE =", response);
            const assistantMessage = {
            role: 'assistant',
            content: response?.data?.answer || 'No response received',
            timestamp: new Date(),
            relevantChunks: response?.data?.relevantChunks || []
        };
            setHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === 'user';
        return (
            <div key={index} className={`flex items-start space-x-3 my-4 max-w-3xl mx-auto w-full px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-zinc-400" strokeWidth={2} />
                    </div>
                )}
                
                <div className={`max-w-lg p-4 rounded-2xl shadow-sm ${
                    isUser
                        ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md'
                        : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-md'
                }`}>
                    {isUser ? (
                        <p className="">{msg.content}</p>
                    ) : (
                        <div className="text-blue-600">
                            <MarkdownRenderer content={msg.content} />
                        </div>
                    )}
                </div>

                {isUser && (
                    <div className="">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-slate-800 flex items-center justify-center shadow-md">
                    <MessageSquare className="w-7 h-7 text-zinc-300" strokeWidth={2} />
                </div>
                <div className="mt-4">
                    <Spinner className="text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-400 mt-3 font-medium">Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-zinc-900 text-zinc-100 min-h-screen flex flex-col justify-between p-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-4">
                {!Array.isArray(history) || history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                            <MessageSquare className="w-8 h-8 text-zinc-400" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-300">Start a conversation</h3>
                        <p className="text-sm text-zinc-500 mt-1">Ask me anything about the document!</p>
                    </div>
                ) : (
                    Array.isArray(history) &&
                    history.map((msg, index) => renderMessage(msg, index))
                )}
                {loading && (
                    <div className="flex items-start space-x-3 max-w-3xl mx-auto w-full my-4 px-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4 h-4 text-zinc-400" strokeWidth={2} />
                        </div>
                        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl rounded-tl-none p-4 shadow-md max-w-[85%]">
                            <div className="flex items-center space-x-1.5 h-5 px-1">
                                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto w-full px-4 pb-2">
                <div className="relative flex items-center bg-zinc-800 border border-zinc-700 rounded-xl focus-within:border-zinc-500 transition-colors shadow-lg">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        disabled={loading}
                        className="w-full bg-transparent text-zinc-100 text-sm py-3 pl-4 pr-12 focus:outline-none disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || loading}
                        className="absolute right-2 p-2 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 active:bg-zinc-500 disabled:opacity-40 disabled:hover:bg-zinc-700 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;