import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Zap, Eye, EyeOff, Mail, Lock, User, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
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
    <div className="h-screen w-screen bg-[#0b1326] flex items-center justify-center overflow-hidden">
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

          {/* Google Button (UI only — OAuth not wired) */}
          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-medium text-[#dae2fd]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[#958ea0] text-[10px] font-semibold uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

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