import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────
// Orbiting ring — a rotating dashed ring
// ────────────────────────────────────────────────────────
function OrbitRing({ size, delay, duration, reverse }: {
  size: number; delay: number; duration: number; reverse?: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-full border border-dashed pointer-events-none"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderColor: 'rgba(79, 216, 255, 0.08)',
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
      animate={{
        opacity: [0, 0.35, 0.15],
        scale: [0.8, 1, 1],
        rotate: reverse ? -360 : 360,
      }}
      transition={{
        opacity: { duration: 1.4, delay },
        scale: { duration: 1.4, delay },
        rotate: { duration, repeat: Infinity, ease: 'linear', delay },
      }}
    />
  );
}

type SplashPhase = 'dark' | 'draw' | 'glow' | 'text' | 'hold' | 'exit';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<SplashPhase>('dark');
  const [visible, setVisible] = useState(true);
  const hasCalledComplete = useRef(false);

  const finish = useCallback(() => {
    if (hasCalledComplete.current) return;
    hasCalledComplete.current = true;
    setPhase('exit');
    setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 850);
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('draw'), 300),
      setTimeout(() => setPhase('glow'), 1300),
      setTimeout(() => setPhase('text'), 2300),
      setTimeout(() => setPhase('hold'), 4100),
      setTimeout(() => finish(), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [finish]);

  if (!visible) return null;

  const titleText = 'SYSTEM ARISE';
  const phaseIndex = ['dark', 'draw', 'glow', 'text', 'hold', 'exit'].indexOf(phase);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 mountaineer z-[999] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ background: '#030507' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Ambient background glow */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 350,
              height: 350,
              background: 'radial-gradient(circle, rgba(79,216,255,0.06) 0%, transparent 75%)',
              borderRadius: '50%',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phaseIndex >= 1
                ? { opacity: [0, 1, 0.5], scale: [0.6, 1.15, 1] }
                : {}
            }
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />

          {/* Orbit rings */}
          {phaseIndex >= 1 && (
            <>
              <OrbitRing size={190} delay={0} duration={28} />
              <OrbitRing size={250} delay={0.2} duration={38} reverse />
              <OrbitRing size={310} delay={0.4} duration={48} />
            </>
          )}

          {/* Central neon glowing logo container */}
          <motion.div
            className="relative z-10 w-36 h-36 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              phaseIndex >= 1
                ? {
                    opacity: phase === 'exit' ? 0 : 1,
                    scale: phase === 'exit' ? 1.25 : 1,
                  }
                : {}
            }
            transition={{
              opacity: { duration: phase === 'exit' ? 0.55 : 0.7, ease: 'easeOut' },
              scale: {
                duration: phase === 'exit' ? 0.55 : 1.1,
                ease: phase === 'exit' ? [0.4, 0, 1, 1] : [0.16, 1, 0.3, 1],
              },
            }}
          >
            {/* Inline SVG Cybernetic "S" */}
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 drop-shadow-[0_0_15px_rgba(79,216,255,0.4)]"
            >
              <defs>
                {/* Advanced glow filters */}
                <filter id="glow-light" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur1" />
                  <feGaussianBlur stdDeviation="4" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#glow-light)">
                {/* Top hook segment */}
                <motion.path
                  d="M 32,39 L 42,29 L 74,29 L 58,45 L 36,45 Z"
                  fill="none"
                  stroke="#4FD8FF"
                  strokeWidth="3.5"
                  strokeLinejoin="miter"
                  strokeMiterlimit="4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={phaseIndex >= 1 ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{
                    duration: 1.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />

                {/* Bottom hook segment */}
                <motion.path
                  d="M 68,61 L 58,71 L 26,71 L 42,55 L 64,55 Z"
                  fill="none"
                  stroke="#4FD8FF"
                  strokeWidth="3.5"
                  strokeLinejoin="miter"
                  strokeMiterlimit="4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={phaseIndex >= 1 ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{
                    duration: 1.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />

                {/* Cyber center slashes */}
                <motion.path
                  d="M 40,49 L 60,49"
                  fill="none"
                  stroke="rgba(79, 216, 255, 0.6)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={phaseIndex >= 2 ? { pathLength: 1, opacity: 0.8 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.6,
                    ease: 'easeOut',
                  }}
                />
                <motion.path
                  d="M 43,51 L 57,51"
                  fill="none"
                  stroke="rgba(79, 216, 255, 0.8)"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={phaseIndex >= 2 ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.9,
                    ease: 'easeOut',
                  }}
                />
              </g>
            </svg>

            {/* Inner pulsing bloom glow */}
            <motion.div
              className="absolute w-12 h-12 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(79,216,255,0.2) 0%, transparent 70%)',
              }}
              animate={
                phaseIndex >= 2
                  ? {
                      scale: [0.9, 1.25, 0.9],
                      opacity: [0.4, 0.8, 0.4],
                    }
                  : {}
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* ─── "SYSTEM ARISE" Title ─── */}
          <motion.div
            className="relative z-10 mt-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={
              phaseIndex >= 3
                ? { opacity: phase === 'exit' ? 0 : 1 }
                : {}
            }
            transition={{ duration: phase === 'exit' ? 0.45 : 0.5 }}
          >
            {/* Text glow backdrop */}
            <motion.div
              className="absolute inset-0 blur-2xl pointer-events-none"
              style={{ background: 'rgba(79,216,255,0.06)' }}
              animate={
                phaseIndex >= 3
                  ? { opacity: [0.25, 0.5, 0.25] }
                  : {}
              }
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Character-by-character reveal */}
            <div className="flex items-center justify-center gap-[3px] relative">
              {titleText.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block text-[21px] font-bold tracking-[0.28em]"
                  style={{
                    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    color: 'transparent',
                    backgroundImage: 'linear-gradient(180deg, #FFFFFF 10%, #4FD8FF 60%, #3A8DFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    filter: 'drop-shadow(0 0 6px rgba(79,216,255,0.3))',
                  }}
                  initial={{ opacity: 0, y: 15, scale: 0.7, rotateX: -60 }}
                  animate={
                    phaseIndex >= 3
                      ? { opacity: 1, y: 0, scale: 1, rotateX: 0 }
                      : {}
                  }
                  transition={{
                    duration: 0.45,
                    delay: i * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            {/* Underline sweep */}
            <motion.div
              className="h-[1px] mx-auto mt-3.5"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(79,216,255,0.55), transparent)',
              }}
              initial={{ width: 0, opacity: 0 }}
              animate={
                phaseIndex >= 3
                  ? { width: 170, opacity: 1 }
                  : {}
              }
              transition={{ duration: 0.9, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </motion.div>

          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-[1px] pointer-events-none z-50"
            style={{
              background: 'linear-gradient(90deg, transparent 10%, rgba(79,216,255,0.1) 40%, rgba(79,216,255,0.18) 50%, rgba(79,216,255,0.1) 60%, transparent 90%)',
            }}
            initial={{ top: '0%', opacity: 0 }}
            animate={
              phaseIndex >= 1
                ? { top: ['0%', '100%'], opacity: [0, 0.4, 0] }
                : {}
            }
            transition={{ duration: 2.8, delay: 0.4, ease: 'linear' }}
          />

          {/* iOS-style Corner lines */}
          {phaseIndex >= 1 && (
            <>
              <motion.div
                className="absolute top-8 left-6 flex flex-col gap-[2px] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="w-5 h-[1px] bg-[#4FD8FF]" />
                <div className="w-2.5 h-[1px] bg-[#4FD8FF] mt-1" />
              </motion.div>
              <motion.div
                className="absolute bottom-8 right-6 flex flex-col items-end gap-[2px] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="w-5 h-[1px] bg-[#4FD8FF]" />
                <div className="w-2.5 h-[1px] bg-[#4FD8FF] mt-1" />
              </motion.div>
            </>
          )}

          {/* Version tag */}
          <motion.p
            className="absolute bottom-6 text-[8px] tracking-[0.25em] uppercase z-10 pointer-events-none"
            style={{
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              color: 'rgba(255,255,255,0.06)',
            }}
            initial={{ opacity: 0 }}
            animate={phaseIndex >= 1 ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            v1.0
          </motion.p>

          {/* Exit transition overlay */}
          {phase === 'exit' && (
            <motion.div
              className="absolute inset-0 z-[1000] pointer-events-none"
              style={{ background: '#050608' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
