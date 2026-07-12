import {
  Building2,
  Plus,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Briefcase,
  FileText,
  Upload,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
  AlertTriangle,
  Pencil,
  Trash2,
  Globe,
  MapPin,
  Users,
  TrendingUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useBusinesses } from "../hooks/useBusinesses";
import { useWorkspaces } from "../hooks/useWorkspaces";
import type { Business, CreateBusinessPayload, UpdateBusinessPayload } from "../services/businessService";

// ── Constants ──────────────────────────────────────

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Retail", "Manufacturing",
  "Education", "Real Estate", "Transportation", "Energy", "Media",
  "Hospitality", "Agriculture", "Consulting", "Legal", "Other",
];

const BUSINESS_TYPES = ["B2B", "B2C", "B2B2C", "Marketplace", "SaaS", "D2C", "Non-Profit", "Other"];
const BUSINESS_STAGES = ["Idea", "MVP", "Early Stage", "Growth", "Scale", "Enterprise"];
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "INR", "CAD", "AUD", "JPY", "CNY"];

// ── Business Form Modal ────────────────────────────

interface BusinessFormData {
  name: string;
  description: string;
  industry: string;
  businessType: string;
  businessStage: string;
  website: string;
  country: string;
  city: string;
  currency: string;
  employees: string;
}

const EMPTY_FORM: BusinessFormData = {
  name: "", description: "", industry: "", businessType: "",
  businessStage: "", website: "", country: "", city: "",
  currency: "", employees: "",
};

interface BusinessFormModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  workspaceId: string;
  editTarget: Business | null;
  onClose: () => void;
  onSubmit: (data: CreateBusinessPayload | UpdateBusinessPayload) => Promise<void>;
}

function BusinessFormModal({
  isOpen, isSubmitting, workspaceId, editTarget, onClose, onSubmit,
}: BusinessFormModalProps) {
  const [form, setForm] = useState<BusinessFormData>(EMPTY_FORM);
  const [localError, setLocalError] = useState<string | null>(null);
  const isEdit = !!editTarget;

  // Populate form when editing
  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name ?? "",
        description: editTarget.description ?? "",
        industry: editTarget.industry ?? "",
        businessType: editTarget.businessType ?? "",
        businessStage: editTarget.businessStage ?? "",
        website: editTarget.website ?? "",
        country: editTarget.country ?? "",
        city: editTarget.city ?? "",
        currency: editTarget.currency ?? "",
        employees: editTarget.employees != null ? String(editTarget.employees) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setLocalError(null);
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof BusinessFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setLocalError(null);
      setForm(prev => ({ ...prev, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!form.name.trim()) { setLocalError("Business name is required."); return; }
    if (!form.industry) { setLocalError("Industry is required."); return; }

    const payload = {
      ...(isEdit ? {} : { workspaceId }),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      industry: form.industry,
      businessType: form.businessType || undefined,
      businessStage: form.businessStage || undefined,
      website: form.website.trim() || undefined,
      country: form.country.trim() || undefined,
      city: form.city.trim() || undefined,
      currency: form.currency || undefined,
      employees: form.employees ? parseInt(form.employees, 10) : undefined,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const inputCls = "w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 px-3.5 text-white placeholder:text-zinc-500 outline-none transition-all text-sm";
  const labelCls = "block text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7] mb-1.5";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Briefcase size={18} className="text-violet-300" />
            </div>
            <h2 className="text-lg font-semibold text-[#dae2fd]">
              {isEdit ? "Edit Business" : "New Business"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {localError && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{localError}</p>
            </div>
          )}

          <form id="business-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name */}
            <div>
              <label className={labelCls}>Business Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. Acme Corp — Tech Division" className={inputCls} />
            </div>

            {/* Row 2: Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={set("description")} placeholder="What does this business do?" rows={3} className={`${inputCls} resize-none`} />
            </div>

            {/* Row 3: Industry + Business Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Industry <span className="text-red-400">*</span></label>
                <select value={form.industry} onChange={set("industry")} className={selectCls}>
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Business Type</label>
                <select value={form.businessType} onChange={set("businessType")} className={selectCls}>
                  <option value="">Select type…</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4: Stage + Employees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Business Stage</label>
                <select value={form.businessStage} onChange={set("businessStage")} className={selectCls}>
                  <option value="">Select stage…</option>
                  {BUSINESS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Employees</label>
                <input type="number" min={1} value={form.employees} onChange={set("employees")} placeholder="e.g. 50" className={inputCls} />
              </div>
            </div>

            {/* Row 5: Country + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Country</label>
                <input type="text" value={form.country} onChange={set("country")} placeholder="e.g. United States" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={form.city} onChange={set("city")} placeholder="e.g. San Francisco" className={inputCls} />
              </div>
            </div>

            {/* Row 6: Website + Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={form.website} onChange={set("website")} placeholder="https://example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select value={form.currency} onChange={set("currency")} className={selectCls}>
                  <option value="">Select currency…</option>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#cbc3d7] hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="business-form" disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" />{isEdit ? "Saving…" : "Creating…"}</>
              : isEdit ? "Save Changes" : <><Plus size={14} />Create Business</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────

interface DeleteModalProps {
  business: Business;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ business, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0f172a] shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-[#dae2fd] mb-2">Delete Business?</h3>
        <p className="text-sm text-[#cbc3d7] mb-6">
          <span className="font-semibold text-[#dae2fd]">"{business.name}"</span> and all its documents
          will be permanently deleted.
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

// ── Context Menu (card ···) ────────────────────────

interface ContextMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function ContextMenu({ onEdit, onDelete, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-white/10 bg-[#0f172a] shadow-xl z-20 py-1">
      <button onClick={onEdit} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#cbc3d7] hover:bg-white/5 hover:text-white transition-colors">
        <Pencil size={13} /> Edit
      </button>
      <button onClick={onDelete} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}

// ── Workspace Selector ─────────────────────────────

interface WorkspaceSelectorProps {
  workspaces: { id: string; name: string }[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

function WorkspaceSelector({ workspaces, selectedId, onChange }: WorkspaceSelectorProps) {
  if (workspaces.length === 0) return null;
  return (
    <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl">
      <Building2 size={16} className="text-violet-300 flex-shrink-0" />
      <span className="text-sm text-[#cbc3d7] flex-shrink-0">Workspace:</span>
      <select
        value={selectedId ?? ""}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent text-white text-sm outline-none cursor-pointer"
      >
        <option value="" disabled>Select a workspace…</option>
        {workspaces.map(w => (
          <option key={w.id} value={w.id} className="bg-[#0f172a]">{w.name}</option>
        ))}
      </select>
    </div>
  );
}

// ── Badge helper ───────────────────────────────────

function Badge({ label, icon: Icon }: { label: string; icon?: React.ElementType }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[#cbc3d7] text-[11px] font-medium ring-1 ring-white/8">
      {Icon && <Icon size={11} className="text-[#958ea0]" />}
      {label}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────

export default function BusinessPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read workspace from URL query param (?workspace=<id>)
  const workspaceIdFromURL = searchParams.get("workspace");

  const { workspaces } = useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(workspaceIdFromURL);

  // Keep URL in sync when workspace changes
  const handleWorkspaceChange = (id: string) => {
    setSelectedWorkspaceId(id);
    setSearchParams({ workspace: id });
  };

  // Auto-select first workspace if none selected
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces.length > 0) {
      handleWorkspaceChange(workspaces[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, selectedWorkspaceId]);

  const {
    businesses, isLoading, isSubmitting, deletingId,
    error, createBiz, updateBiz, deleteBiz, clearError,
  } = useBusinesses(selectedWorkspaceId);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredBusiness, setHoveredBusiness] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Business | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);

  const filteredBusinesses = businesses.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.industry ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  // ── Handlers ──────────────────────────────────────
  const openCreate = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (b: Business) => { setEditTarget(b); setShowForm(true); setOpenMenuId(null); };
  const openDelete = (b: Business) => { setDeleteTarget(b); setOpenMenuId(null); };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (editTarget) {
      await updateBiz(editTarget.id, data as UpdateBusinessPayload);
    } else {
      await createBiz({ ...(data as CreateBusinessPayload), workspaceId: selectedWorkspaceId! });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteBiz(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-20">
      {/* Modals */}
      <BusinessFormModal
        isOpen={showForm}
        isSubmitting={isSubmitting}
        workspaceId={selectedWorkspaceId ?? ""}
        editTarget={editTarget}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit as never}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          business={deleteTarget}
          isDeleting={deletingId === deleteTarget.id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#cbc3d7] mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/workspace" className="hover:text-white transition-colors">Workspace</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-white font-medium">Businesses</span>
      </nav>

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
          <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-violet-300">
            Businesses
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Your Businesses</h1>
            <p className="text-[#cbc3d7] mt-2 text-sm md:text-base">
              {selectedWorkspace
                ? <>Businesses in <span className="text-violet-300 font-medium">{selectedWorkspace.name}</span></>
                : "Manage all your business entities within workspaces."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              {(["grid", "list"] as const).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === mode ? "bg-violet-500/20 text-violet-300" : "text-[#cbc3d7] hover:text-white"}`}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={openCreate}
              disabled={!selectedWorkspaceId}
              className="inline-flex items-center justify-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] px-4 sm:px-6 py-2 sm:py-2.5 text-sm rounded-xl whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Business</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Selector */}
      <WorkspaceSelector
        workspaces={workspaces}
        selectedId={selectedWorkspaceId}
        onChange={handleWorkspaceChange}
      />

      {/* Error Banner */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-red-300">{error}</p>
          <button onClick={clearError}><X size={14} className="text-red-400/60 hover:text-red-400" /></button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0]" />
          <input
            type="text"
            placeholder="Search businesses…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-[#958ea0] outline-none transition-all focus:border-violet-400/30 focus:bg-white/10 focus:ring-1 focus:ring-violet-400/30"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#cbc3d7] transition hover:bg-white/10 hover:text-white">
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)] p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5" />
                <div className="h-6 w-20 rounded-full bg-white/5" />
              </div>
              <div className="h-5 w-40 rounded bg-white/5 mb-3" />
              <div className="h-3 w-full rounded bg-white/5 mb-1" />
              <div className="h-3 w-2/3 rounded bg-white/5 mb-5" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded-xl bg-white/5" />
                <div className="h-8 flex-1 rounded-xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === "grid" && filteredBusinesses.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredBusinesses.map(business => {
            const isHovered = hoveredBusiness === business.id;
            const isBeingDeleted = deletingId === business.id;

            return (
              <div
                key={business.id}
                className={`relative rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-6 transition-all duration-300 hover:border-violet-400/20 hover:shadow-[0_15px_50px_rgba(0,0,0,0.35)] group ${isBeingDeleted ? "opacity-50 pointer-events-none" : "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"}`}
                onMouseEnter={() => setHoveredBusiness(business.id)}
                onMouseLeave={() => setHoveredBusiness(null)}
              >
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center transition-colors group-hover:bg-violet-500/20">
                    <Briefcase className="text-violet-300" size={24} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {business.businessStage && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20">
                        {business.businessStage}
                      </span>
                    )}
                    {/* Context menu trigger */}
                    <div className="relative">
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === business.id ? null : business.id); }}
                        className="p-1.5 rounded-lg hover:bg-white/8 transition"
                      >
                        {isBeingDeleted
                          ? <Loader2 size={16} className="text-red-400 animate-spin" />
                          : <MoreVertical size={16} className="text-[#cbc3d7]" />}
                      </button>
                      {openMenuId === business.id && (
                        <ContextMenu
                          onEdit={() => openEdit(business)}
                          onDelete={() => openDelete(business)}
                          onClose={() => setOpenMenuId(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Name + description */}
                <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                  {business.name}
                </h3>
                <p className="text-[#cbc3d7] mt-1.5 text-sm line-clamp-2 min-h-[2.5rem]">
                  {business.description || <span className="italic text-slate-600">No description</span>}
                </p>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {business.industry && <Badge label={business.industry} />}
                  {business.businessType && <Badge label={business.businessType} />}
                  {business.country && <Badge label={business.country} icon={MapPin} />}
                  {business.employees != null && <Badge label={`${business.employees} employees`} icon={Users} />}
                  {business.currency && <Badge label={business.currency} icon={TrendingUp} />}
                  {business.website && (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                      <Badge label="Website" icon={Globe} />
                    </a>
                  )}
                </div>

                {/* Divider + doc count */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[#cbc3d7] text-xs">
                    <FileText size={14} className="text-[#958ea0]" />
                    <span>Documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#cbc3d7] text-xs">
                    <FolderOpen size={14} className="text-[#958ea0]" />
                    <span>{new Date(business.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/business/${business.id}/documents`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 hover:text-violet-200"
                  >
                    <Upload size={14} />
                    Upload Docs
                  </Link>
                  <Link
                    to={`/business/${business.id}/chat`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-[#cbc3d7] transition hover:bg-white/10 hover:text-white"
                  >
                    Open Chat
                    <ArrowRight size={14} className={`transition-transform duration-300 ${isHovered ? "translate-x-0.5" : ""}`} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === "list" && filteredBusinesses.length > 0 && (
        <div className="rounded-3xl border border-white/8 bg-[rgba(23,31,51,0.72)] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-[#958ea0]">
            <div className="col-span-4">Business</div>
            <div className="col-span-2">Industry</div>
            <div className="col-span-2">Stage</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredBusinesses.map(business => (
            <div key={business.id} className={`border-b border-white/5 last:border-0 transition hover:bg-white/5 ${deletingId === business.id ? "opacity-40 pointer-events-none" : ""}`}>
              {/* Desktop row */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-violet-300" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{business.name}</p>
                    <p className="text-xs text-[#cbc3d7] line-clamp-1">{business.description || "—"}</p>
                  </div>
                </div>

                <div className="col-span-2 text-sm text-[#cbc3d7] truncate">{business.industry || "—"}</div>

                <div className="col-span-2">
                  {business.businessStage
                    ? <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20">{business.businessStage}</span>
                    : <span className="text-sm text-slate-600">—</span>
                  }
                </div>

                <div className="col-span-2 text-sm text-[#cbc3d7] truncate">
                  {[business.city, business.country].filter(Boolean).join(", ") || "—"}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(business)}
                    className="rounded-lg bg-white/5 p-1.5 text-[#cbc3d7] hover:bg-white/10 hover:text-white transition">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => openDelete(business)}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition">
                    <Trash2 size={13} />
                  </button>
                  <Link to={`/business/${business.id}/documents`}
                    className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition">
                    Upload
                  </Link>
                  <Link to={`/business/${business.id}/chat`}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-[#cbc3d7] hover:bg-white/10 transition">
                    Chat
                  </Link>
                </div>
              </div>

              {/* Mobile Card */}
              <div className="md:hidden p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-violet-300" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{business.name}</p>
                      <p className="text-xs text-[#cbc3d7] line-clamp-1">{business.description || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(business)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#cbc3d7] hover:text-white transition"><Pencil size={13} /></button>
                    <button onClick={() => openDelete(business)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {business.industry && <Badge label={business.industry} />}
                  {business.businessStage && <Badge label={business.businessStage} />}
                  {business.country && <Badge label={business.country} icon={MapPin} />}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <Link to={`/business/${business.id}/documents`} className="flex-1 text-center rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition">Upload</Link>
                  <Link to={`/business/${business.id}/chat`} className="flex-1 text-center rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-[#cbc3d7] hover:bg-white/10 transition">Chat</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredBusinesses.length === 0 && (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-violet-300" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white">
            {searchQuery ? "No Businesses Found" : "No Businesses Yet"}
          </h3>
          <p className="text-[#cbc3d7] mt-2">
            {searchQuery
              ? "Try adjusting your search terms."
              : selectedWorkspaceId
              ? "Create your first business to get started."
              : "Select a workspace to view its businesses."}
          </p>
          {!searchQuery && selectedWorkspaceId && (
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 font-semibold text-[#340080] bg-gradient-to-r from-violet-300 via-violet-400 to-cyan-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(208,188,255,0.35)] active:scale-[0.98] px-6 py-3 text-sm rounded-xl"
            >
              <Plus size={18} />
              Create Business
            </button>
          )}
        </div>
      )}

      {/* No workspace selected state */}
      {!isLoading && !selectedWorkspaceId && workspaces.length > 0 && (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-violet-300" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white">Select a Workspace</h3>
          <p className="text-[#cbc3d7] mt-2">Choose a workspace above to view and manage its businesses.</p>
        </div>
      )}
    </div>
  );
}