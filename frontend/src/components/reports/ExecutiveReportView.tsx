import type { ComponentType, ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Headphones,
  Megaphone,
  Shield,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { ReportDetail } from '../../services/reportService'

interface ExecutiveReportViewProps {
  report: ReportDetail
}

type ReportData = {
  financialAnalysis?: string
  marketingAnalysis?: string
  businessAnalysis?: string
  customerSupportAnalysis?: string
  topRisks?: string[]
  priorityActions?: string[]
  actionPlan30Day?: string[]
  expectedImpact?: string
}

function getRiskLevel(health: number | null) {
  if (health == null) return { label: 'Elevated', color: 'text-amber-300 bg-amber-500/10 border-amber-400/20', pct: 60 }
  if (health >= 75) return { label: 'Low', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20', pct: 25 }
  if (health >= 50) return { label: 'Medium', color: 'text-amber-300 bg-amber-500/10 border-amber-400/20', pct: 55 }
  return { label: 'High', color: 'text-red-300 bg-red-500/10 border-red-400/20', pct: 85 }
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: ComponentType<{ size?: number; className?: string }>
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(23,31,51,0.55)] p-5 sm:p-6 hover:border-violet-400/20 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <Icon size={16} className="text-violet-300" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#dae2fd]">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-[#cbc3d7]">{children}</div>
    </div>
  )
}

function ListSection({
  title,
  icon,
  items,
  accent = 'violet',
}: {
  title: string
  icon: ComponentType<{ size?: number; className?: string }>
  items: string[]
  accent?: 'violet' | 'amber' | 'cyan'
}) {
  const accentMap = {
    violet: 'bg-violet-500/15 text-violet-300',
    amber: 'bg-amber-500/15 text-amber-300',
    cyan: 'bg-cyan-500/15 text-cyan-300',
  }

  return (
    <SectionCard title={title} icon={icon}>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className={`flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${accentMap[accent]}`}>
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}

export default function ExecutiveReportView({ report }: ExecutiveReportViewProps) {
  const data = (report.reportData || {}) as ReportData
  const confidencePct = report.confidence != null ? Math.round(report.confidence * 100) : 0
  const health = report.businessHealth ?? 0
  const risk = getRiskLevel(report.businessHealth)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-violet-300">
              <Activity size={16} />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Health Score</span>
            </div>
            <span className="text-2xl font-bold text-[#dae2fd]">{health}<span className="text-sm text-[#958ea0]">/100</span></span>
          </div>
          <ScoreBar value={health} color="bg-gradient-to-r from-violet-500 to-fuchsia-400" />
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-cyan-300">
              <Target size={16} />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Confidence</span>
            </div>
            <span className="text-2xl font-bold text-[#dae2fd]">{confidencePct}%</span>
          </div>
          <ScoreBar value={confidencePct} color="bg-gradient-to-r from-cyan-500 to-blue-400" />
        </div>

        <div className={`rounded-2xl border p-4 ${risk.color}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Risk Level</span>
            </div>
            <span className="text-xl font-bold">{risk.label}</span>
          </div>
          <ScoreBar value={risk.pct} color="bg-current opacity-60" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-[#cbc3d7] mb-2">
            <Building2 size={16} />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Business</span>
          </div>
          <p className="text-sm font-semibold text-[#dae2fd] truncate">{report.businessName}</p>
          <p className="text-[10px] text-[#958ea0] mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-violet-300" />
          <h2 className="text-lg font-bold text-[#dae2fd]">Executive Summary</h2>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-[#dae2fd]/90">{report.executiveSummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Financial Analysis" icon={Wallet}><p>{data.financialAnalysis}</p></SectionCard>
        <SectionCard title="Marketing Analysis" icon={Megaphone}><p>{data.marketingAnalysis}</p></SectionCard>
        <SectionCard title="Business Analysis" icon={TrendingUp}><p>{data.businessAnalysis}</p></SectionCard>
        <SectionCard title="Customer Support Analysis" icon={Headphones}><p>{data.customerSupportAnalysis}</p></SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListSection title="Top Risks" icon={AlertTriangle} items={data.topRisks || []} accent="amber" />
        <ListSection title="Priority Actions" icon={Target} items={data.priorityActions || []} accent="cyan" />
      </div>

      <ListSection title="30-Day Action Plan" icon={Calendar} items={data.actionPlan30Day || []} />

      <SectionCard title="Expected Business Impact" icon={TrendingUp}>
        <p>{data.expectedImpact}</p>
      </SectionCard>

      <p className="text-center text-xs text-[#958ea0] pt-2">Generated by ExecOS AI</p>
    </div>
  )
}
