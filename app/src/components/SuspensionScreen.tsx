import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function SuspensionScreen() {
  const { toggleSystemPause } = useGameStore();

  return (
    <div className="fixed inset-0 bg-[#050608] flex flex-col items-center justify-center p-6 z-[9999] select-none text-white font-sans">
      {/* Subtle Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Silver borderless "S" Logo */}
        <div className="flex justify-center">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <defs>
              <linearGradient id="silver-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
            </defs>
            <path
              d="M 32,39 L 42,29 L 74,29 L 58,45 L 36,45 Z"
              fill="url(#silver-logo-grad)"
            />
            <path
              d="M 68,61 L 58,71 L 26,71 L 42,55 L 64,55 Z"
              fill="url(#silver-logo-grad)"
            />
          </svg>
        </div>

        {/* Status Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/50">
            SYSTEM STATUS: SUSPENDED
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">SYSTEM SUSPENDED</h1>
          <p className="text-sm text-white/50 leading-relaxed px-4">
            Due to an unavoidable situation, system evaluations and active assessments have been frozen.
          </p>
        </div>

        {/* Info Grid */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-left space-y-4">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Frozen Parameters</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-white/40 font-medium">Daily Quests</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">Resets Suspended</div>
            </div>
            <div>
              <div className="text-[11px] text-white/40 font-medium">Player Streaks</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">Streaks Frozen</div>
            </div>
            <div>
              <div className="text-[11px] text-white/40 font-medium">Assessments</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">Evaluation Paused</div>
            </div>
            <div>
              <div className="text-[11px] text-white/40 font-medium">Penalties</div>
              <div className="text-xs font-semibold text-white/80 mt-0.5">XP Penalties Disabled</div>
            </div>
          </div>
        </div>

        {/* Resume Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleSystemPause()}
            className="w-full py-3.5 bg-white text-black hover:bg-slate-100 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.06)]"
          >
            <Play size={15} fill="black" />
            RESUME SYSTEM
          </motion.button>
        </div>

      </div>
    </div>
  );
}
