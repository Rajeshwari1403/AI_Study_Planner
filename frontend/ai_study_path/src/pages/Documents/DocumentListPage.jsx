import React, { useState, useEffect } from "react";
import { Plus, FileText, X, Upload, Trash2 } from "lucide-react"; // Imported Trash2 if you want to use it
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import DocumentCard from "../../components/documents/DocumentCard";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);

      toast.success("Document uploaded successfully");

      setUploadFile(null);
      setUploadTitle("");
      setIsUploadModalOpen(false);

      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);

      toast.success("Document deleted successfully");

      setDocuments((prev) =>
        prev.filter((doc) => doc._id !== selectedDoc._id)
      );

      setSelectedDoc(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <FileText
              className="w-10 h-10 text-slate-400"
              strokeWidth={1.5}
            />
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No Documents Yet
          </h3>

          <p className="text-slate-500 max-w-md mb-6">
            Upload your first document to start generating flashcards,
            quizzes, summaries and AI-powered study materials.
          </p>

          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Upload First Document
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen p-6">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Documents
            </h1>

            <p className="text-slate-500">
              Manage and organize your learning materials
            </p>
          </div>

          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        {renderContent()}
      </div>

      {/* Upload Modal Overlay */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            
            {/* Close button */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Upload New Document
              </h2>
              <p className="text-slate-500 mt-1">
                Add a PDF document to your library
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
                  placeholder="e.g., React Interview Prep"
                />
              </div>

              {/* File Upload */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Upload
                        className="w-7 h-7 text-slate-600"
                        strokeWidth={2}
                      />
                    </div>

                    <p className="text-center text-slate-700 font-medium">
                      {uploadFile ? (
                        <span className="text-slate-900">
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </>
                      )}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      PDF up to 10MB
                    </p>
                  </div>
                </label>

                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            
            {/* Close button icon */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              {/* Red Trash Icon Container */}
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg 
                  className="w-7 h-7 text-red-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              {/* Header */}
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Confirm Deletion
              </h2>
              
              {/* Message */}
              <p className="text-slate-500 text-sm leading-relaxed px-2 mb-6">
                Are you sure you want to delete the document:{" "}
                <span className="font-semibold text-slate-800 break-words">
                  {selectedDoc?.title || "this document"}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons styled like your design snippet */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;