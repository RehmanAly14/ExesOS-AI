import { type ReactNode } from 'react'
import { Lock, Shield } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-3 sm:p-4 relative bg-[#0b1326] overflow-x-hidden">
      {/* Background Glow Orbs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(160, 120, 255, 0.15) 0%, rgba(160, 120, 255, 0) 70%)' }}
      />
      <div
        className="absolute bottom-[-100px] right-[-100px] w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] rounded-full pointer-events-none -z-10 opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(160, 120, 255, 0.15) 0%, rgba(160, 120, 255, 0) 70%)' }}
      />

      <main className="w-full max-w-[480px] z-10">
        {children}

        {/* Trust Badges */}
        <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 opacity-40">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-[#cbc3d7]" />
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7]">256-BIT ENCRYPTION</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#494454]" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#cbc3d7]" />
              <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#cbc3d7]">GDPR COMPLIANT</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#cbc3d7]/50 mt-3 sm:mt-4 text-center max-w-[280px] sm:max-w-[300px]">
            By authenticating, you agree to the ExecOS AI Enterprise Terms of Governance and Privacy Protocol.
          </p>
        </div>
      </main>
    </div>
  )
}