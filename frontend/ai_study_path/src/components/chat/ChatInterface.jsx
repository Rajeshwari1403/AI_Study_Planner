import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles, Mic, Volume2, VolumeX } from 'lucide-react';
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
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false); // Track if TTS is actively playing
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Global component scope function for Text-to-Speech
    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel(); // Clear any existing speech queues

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        // Sync local state with speech events
        speech.onstart = () => setIsSpeaking(true);
        speech.onend = () => setIsSpeaking(false);
        speech.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(speech);
    };

    // Explicitly kill audio stream anytime
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const startListening = () => {
        // Cut off AI speech when user starts talking/dictating
        stopSpeaking();

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
    };
    

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);

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

        // Cleanup audio on unmount if the user leaves the page mid-speech
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Cut off current playback if a user submits a new prompt manually
        stopSpeaking();

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content);
            const answerText = response?.data?.answer || 'No response received';

            const assistantMessage = {
                role: 'assistant',
                content: answerText,
                timestamp: new Date(),
                relevantChunks: response?.data?.relevantChunks || []
            };

            setHistory(prev => [...prev, assistantMessage]);

            if (voiceEnabled) {
                speakText(answerText);
            }
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
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-md'
                        : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-md'
                }`}>
                    {isUser ? (
                        <p className="">{msg.content}</p>
                    ) : (
                        <div className="text-zinc-800">
                            <MarkdownRenderer content={msg.content} />
                        </div>
                    )}
                </div>

                {isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center font-bold text-sm text-zinc-200 shadow-sm">
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
                <div className="relative flex items-center bg-zinc-800 border border-zinc-700 rounded-xl focus-within:border-zinc-500 transition-colors shadow-lg pl-4 pr-32 py-1.5">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        disabled={loading}
                        className="w-full bg-transparent text-zinc-100 text-sm py-2 focus:outline-none disabled:opacity-50"
                    />
                    
                    <div className="absolute right-2 flex items-center gap-2">
                        {/* Audio Toggle Button */}
                        <button
                            type="button"
                            onClick={() => {
                                const nextVoiceState = !voiceEnabled;
                                setVoiceEnabled(nextVoiceState);
                                // If turning off speaker, stop any audio running right away
                                if (!nextVoiceState) {
                                    stopSpeaking();
                                }
                            }}
                            className={`p-2.5 rounded-xl text-zinc-200 transition-all ${
                                voiceEnabled 
                                    ? isSpeaking
                                        ? 'bg-emerald-600 hover:bg-emerald-500 animate-pulse' // Pulsing variant if speaking
                                        : 'bg-zinc-700 hover:bg-zinc-600'
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 line-through'
                            }`}
                            title={voiceEnabled ? (isSpeaking ? "Stop Speaking" : "Mute responses") : "Unmute responses"}
                        >
                            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>

                        {/* Speech Dictation Button */}
                        <button
                            type="button"
                            onClick={startListening}
                            disabled={isListening}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${
                                isListening
                                    ? 'bg-red-500 text-white scale-105 animate-pulse shadow-lg shadow-red-500/40'
                                    : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600 active:scale-95'
                            }`}
                            title="Dictate message"
                        >
                            <Mic className="w-4 h-4" />
                        </button>

                        {/* Text Submission Button */}
                        <button
                            type="submit"
                            disabled={!message.trim() || loading}
                            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;