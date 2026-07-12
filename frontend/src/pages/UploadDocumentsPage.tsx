import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  FileSpreadsheet,
  FileCode,
  Trash2,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useDocuments } from "../hooks/useDocuments";
import { formatFileSize, ALLOWED_FILE_TYPES } from "../services/documentService";
import type { Document } from "../services/documentService";

// ── Status config: maps backend status → UI ────────
// Backend statuses: "uploaded" | "processing" | "extracted" | "failed"

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string; spin?: boolean }
> = {
  uploaded:   { icon: Clock,         color: "text-[#cbc3d7]",  bg: "bg-white/5",         label: "Uploaded" },
  processing: { icon: Loader2,       color: "text-amber-400",  bg: "bg-amber-500/10",    label: "Processing", spin: true },
  extracted:  { icon: CheckCircle,   color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Extracted" },
  failed:     { icon: AlertCircle,   color: "text-rose-400",   bg: "bg-rose-500/10",     label: "Failed" },
};

// ── File type → icon ───────────────────────────────

const fileIcons: Record<string, React.ElementType> = {
  pdf:  FileText,
  docx: FileText,
  txt:  FileCode,
  xlsx: FileSpreadsheet,
  js:   FileCode,
  ts:   FileCode,
  py:   FileCode,
};

// ── Delete Confirm Modal ───────────────────────────

interface DeleteModalProps {
  doc: Document;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ doc, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0f172a] shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-[#dae2fd] mb-2">Delete Document?</h3>
        <p className="text-sm text-[#cbc3d7] mb-1">
          <span className="font-semibold text-[#dae2fd]">"{doc.filename}"</span>
        </p>
        <p className="text-xs text-[#958ea0] mb-6">
          This will permanently delete the file and extracted text.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#cbc3d7] hover:bg-white/5 transition-all text-sm disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            {isDeleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────

export default function UploadDocumentsPage() {
  const { businessId } = useParams<{ businessId: string }>();

  const {
    documents, queue, isLoading, isUploading, deletingId, error,
    addToQueue, removeFromQueue, clearQueue,
    uploadAll, deleteDoc, clearError,
  } = useDocuments(businessId ?? null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  // ── Drag & Drop ──────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addToQueue(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addToQueue(Array.from(e.target.files));
    e.target.value = ""; // reset so same file can be re-selected
  };

  // ── Stats derived from real documents ─────────────
  const statCounts = {
    extracted:  documents.filter(d => d.status === "extracted").length,
    processing: documents.filter(d => d.status === "processing").length,
    uploaded:   documents.filter(d => d.status === "uploaded").length,
    failed:     documents.filter(d => d.status === "failed").length,
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteDoc(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteDoc]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-20">
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          doc={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#cbc3d7] mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/dashboard" className="hover:text-[#dae2fd] transition-colors">Dashboard</Link>
        <ChevronRight size={12} className="flex-shrink-0" />
        <Link to="/workspace" className="hover:text-[#dae2fd] transition-colors">Workspace</Link>
        <ChevronRight size={12} className="flex-shrink-0" />
        <Link to="/business" className="hover:text-[#dae2fd] transition-colors">Businesses</Link>
        <ChevronRight size={12} className="flex-shrink-0" />
        <span className="text-[#dae2fd] font-medium truncate">Upload Documents</span>
      </nav>

      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="h-6 sm:h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          <p className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest text-violet-300">
            Upload Documents
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#dae2fd] tracking-tight">
              Upload Documents
            </h1>
            <p className="text-[#cbc3d7] mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
              Upload documents for AI analysis and text extraction
            </p>
          </div>
          <Link
            to={`/business/${businessId}/chat`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm font-medium text-[#cbc3d7] transition hover:bg-white/10 hover:text-[#dae2fd] whitespace-nowrap"
          >
            Skip to Chat
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-red-300 whitespace-pre-line">{error}</p>
          <button onClick={clearError}><X size={14} className="text-red-400/60 hover:text-red-400" /></button>
        </div>
      )}

      {/* Drop Zone */}
      <div className="mb-6 sm:mb-8">
        <div
          className={`relative rounded-2xl sm:rounded-3xl border-2 border-dashed transition-all duration-300 p-6 sm:p-8 md:p-12 text-center
            ${isDragging
              ? "border-violet-400/60 bg-violet-500/10"
              : "border-white/10 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl hover:border-violet-400/30"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept={ALLOWED_FILE_TYPES.accept}
          />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Upload size={24} className="sm:size-8 text-violet-300" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-semibold text-[#dae2fd]">
                {isDragging ? "Drop your files here" : "Drag & drop files here"}
              </p>
              <p className="text-[#cbc3d7] text-xs sm:text-sm mt-1">
                or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-violet-300 hover:text-violet-200 transition"
                >
                  browse files
                </button>
              </p>
              <p className="text-[10px] sm:text-xs text-[#958ea0] mt-2 sm:mt-3">
                Supported: PDF, DOCX, TXT &nbsp;•&nbsp; Max {ALLOWED_FILE_TYPES.maxSizeLabel} per file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-semibold text-[#dae2fd]">
              Ready to Upload ({queue.filter(f => f.status === "pending").length} pending)
            </h3>
            <button
              onClick={clearQueue}
              disabled={isUploading}
              className="text-xs text-[#cbc3d7] hover:text-rose-400 transition disabled:opacity-40"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {queue.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-white/5 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <FileText size={14} className="text-violet-300 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-[#dae2fd] truncate">{item.file.name}</span>
                    <span className="text-[10px] sm:text-xs text-[#958ea0] flex-shrink-0">
                      {formatFileSize(item.file.size)}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === "done" && (
                      <CheckCircle size={14} className="text-emerald-400" />
                    )}
                    {item.status === "error" && (
                      <span className="text-[10px] text-rose-400">{item.error}</span>
                    )}
                    {item.status !== "uploading" && item.status !== "done" && (
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        disabled={isUploading}
                        className="p-1 rounded-lg hover:bg-white/10 transition text-[#cbc3d7] hover:text-rose-400 disabled:opacity-40"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-file progress bar */}
                {(item.status === "uploading" || item.status === "done") && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#cbc3d7]">
                        {item.status === "done" ? "Complete" : "Uploading…"}
                      </span>
                      <span className="text-violet-300">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          item.status === "done"
                            ? "bg-emerald-400"
                            : "bg-gradient-to-r from-violet-400 to-cyan-400"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={uploadAll}
            disabled={isUploading || queue.every(f => f.status !== "pending")}
            className="w-full mt-3 sm:mt-4 inline-flex items-center justify-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl"
          >
            {isUploading ? (
              <><Loader2 size={16} className="animate-spin" />Uploading…</>
            ) : (
              <><Upload size={16} />Upload {queue.filter(f => f.status === "pending").length} File{queue.filter(f => f.status === "pending").length !== 1 ? "s" : ""}</>
            )}
          </button>
        </div>
      )}

      {/* Document List */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#dae2fd]">
              Uploaded Documents ({documents.length})
            </h3>
            <p className="text-xs text-[#cbc3d7] mt-0.5">Showing all documents for this business</p>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-white/8 bg-[rgba(23,31,51,0.72)] p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 rounded bg-white/5" />
                    <div className="h-2 w-24 rounded bg-white/5" />
                  </div>
                  <div className="h-6 w-20 rounded-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile card view */}
        {!isLoading && documents.length > 0 && (
          <div className="block md:hidden space-y-3">
            {documents.map(doc => {
              const Icon = fileIcons[doc.fileType] ?? FileText;
              const cfg = statusConfig[doc.status] ?? statusConfig.uploaded;
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={doc.id}
                  className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-violet-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#dae2fd] truncate">{doc.filename}</p>
                      <p className="text-xs text-[#958ea0]">
                        {formatFileSize(doc.fileSize)} &nbsp;•&nbsp; {doc.fileType.toUpperCase()} &nbsp;•&nbsp;{" "}
                        {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon size={10} className={cfg.spin ? "animate-spin" : ""} />
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      disabled={deletingId === doc.id}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 transition text-[#cbc3d7] hover:text-rose-400 disabled:opacity-40"
                    >
                      {deletingId === doc.id ? <Loader2 size={14} className="animate-spin text-rose-400" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop table view */}
        {!isLoading && documents.length > 0 && (
          <div className="hidden md:block bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden rounded-3xl">
            <div className="grid grid-cols-12 gap-3 lg:gap-4 px-4 lg:px-6 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#958ea0]">
              <div className="col-span-5">Document</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {documents.map(doc => {
              const Icon = fileIcons[doc.fileType] ?? FileText;
              const cfg = statusConfig[doc.status] ?? statusConfig.uploaded;
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={doc.id}
                  className={`grid grid-cols-12 gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 border-b border-white/5 last:border-0 items-center transition hover:bg-white/5 ${deletingId === doc.id ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-violet-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#dae2fd] truncate">{doc.filename}</p>
                      <p className="text-xs text-[#958ea0]">
                        {formatFileSize(doc.fileSize)} &nbsp;•&nbsp;{" "}
                        {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-[#cbc3d7] text-xs font-medium ring-1 ring-white/8 uppercase">
                      {doc.fileType}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon size={12} className={cfg.spin ? "animate-spin" : ""} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDeleteTarget(doc)}
                      disabled={deletingId === doc.id}
                      className="p-2 rounded-lg hover:bg-rose-500/10 transition text-[#cbc3d7] hover:text-rose-400 disabled:opacity-40"
                    >
                      {deletingId === doc.id
                        ? <Loader2 size={16} className="animate-spin text-rose-400" />
                        : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && documents.length === 0 && (
          <div className="text-center py-12 rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)]">
            <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="text-violet-300" size={28} />
            </div>
            <h3 className="text-base font-semibold text-[#dae2fd]">No Documents Yet</h3>
            <p className="text-sm text-[#cbc3d7] mt-1">Upload your first document to get started with AI analysis.</p>
          </div>
        )}
      </div>

      {/* AI Processing Status panel */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-violet-400/20 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-violet-500/20 flex items-center justify-center animate-pulse flex-shrink-0">
              <Sparkles size={16} className="text-violet-300" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#dae2fd]">AI Processing</h4>
              <p className="text-xs text-[#cbc3d7]">Documents are automatically processed for AI analysis</p>
            </div>
          </div>

          {/* Live counts from real data */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto text-xs w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-center">
              <p className="text-[#cbc3d7]">Extracted</p>
              <p className="text-emerald-400 font-semibold">{statCounts.extracted}</p>
            </div>
            <div className="text-center">
              <p className="text-[#cbc3d7]">Processing</p>
              <p className="text-amber-400 font-semibold">{statCounts.processing}</p>
            </div>
            <div className="text-center">
              <p className="text-[#cbc3d7]">Uploaded</p>
              <p className="text-[#cbc3d7] font-semibold">{statCounts.uploaded}</p>
            </div>
            <div className="text-center">
              <p className="text-[#cbc3d7]">Failed</p>
              <p className="text-rose-400 font-semibold">{statCounts.failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed to Chat */}
      <div className="mt-6 sm:mt-8 flex justify-end">
        <Link
          to={`/business/${businessId}/chat`}
          className="inline-flex items-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base rounded-xl sm:rounded-2xl"
        >
          Proceed to AI Chat
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}