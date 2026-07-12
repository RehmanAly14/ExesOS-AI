import {
  Database,
  BarChart3,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Loading business data', icon: Database },
  { id: 2, label: 'Analyzing KPIs', icon: BarChart3 },
  { id: 3, label: 'Building executive insights', icon: Sparkles },
  { id: 4, label: 'Saving report', icon: Save },
]

interface ExecutiveReportLoadingDialogProps {
  open: boolean
  activeStep: number
}

export default function ExecutiveReportLoadingDialog({
  open,
  activeStep,
}: ExecutiveReportLoadingDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060b18]/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-violet-400/20 bg-[rgba(15,22,42,0.95)] shadow-2xl shadow-violet-900/30 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-400/20 mb-4">
            <Loader2 className="w-7 h-7 text-violet-300 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#dae2fd] mb-1">Generating Executive Report</h2>
          <p className="text-sm text-[#cbc3d7]">ExecOS AI is preparing your Executive Report</p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            const isComplete = activeStep > step.id
            const isActive = activeStep === step.id

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
                  isActive
                    ? 'border-violet-400/40 bg-violet-500/10'
                    : isComplete
                      ? 'border-emerald-400/20 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : isActive
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/5 text-[#958ea0]'
                  }`}
                >
                  {isComplete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium flex items-center gap-2 ${isActive || isComplete ? 'text-[#dae2fd]' : 'text-[#cbc3d7]'}`}>
                    {isComplete && <span className="text-emerald-400">✓</span>}
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <Loader2 className="w-4 h-4 text-violet-300 animate-spin flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
