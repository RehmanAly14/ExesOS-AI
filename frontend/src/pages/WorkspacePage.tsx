import {
  Building2,
  Plus,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Loader2,
  Trash2,
  AlertCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspaces } from "../hooks/useWorkspaces";

// ── Create Workspace Modal ─────────────────────────

interface CreateModalProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}

function CreateWorkspaceModal({ isOpen, isCreating, onClose, onSubmit }: CreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (name.trim().length < 3) {
      setLocalError("Workspace name must be at least 3 characters.");
      return;
    }
    try {
      await onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : "Failed to create workspace.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Building2 size={18} className="text-violet-300" />
            </div>
            <h2 className="text-lg font-semibold text-[#dae2fd]">New Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error */}
        {localError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3">
            <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{localError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1.5">
              Workspace Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setLocalError(null); setName(e.target.value); }}
              placeholder="e.g. Acme Corporation"
              minLength={3}
              maxLength={100}
              required
              className="w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 px-3.5 text-white placeholder:text-zinc-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1.5">
              Description <span className="text-slate-500 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
              maxLength={500}
              rows={3}
              className="w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 px-3.5 text-white placeholder:text-zinc-500 outline-none transition-all text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#cbc3d7] hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-400 to-violet-600 text-white font-semibold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
            >
              {isCreating ? (
                <><Loader2 size={14} className="animate-spin" /> Creating...</>
              ) : (
                <><Plus size={14} /> Create Workspace</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────

interface DeleteModalProps {
  workspaceName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ workspaceName, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0f172a] shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-[#dae2fd] mb-2">Delete Workspace?</h3>
        <p className="text-sm text-[#cbc3d7] mb-6">
          <span className="font-semibold text-[#dae2fd]">"{workspaceName}"</span> and all its
          businesses will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#cbc3d7] hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
          >
            {isDeleting ? (
              <><Loader2 size={14} className="animate-spin" /> Deleting...</>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────

export default function WorkspacePage() {
  const { workspaces, isLoading, isCreating, deletingId, error, createWs, deleteWs, clearError } =
    useWorkspaces();

  const [hoveredWorkspace, setHoveredWorkspace] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // ── Handlers ───────────────────────────────────────
  const handleCreate = async (name: string, description: string) => {
    await createWs({ name, description: description || undefined });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteWs(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-20">
      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        isCreating={isCreating}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          workspaceName={deleteTarget.name}
          isDeleting={deletingId === deleteTarget.id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-violet-300">
            Workspace
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#dae2fd] tracking-tight">
              Manage Your Workspaces
            </h1>
            <p className="text-[#cbc3d7] mt-2 text-sm md:text-base">
              Organize your businesses into dedicated workspaces.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] px-6 py-3 text-sm rounded-xl whitespace-nowrap disabled:opacity-60"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            <Plus size={18} />
            Create Workspace
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button onClick={clearError} className="text-red-400/60 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Workspace Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl p-4 text-center">
          {isLoading ? (
            <div className="h-8 w-8 mx-auto rounded bg-white/5 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#dae2fd]">{workspaces.length}</p>
          )}
          <p className="text-xs text-[#cbc3d7] mt-1">Total Workspaces</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl p-4 text-center">
          {isLoading ? (
            <div className="h-8 w-8 mx-auto rounded bg-white/5 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-violet-300">
              {workspaces.reduce((sum, w) => sum + (w._count?.businesses ?? 0), 0)}
            </p>
          )}
          <p className="text-xs text-[#cbc3d7] mt-1">Total Businesses</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl p-4 text-center col-span-2 md:col-span-1">
          {isLoading ? (
            <div className="h-8 w-8 mx-auto rounded bg-white/5 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-cyan-400">
              {workspaces.length > 0
                ? new Date(workspaces[0].createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "—"}
            </p>
          )}
          <p className="text-xs text-[#cbc3d7] mt-1">Latest Created</p>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl p-6 md:p-8 animate-pulse"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-white/5" />
                <div className="h-6 w-16 rounded-full bg-white/5" />
              </div>
              <div className="h-5 w-40 rounded bg-white/5 mb-3" />
              <div className="h-4 w-64 rounded bg-white/5 mb-6" />
              <div className="flex gap-4">
                <div className="h-4 w-24 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workspace Cards Grid */}
      {!isLoading && workspaces.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {workspaces.map((workspace) => {
            const isHovered = hoveredWorkspace === workspace.id;
            const isBeingDeleted = deletingId === workspace.id;

            return (
              <div
                key={workspace.id}
                className={`
                  relative rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)]
                  backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 md:p-8
                  transition-all duration-300 hover:border-violet-400/20
                  hover:shadow-[0_15px_50px_rgba(0,0,0,0.35)] group
                  ${isBeingDeleted ? "opacity-50 pointer-events-none scale-[0.99]" : "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"}
                `}
                onMouseEnter={() => setHoveredWorkspace(workspace.id)}
                onMouseLeave={() => setHoveredWorkspace(null)}
              >
                {/* Delete button — top-right corner, visible on hover */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget({ id: workspace.id, name: workspace.name });
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Delete workspace"
                >
                  {isBeingDeleted ? (
                    <Loader2 size={14} className="animate-spin text-red-400" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>

                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-500/20">
                    <Building2 className="text-violet-300" size={26} />
                  </div>

                  {/* Created date badge */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-[#cbc3d7] text-xs font-medium ring-1 ring-white/10">
                    {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-[#dae2fd] group-hover:text-violet-300 transition-colors">
                  {workspace.name}
                </h3>

                <p className="text-[#cbc3d7] mt-2 text-sm line-clamp-2 min-h-[2.5rem]">
                  {workspace.description || (
                    <span className="italic text-slate-600">No description</span>
                  )}
                </p>

                <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
                  <div className="flex items-center gap-2 text-[#cbc3d7] text-sm">
                    <FolderOpen size={18} className="text-[#958ea0]" />
                    <span>{workspace._count?.businesses ?? 0} Businesses</span>
                  </div>
                </div>

                <Link
                  to={`/business?workspace=${workspace.id}`}
                  className={`
                    mt-8 flex items-center gap-2 text-violet-300 font-medium
                    transition-all duration-300 hover:text-violet-200
                    ${isHovered ? "gap-3" : "gap-2"}
                  `}
                >
                  Open Workspace
                  <ArrowRight
                    size={18}
                    className={`transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workspaces.length === 0 && (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-violet-300" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-[#dae2fd]">No Workspaces Yet</h3>
          <p className="text-[#cbc3d7] mt-2">Create your first workspace to get started.</p>
          <button
            className="mt-6 inline-flex items-center justify-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] px-6 py-3 text-sm rounded-xl"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Workspace
          </button>
        </div>
      )}
    </div>
  );
}