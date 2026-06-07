import React, { useState, useEffect } from "react";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const res = await flashcardService.getFlashcardsForDocument(documentId);
            
            let setsArray = [];
            if (Array.isArray(res)) {
                setsArray = res;
            } else if (res && typeof res === 'object') {
                setsArray = res.flashcardSets || res.data || res.flashcards || [];
            }
            
            setFlashcardSets(setsArray);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error("Fetch Error:", error);
            setFlashcardSets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            await fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
    };

    // Cleaned loop navigation: strictly flips index changes without sending API review requests
    const handleNextCard = () => {
        if (selectedSet && selectedSet.cards?.length > 0) {
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
        }
    };

    const handlePrevCard = () => {
        if (selectedSet && selectedSet.cards?.length > 0) {
            setCurrentCardIndex(
                (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet?._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });

            setFlashcardSets(updatedSets);
            if (selectedSet) {
                const currentMatch = updatedSets.find((s) => s._id === selectedSet._id);
                if (currentMatch) setSelectedSet(currentMatch);
            }
            toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update star status.");
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set removed.");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            if (selectedSet?._id === setToDelete._id) setSelectedSet(null);
            await fetchFlashcardSets();
        } catch (error) {
            toast.error("Failed to delete set.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        if (!selectedSet || !selectedSet.cards || selectedSet.cards.length === 0) return null;
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSelectedSet(null)}
                        className="flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Decks
                    </button>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        Card {currentCardIndex + 1} of {selectedSet.cards.length}
                    </span>
                </div>
                
                <div className="min-h-[200px] flex items-center justify-center">
                    <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />
                </div>

                {/* Lower Action bar: Removed the Hard/Good/Easy container row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button 
                        onClick={handlePrevCard} 
                        className="flex items-center justify-center p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center space-x-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full shadow-sm select-none">
  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-sans">
    Navigate
  </span>
</div>

                    <button 
                        onClick={handleNextCard} 
                        className="flex items-center justify-center p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition-all"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex h-48 items-center justify-center">
                    <Spinner />
                </div>
            );
        }

        if (!Array.isArray(flashcardSets) || flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl h-64 m-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                        <Brain className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">No Flashcards Yet</h3>
                    <p className="text-sm text-slate-500 max-w-xs mb-4">
                        Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className="w-auto py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-medium text-xs rounded-xl flex items-center space-x-2 shadow-sm"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 text-indigo-200" strokeWidth={2} />
                                <span>Generate Flashcards</span>
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="p-6 grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {flashcardSets.map((set) => (
                    <div
                        key={set._id}
                        onClick={() => handleSelectSet(set)}
                        className="group flex flex-col justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-sm cursor-pointer transition-all"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors line-clamp-1">
                                    {set.title || "Flashcard Set"}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Created {moment(set.createdAt).format("MMM D, YYYY")}
                                </p>
                            </div>
                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
                            <span className="text-xs font-semibold text-slate-500">
                                {set.cards?.length || 0} {set.cards?.length === 1 ? "card" : "cards"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Your Flashcard Sets</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                        {Array.isArray(flashcardSets) ? flashcardSets.length : 0} {flashcardSets.length === 1 ? "set" : "sets"} available
                    </p>
                </div>
                {!selectedSet && Array.isArray(flashcardSets) && flashcardSets.length > 0 && (
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                    >
                        {generating ? "Generating..." : "Generate New Set"}
                    </button>
                )}
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden transition-all">
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Flashcard Set">
                <div className="space-y-4 p-1">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete this flashcard set? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg">
                            Cancel
                        </button>
                        <button onClick={handleConfirmDelete} disabled={deleting} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 rounded-lg flex items-center space-x-1">
                            {deleting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FlashcardManager;