import { Link } from 'react-router-dom'
import { useCallback, useRef } from 'react'
import {
  Zap,
  TrendingUp,
  BarChart2,
  FileText,
  Users,
  Database,
  Terminal,
  Calendar,
  GitBranch,
  CheckCircle,
  Layers,
  Cpu,
  Brain,
  Settings,
  Megaphone,
  LayoutDashboard,
  LogIn,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const integrations = [
  { label: 'Slack Relay', icon: Layers, color: 'text-violet-300' },
  { label: 'SQL Agents', icon: Database, color: 'text-cyan-400' },
  { label: 'CRM Auto-Sync', icon: Users, color: 'text-blue-400' },
  { label: 'DevOps Copilot', icon: Terminal, color: 'text-violet-200' },
  { label: 'Contextual Scheduling', icon: Calendar, color: 'text-violet-300' },
  { label: 'Linear Bridge', icon: GitBranch, color: 'text-cyan-400' },
]

export default function LandingPage() {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((id: string) => {
    const container = scrollContainerRef.current
    const el = document.getElementById(id)
    if (!el || !container) return

    const headerOffset = 80
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      headerOffset

    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [])

  // Derive initials for the avatar shown in the navbar when logged in
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div ref={scrollContainerRef} className="h-screen overflow-y-auto scroll-smooth bg-[#0b1326] text-[#dae2fd]">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-[#080f1f]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Ambient top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />
        <nav className="flex justify-between items-center w-full px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-3.5 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-lg sm:text-xl font-bold tracking-tight text-violet-300 hover:text-violet-200 transition-colors"
            >
              ExecOS AI
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="text-[#cbc3d7] hover:text-violet-300 transition-colors text-sm"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="text-[#cbc3d7] hover:text-violet-300 transition-colors text-sm"
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('integrations')}
                className="text-[#cbc3d7] hover:text-violet-300 transition-colors text-sm"
              >
                Integrations
              </button>
            </div>
          </div>

          {/* ── Nav CTA: changes based on auth state ─────────── */}
          <div className="flex items-center gap-2">
            {isInitialized && isAuthenticated ? (
              // ── Logged-in state ──────────────────────────────
              <>
                {/* User avatar badge */}
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 flex items-center justify-center text-[10px] font-bold text-[#dae2fd]">
                    {initials}
                  </div>
                  <span className="text-sm text-[#dae2fd] font-medium max-w-[120px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <Link to="/dashboard">
                  <button className="flex items-center gap-1.5 bg-[#a078ff] text-[#340080] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all">
                    <LayoutDashboard size={13} />
                    Dashboard
                  </button>
                </Link>
              </>
            ) : (
              // ── Logged-out state ─────────────────────────────
              <>
                <Link to="/auth">
                  <button className="flex items-center gap-1.5 text-[#cbc3d7] hover:text-violet-300 transition-colors text-sm font-medium px-3 py-1.5">
                    <LogIn size={14} />
                    Sign In
                  </button>
                </Link>
                <Link to="/auth">
                  <button className="bg-[#a078ff] text-[#340080] px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all">
                    Start Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 sm:pt-24 pb-12 sm:pb-20 overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[60%] bg-violet-500/10 rounded-full pointer-events-none blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[50%] bg-cyan-500/8 rounded-full pointer-events-none blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full text-violet-300 text-xs font-medium tracking-wide animate-fade-in-up">
                <Zap className="w-3.5 h-3.5" />
                AI-Powered Business OS
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#dae2fd] leading-[1.1] animate-fade-in-up animation-delay-150">
                Run your business with{' '}
                <span className="text-shimmer">
                  AI Agents
                </span>
              </h1>

              <p className="text-[#cbc3d7] text-base max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-300">
                Deploy a team of AI executives that analyze data, make decisions, and execute tasks automatically.
              </p>

              {/* ── Hero CTA: changes based on auth state ──────── */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2 animate-fade-in-up animation-delay-450">
                {isInitialized && isAuthenticated ? (
                  // Logged-in: go straight to dashboard
                  <Link to="/dashboard">
                    <button
                      className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-transform active:scale-95 text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #a078ff, #6d3bd7)',
                        boxShadow: '0 0 30px rgba(160,120,255,0.25)',
                      }}
                    >
                      <LayoutDashboard size={16} />
                      Go to Dashboard
                      <ArrowRight size={15} className="opacity-70" />
                    </button>
                  </Link>
                ) : (
                  // Logged-out: take to auth page
                  <Link to="/auth">
                    <button
                      className="px-7 py-3 rounded-xl font-semibold text-white shadow-xl hover:scale-105 transition-transform active:scale-95 text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #a078ff, #6d3bd7)',
                        boxShadow: '0 0 30px rgba(160,120,255,0.25)',
                      }}
                    >
                      Start Free Trial
                    </button>
                  </Link>
                )}
                <button className="border border-white/15 text-[#dae2fd] px-7 py-3 rounded-xl font-medium hover:bg-white/5 transition-colors text-sm">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-3 animate-fade-in-up animation-delay-600">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-violet-500/30 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-white">AK</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-blue-500/30 flex items-center justify-center text-[10px] font-bold text-white">MR</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#0b1326] bg-[#222a3d] flex items-center justify-center text-[10px] font-bold text-[#cbc3d7]">+12</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#dae2fd]">Used by 500+ teams</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} className="text-yellow-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex items-center justify-center animate-fade-in animation-delay-300">
              <div className="relative w-full max-w-md aspect-square">
                {/* Main Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-3xl border border-white/5 backdrop-blur-sm" />

                {/* Floating Agent Cards */}
                <div className="absolute top-8 left-8 bg-[rgba(23,31,51,0.9)] backdrop-blur-xl border border-white/8 rounded-2xl p-4 shadow-2xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#dae2fd]">CEO Agent</p>
                      <p className="text-[10px] text-[#cbc3d7]">Analyzing market trends</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-12 right-6 bg-[rgba(23,31,51,0.9)] backdrop-blur-xl border border-white/8 rounded-2xl p-4 shadow-2xl animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#dae2fd]">Finance Agent</p>
                      <p className="text-[10px] text-emerald-400">+12.4% growth</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-violet-500/20 to-cyan-500/20 blur-2xl animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="w-16 h-16 text-violet-300/60" />
                  </div>
                </div>

                <div className="absolute bottom-32 left-4 bg-[rgba(23,31,51,0.9)] backdrop-blur-xl border border-white/8 rounded-2xl p-3 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#cbc3d7]">3 tasks completed</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-24 right-8 bg-[rgba(23,31,51,0.9)] backdrop-blur-xl border border-white/8 rounded-2xl p-3 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#cbc3d7]">Sales up 18%</p>
                    </div>
                  </div>
                </div>

                {/* Center pulse ring */}
                <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-8 rounded-full border border-violet-500/5 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Features - Multi-Agent Advantage */}
        <section id="features" className="py-16 sm:py-20 bg-[#060e20]/40">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
            <div className="text-center mb-10 animate-fade-in-up">
              <span className="text-violet-300 text-xs font-semibold uppercase tracking-wider border border-violet-500/20 px-3 py-1 rounded-full inline-block mb-3">
                Multi-Agent System
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#dae2fd] mb-2">
                Your AI Executive Team
              </h2>
              <p className="text-[#cbc3d7] text-sm max-w-2xl mx-auto leading-relaxed">
                Each agent specializes in a domain, working together to run your business autonomously.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Agent 1 - CEO */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-150">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">CEO Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Strategy & Decision</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Synthesizes market data, aligns teams, and makes high-level strategic decisions.
                </p>
              </div>

              {/* Agent 2 - Finance */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">Finance Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Budget & Forecasting</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Monitors cash flow, optimizes budgets, and provides real-time financial insights.
                </p>
              </div>

              {/* Agent 3 - Marketing */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-450">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">Marketing Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Campaigns & Growth</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Analyzes audience, optimizes campaigns, and drives customer acquisition.
                </p>
              </div>

              {/* Agent 4 - Operations */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-150">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">Operations Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Process & Workflow</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Streamlines operations, automates workflows, and reduces inefficiencies.
                </p>
              </div>

              {/* Agent 5 - Sales */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">Sales Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Pipeline & Revenue</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Tracks leads, forecasts revenue, and optimizes the sales funnel.
                </p>
              </div>

              {/* Agent 6 - HR */}
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 hover:border-rose-500/30 hover:-translate-y-1 transition-all duration-300 group animate-fade-in-up animation-delay-450">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#dae2fd]">HR Agent</h3>
                    <p className="text-[10px] text-[#cbc3d7]">Talent & Culture</p>
                  </div>
                </div>
                <p className="text-[#cbc3d7] text-sm leading-relaxed">
                  Manages recruitment, employee engagement, and team performance.
                </p>
              </div>
            </div>

            {/* Bottom note */}
            <div className="text-center mt-8">
              <p className="text-[#cbc3d7] text-xs opacity-60">
                All agents work together with shared memory and peer-review capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section id="integrations" className="py-16 sm:py-20">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
            <h2 className="text-xl font-semibold text-[#dae2fd] mb-4 animate-fade-in-up">Integrated Ecosystem</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {integrations.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-[#222a3d]/40 border border-white/8 px-3 py-2.5 rounded-xl hover:border-violet-400/20 hover:bg-white/5 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="font-medium text-sm text-[#dae2fd]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-20 relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
            <div className="text-center mb-10 animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#dae2fd] mb-2">Scalable Intelligence</h2>
              <p className="text-[#cbc3d7] text-sm">Choose the tier that fits your operational complexity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 flex flex-col hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-150">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#494454] mb-2">Starter</h4>
                <p className="text-[#dae2fd] text-3xl font-bold mb-1">$499<span className="text-sm font-normal text-[#958ea0]">/mo</span></p>
                <p className="text-[#cbc3d7] text-sm mb-6">For small teams automating core workflows.</p>
                <ul className="space-y-2.5 mb-auto">
                  {['3 Specialized Agents', '10 Integrations', 'Basic Memory (30 Days)', 'Email Support'].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#dae2fd]">
                      <CheckCircle className="w-4 h-4 text-violet-300 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 py-2.5 rounded-lg border border-white/15 text-[#dae2fd] hover:bg-[#222a3d] transition-colors text-sm font-semibold">
                  Get Started
                </button>
              </div>

              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-violet-500/40 rounded-2xl p-6 flex flex-col relative bg-violet-500/5 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-300">
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-violet-300 text-[#3c0091] px-3 py-0.5 rounded-full text-[9px] font-bold uppercase">
                  Most Popular
                </div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 mb-2">Executive</h4>
                <p className="text-[#dae2fd] text-3xl font-bold mb-1">$1,999<span className="text-sm font-normal text-[#958ea0]">/mo</span></p>
                <p className="text-[#cbc3d7] text-sm mb-6">The full AI board of directors for scale-ups.</p>
                <ul className="space-y-2.5 mb-auto">
                  {['Unlimited Agents', 'Premium Integrations', 'Infinite Long-term Memory', '24/7 Priority Concierge', 'Multi-Agent Peer Review'].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#dae2fd]">
                      <CheckCircle className="w-4 h-4 text-violet-300 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                
                  <Link to="/auth">
                    <button className="w-full mt-6 py-2.5 rounded-lg bg-[#a078ff] text-[#340080] hover:brightness-110 transition-all text-sm font-semibold">
                      Start Workspace
                    </button>
                  </Link>
                
              </div>

              <div className="bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-white/8 rounded-2xl p-6 flex flex-col hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-delay-450">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#494454] mb-2">Enterprise</h4>
                <p className="text-[#dae2fd] text-3xl font-bold mb-1">Custom</p>
                <p className="text-[#cbc3d7] text-sm mb-6">Bespoke autonomous systems for global scale.</p>
                <ul className="space-y-2.5 mb-auto">
                  {['Custom Model Training', 'On-Premise Deployment', 'Dedicated AI Architect', 'SSO & Advanced Security'].map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#dae2fd]">
                      <CheckCircle className="w-4 h-4 text-violet-300 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-6 py-2.5 rounded-lg border border-white/15 text-[#dae2fd] hover:bg-[#222a3d] transition-colors text-sm font-semibold">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 md:px-12 relative z-10 text-center bg-[rgba(23,31,51,0.72)] backdrop-blur-xl border border-violet-500/20 rounded-3xl py-12 animate-fade-in-up">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-violet-500/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-cyan-500/20 blur-[100px] rounded-full" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#dae2fd] mb-4 leading-tight relative z-10">
              Ready to activate your <br className="hidden sm:block" />autonomous board?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">

              {/* ── Bottom CTA: changes based on auth state ──────── */}
              {isInitialized && isAuthenticated ? (
                <Link to="/dashboard">
                  <button className="flex items-center gap-2 bg-violet-300 text-[#3c0091] px-6 py-2.5 rounded-lg font-semibold hover:scale-105 transition-transform text-sm">
                    <LayoutDashboard size={15} />
                    Open Dashboard
                  </button>
                </Link>
              ) : (
                <Link to="/auth">
                  <button className="bg-violet-300 text-[#3c0091] px-6 py-2.5 rounded-lg font-semibold hover:scale-105 transition-transform text-sm">
                    Get Started Now
                  </button>
                </Link>
              )}

              <button className="bg-transparent border border-[#958ea0] px-6 py-2.5 rounded-lg font-medium text-[#dae2fd] hover:bg-white/5 transition-colors text-sm">
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#060e20] py-8 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="text-sm font-bold text-[#dae2fd]">ExecOS AI</span>
            <p className="text-xs text-[#cbc3d7]">© 2026 ExecOS AI. Autonomous Business OS.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Privacy', 'Terms', 'Security', 'Status'].map((link) => (
              <a key={link} href="#" className="text-xs text-[#cbc3d7] hover:text-cyan-400 transition-colors opacity-70 hover:opacity-100">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}