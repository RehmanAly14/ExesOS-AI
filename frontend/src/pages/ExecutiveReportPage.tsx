import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Zap,
  Calendar,
  Building2,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  FileText,
  Activity,
  Shield,
  Target,
} from 'lucide-react'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useReports } from '../hooks/useReports'
import ExecutiveReportLoadingDialog from '../components/reports/ExecutiveReportLoadingDialog'
import ExecutiveReportView from '../components/reports/ExecutiveReportView'
import { getReportById, type ReportDetail } from '../services/reportService'

function getRiskLevel(health: number | null) {
  if (health == null) return '—'
  if (health >= 75) return 'Low'
  if (health >= 50) return 'Medium'
  return 'High'
}

export default function ExecutiveReportPage() {
  const navigate = useNavigate()
  const { workspaces } = useWorkspaces()
  const [allBusinesses, setAllBusinesses] = useState<{ id: string; name: string; workspaceId: string }[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('Generate an executive report on our current business performance, risks, and priorities.')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedReportDetail, setSelectedReportDetail] = useState<ReportDetail | null>(null)
  const [loadingStep, setLoadingStep] = useState(1)

  const {
    reports,
    isLoading,
    isGenerating,
    error,
    generateReport,
    removeReport,
    clearError,
  } = useReports(selectedBusinessId)

  useEffect(() => {
    if (workspaces.length === 0) return
    import('../services/businessService').then(({ getWorkspaceBusinesses }) => {
      Promise.allSettled(workspaces.map((ws) => getWorkspaceBusinesses(ws.id))).then((results) => {
        const all: { id: string; name: string; workspaceId: string }[] = []
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            result.value.forEach((business) =>
              all.push({ id: business.id, name: business.name, workspaceId: workspaces[index].id })
            )
          }
        })
        setAllBusinesses(all)
        if (!selectedBusinessId && all.length > 0) {
          setSelectedBusinessId(all[0].id)
        }
      })
    })
  }, [workspaces, selectedBusinessId])

  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id)
    }
    if (reports.length > 0 && selectedReportId && !reports.find((r) => r.id === selectedReportId)) {
      setSelectedReportId(reports[0].id)
    }
    if (reports.length === 0) {
      setSelectedReportId(null)
      setSelectedReportDetail(null)
    }
  }, [reports, selectedReportId])

  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReportDetail(null)
      return
    }
    getReportById(selectedReportId)
      .then(setSelectedReportDetail)
      .catch(() => setSelectedReportDetail(null))
  }, [selectedReportId])

  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(1)
      return
    }

    setLoadingStep(1)
    const timers = [
      setTimeout(() => setLoadingStep(2), 2500),
      setTimeout(() => setLoadingStep(3), 6000),
      setTimeout(() => setLoadingStep(4), 10000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [isGenerating])

  const selectedReport = reports.find((report) => report.id === selectedReportId) || null
  const selectedBusiness = allBusinesses.find((b) => b.id === selectedBusinessId)

  const handleGenerate = async () => {
    if (!selectedBusinessId || !prompt.trim()) return
    const report = await generateReport(prompt)
    if (report) {
      setSelectedReportId(report.id)
      setSelectedReportDetail(report)
    }
  }

  const handleDelete = async (id: string) => {
    await removeReport(id)
  }

  const latestHealth = selectedReport?.businessHealth ?? reports[0]?.businessHealth ?? null
  const latestConfidence = selectedReport?.confidence ?? reports[0]?.confidence ?? null

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 pb-20 overflow-x-hidden">
      <ExecutiveReportLoadingDialog open={isGenerating} activeStep={loadingStep} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#dae2fd] mb-1">Executive Reports</h1>
          <p className="text-sm text-[#cbc3d7]">ExecOS AI intelligence briefings for leadership decisions.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedBusinessId || isGenerating}
          className="bg-[#a078ff] text-[#340080] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:brightness-110 transition-all whitespace-nowrap disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate Executive Report'}
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <p className="flex-1 text-sm">{error}</p>
          <button onClick={clearError}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7]">Business Context</label>
          <select
            value={selectedBusinessId || ''}
            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
            className="w-full bg-[rgba(23,31,51,0.72)] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#dae2fd]"
          >
            {allBusinesses.length === 0 && <option value="">No businesses found</option>}
            {allBusinesses.map((business) => (
              <option key={business.id} value={business.id}>{business.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[rgba(23,31,51,0.72)] border border-violet-400/20 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-violet-300 mb-1 flex items-center gap-1">
              <Activity size={10} /> Health
            </p>
            <p className="text-xl font-bold text-[#dae2fd]">{latestHealth ?? '—'}{latestHealth != null ? '/100' : ''}</p>
          </div>
          <div className="bg-[rgba(23,31,51,0.72)] border border-cyan-400/20 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-cyan-300 mb-1 flex items-center gap-1">
              <Target size={10} /> Confidence
            </p>
            <p className="text-xl font-bold text-cyan-300">
              {latestConfidence != null ? `${Math.round(latestConfidence * 100)}%` : '—'}
            </p>
          </div>
          <div className="bg-[rgba(23,31,51,0.72)] border border-amber-400/20 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
              <Shield size={10} /> Risk
            </p>
            <p className="text-xl font-bold text-[#dae2fd]">{getRiskLevel(latestHealth)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#cbc3d7] mb-2 block">Report Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-[rgba(23,31,51,0.72)] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#dae2fd] resize-none"
          placeholder="Describe what executive analysis you need..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#dae2fd]">Saved Reports</h2>

          {isLoading && (
            <div className="flex items-center gap-2 text-[#cbc3d7] py-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-violet-300" />
              Loading reports...
            </div>
          )}

          {!isLoading && reports.length === 0 && (
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-6 text-center">
              <Sparkles className="w-8 h-8 text-violet-300/50 mx-auto mb-2" />
              <p className="text-sm text-[#cbc3d7]">No reports yet for {selectedBusiness?.name || 'this business'}.</p>
              <p className="text-xs text-[#958ea0] mt-1">Click Generate to create your first executive report.</p>
            </div>
          )}

          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`w-full text-left bg-[rgba(23,31,51,0.72)] border border-white/10 p-4 rounded-xl transition-all ${
                selectedReportId === report.id ? 'ring-2 ring-violet-400/40 bg-violet-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-violet-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#dae2fd] truncate">{report.title}</p>
                  <p className="text-xs text-[#958ea0] mt-0.5">
                    {new Date(report.createdAt).toLocaleDateString()} · {report.businessName}
                  </p>
                  <p className="text-xs text-[#cbc3d7] mt-2 line-clamp-2">{report.executiveSummary}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {report.businessHealth != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
                    Health {report.businessHealth}
                  </span>
                )}
                {report.confidence != null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300">
                    {Math.round(report.confidence * 100)}% conf.
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-[rgba(23,31,51,0.72)] border border-white/10 rounded-2xl p-5 sm:p-6 min-h-[400px]">
          {!selectedReport || !selectedReportDetail ? (
            <div className="h-full flex items-center justify-center text-[#958ea0] text-sm">
              {selectedReport && !selectedReportDetail ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading report...</span>
              ) : (
                'Select a report or generate a new one'
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#dae2fd]">{selectedReportDetail.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#958ea0] mt-1">
                    <span className="inline-flex items-center gap-1"><Calendar size={12} />{new Date(selectedReportDetail.createdAt).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><Building2 size={12} />{selectedReportDetail.businessName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/report/${selectedReport.id}`)}
                    className="px-3 py-2 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-semibold flex items-center gap-1 hover:bg-violet-500/25"
                  >
                    <Eye size={14} /> Full View
                  </button>
                  <button
                    onClick={() => handleDelete(selectedReport.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-300 text-xs font-semibold flex items-center gap-1 hover:bg-red-500/20"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              <ExecutiveReportView report={selectedReportDetail} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
