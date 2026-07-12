import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Zap, Eye, EyeOff, Mail, Lock, User, ChevronRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const { login, register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect back to the page the user originally tried to access (or dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError()
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password })
      } else {
        await register({ name: formData.name, email: formData.email, password: formData.password })
      }
      // Success → navigate to intended destination
      navigate(from, { replace: true })
    } catch {
      // Error is already stored in context state — just don't navigate
    }
  }

  const switchMode = () => {
    clearError()
    setFormData({ name: '', email: '', password: '' })
    setIsLogin(!isLogin)
  }

  return (
    <div className="h-screen w-screen bg-[#0b1326] flex items-center justify-center overflow-hidden relative">
      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs sm:text-sm text-[#cbc3d7] hover:text-[#dae2fd] hover:bg-white/10 hover:border-violet-400/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(#a078ff_1px,transparent_1px)] [background-size:50px_50px] opacity-10 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] mx-auto px-4">
        {/* Branding */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a078ff] to-[#6d3bd7] flex items-center justify-center mb-2 shadow-2xl shadow-violet-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-[#d0bcff]">ExecOS AI</h1>
          <p className="text-[#cbc3d7] text-xs mt-0.5">Enterprise Autonomous Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-[rgba(23,31,51,0.85)] backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-6">

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-semibold text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <button
                type="button"
                onClick={switchMode}
                className="text-[#d0bcff] hover:text-white text-xs transition-colors"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
            </div>

            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-[#cbc3d7] text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] w-4 h-4" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 pl-9 pr-3 text-white placeholder:text-zinc-500 outline-none transition-all text-sm"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[#cbc3d7] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 pl-9 pr-3 text-white placeholder:text-zinc-500 outline-none transition-all text-sm"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[#cbc3d7] text-[10px] font-semibold uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-[#d0bcff] text-[10px] hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#958ea0] w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-[#494454] focus:border-[#d0bcff] rounded-xl py-2.5 pl-9 pr-9 text-white placeholder:text-zinc-500 outline-none transition-all text-sm"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958ea0] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#a078ff] hover:bg-[#8f5fff] active:scale-[0.985] text-[#340080] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Authenticating...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[10px] text-[#958ea0]">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[#d0bcff] hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-[#d0bcff] hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}