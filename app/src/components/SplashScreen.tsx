import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SplashPhase = 'draw' | 'text' | 'exit';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<SplashPhase>('draw');
  const [visible, setVisible] = useState(true);
  const hasCalledComplete = useRef(false);

  const finish = useCallback(() => {
    if (hasCalledComplete.current) return;
    hasCalledComplete.current = true;
    setPhase('exit');
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 500); // Exit animation duration
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('text'), 400),
      setTimeout(() => finish(), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [finish]);

  if (!visible) return null;

  const phaseIndex = ['draw', 'text', 'exit'].indexOf(phase);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ background: '#050608' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Premium central radial gradient glow */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(203, 213, 225, 0.04) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: phase === 'exit' ? 1.2 : 1,
              opacity: phase === 'exit' ? 0 : 1,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Central Logo Container */}
          <motion.div
            className="relative z-10 w-36 h-36 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              opacity: phase === 'exit' ? 0 : 1,
              scale: phase === 'exit' ? 1.05 : 1,
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Borderless original "S" Logo with Silver Gradient */}
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <defs>
                <linearGradient id="silver-splash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#CBD5E1" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>
              </defs>

              <g>
                {/* Top hook segment */}
                <motion.path
                  d="M 32,39 L 42,29 L 74,29 L 58,45 L 36,45 Z"
                  fill="url(#silver-splash-grad)"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Bottom hook segment */}
                <motion.path
                  d="M 68,61 L 58,71 L 26,71 L 42,55 L 64,55 Z"
                  fill="url(#silver-splash-grad)"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </g>
            </svg>
          </motion.div>

          {/* ─── Title ─── */}
          <motion.div
            className="relative z-10 mt-5 text-center flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={
              phaseIndex >= 1
                ? { opacity: phase === 'exit' ? 0 : 1, y: phase === 'exit' ? 4 : 0 }
                : {}
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="text-lg font-bold text-white"
              style={{
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
              initial={{ letterSpacing: '0.15em' }}
              animate={phaseIndex >= 1 ? { letterSpacing: '0.3em' } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              SYSTEM
            </motion.span>
            <motion.span
              className="text-lg font-medium text-slate-400"
              style={{
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
              initial={{ letterSpacing: '0.15em' }}
              animate={phaseIndex >= 1 ? { letterSpacing: '0.3em' } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              ARISE
            </motion.span>
          </motion.div>

          {/* Version tag */}
          <motion.p
            className="absolute bottom-6 text-[8px] tracking-[0.25em] uppercase z-10 pointer-events-none"
            style={{
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              color: 'rgba(255,255,255,0.15)',
            }}
            initial={{ opacity: 0 }}
            animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            v1.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
