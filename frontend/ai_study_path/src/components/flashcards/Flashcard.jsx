import React, { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Extract the card's predefined difficulty level (e.g., "Easy", "Medium", "Hard")
  // Fallback gracefully to "General" if your AI payload has omitted the key
  const difficultyLevel = flashcard.difficulty || flashcard.level || "Medium";

  // Match badge styling dynamically based on the current card's intrinsic level
  const getDifficultyStyles = (level) => {
    const normalLevel = level.toLowerCase();
    if (normalLevel === "easy") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100/60";
    }
    if (normalLevel === "hard") {
      return "bg-rose-50 text-rose-600 border-rose-100/60";
    }
    // Default / Medium styling
    return "bg-slate-100 text-slate-600 border-slate-200/50";
  };

  return (
    <div className="w-full max-w-md h-64" style={{ perspective: "1000px" }}>
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* ==========================================
            FRONT OF THE CARD (Question)
           ========================================== */}
        <div
          className="absolute inset-0 w-full h-full bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Top Actions: Dynamic Difficulty Badge & Star Button */}
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md border font-sans ${getDifficultyStyles(difficultyLevel)}`}>
              {difficultyLevel}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id || flashcard.id);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                flashcard.isStarred
                  ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm scale-105"
                  : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500 hover:scale-105"
              }`}
            >
              <Star
                className="h-4 w-4"
                strokeWidth={2.5}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <p 
              className="text-lg md:text-xl text-slate-800 leading-relaxed font-serif tracking-wide italic antialiased"
              style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
            >
              “{flashcard.question}”
            </p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs font-bold tracking-wider text-slate-400 uppercase font-sans opacity-80 pt-2 border-t border-slate-50">
            <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Click to flip</span>
          </div>
        </div>

        {/* ==========================================
            BACK OF THE CARD (Answer)
           ========================================== */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-50/60 to-white border border-indigo-100/80 rounded-2xl p-6 flex flex-col justify-between shadow-md"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Top Header Label */}
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-extrabold tracking-widest text-indigo-600/90 bg-indigo-100/50 uppercase px-2.5 py-1 rounded-lg font-sans">
              Answer Key
            </span>
            <div className="w-9 h-9" />
          </div>

          {/* Answer Content */}
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <p 
              className="text-lg md:text-xl font-medium text-indigo-950 tracking-tight leading-snug antialiased"
              style={{ fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            >
              {flashcard.answer}
            </p>
          </div>

          {/* Flip Back Indicator */}
          <div className="flex items-center justify-center space-x-2 text-xs font-bold tracking-wider text-indigo-400/90 uppercase font-sans pt-2 border-t border-indigo-50/40">
            <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Return to question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;