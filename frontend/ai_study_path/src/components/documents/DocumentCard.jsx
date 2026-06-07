import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react';
import moment from 'moment';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <FileText
            className="w-6 h-6 text-slate-700"
            strokeWidth={2}
          />
        </div>

        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2
            className="w-5 h-5"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold text-slate-900 truncate mb-3"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* Document Info */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        {document.fileSize !== undefined && (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
            {formatFileSize(document.fileSize)}
          </span>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-5 mb-5">
        {document.flashcardCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <BookOpen
              className="w-4 h-4 text-slate-600"
              strokeWidth={2}
            />
            <span>{document.flashcardCount} Flashcards</span>
          </div>
        )}

        {document.quizCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <BrainCircuit
              className="w-4 h-4 text-slate-600"
              strokeWidth={2}
            />
            <span>{document.quizCount} Quizzes</span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock
            className="w-4 h-4"
            strokeWidth={2}
          />
          <span>Uploaded {moment(document.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* Premium Hover Line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-slate-700 to-slate-900 transition-all duration-300 group-hover:w-full" />
    </div>
  );
};

export default DocumentCard;