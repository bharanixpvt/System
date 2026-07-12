import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Swords } from 'lucide-react';
import { useEffect } from 'react';

export function CinematicBossNotification() {
  const { showCinematicBossNotification, dismissCinematicBossNotification, navigateTo } = useGameStore();

  useEffect(() => {
    if (showCinematicBossNotification) {
      // Prevent scrolling when cinematic is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCinematicBossNotification]);

  if (!showCinematicBossNotification) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.2)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
        
        {/* Ambient red glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[100px] animate-pulse" />

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,255,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] z-[210]" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative max-w-md w-full mx-4 glass-panel glow-border border-red-600/40 p-8 text-center shadow-2xl shadow-red-950/20 z-[220]"
        >
          {/* Header Warning Emblem */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-600 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <ShieldAlert size={28} className="animate-pulse" />
              </div>
              {/* Outer orbit lines */}
              <div className="absolute -inset-2 rounded-full border border-dashed border-red-600/20 animate-[spin_40s_linear_infinite]" />
            </div>
          </motion.div>

          {/* Lines */}
          <div className="space-y-6 mb-8 font-mono">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#EF4444] text-xs font-bold tracking-[0.4em] uppercase"
            >
              [ SYSTEM NOTICE ]
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-bold tracking-wide text-white uppercase"
            >
              Weekly Boss Dungeon Detected.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-[#CBD5E1] text-sm tracking-widest font-semibold uppercase"
            >
              New Evaluation Available.
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.8, duration: 0.4 }}
              className="w-16 h-[2px] bg-red-600/50 mx-auto"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="text-white/60 text-xs tracking-[0.25em] uppercase font-bold text-gradient-cyan"
            >
              Prepare Yourself.
            </motion.p>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.8 }}
          >
            <button
              onClick={() => {
                dismissCinematicBossNotification();
                navigateTo('dungeon');
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg text-sm font-bold tracking-widest border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300"
            >
              <Swords size={16} />
              ENTER THE PORTAL
            </button>
            <button
              onClick={dismissCinematicBossNotification}
              className="mt-3 text-xs text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest"
            >
              Acknowledge
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
