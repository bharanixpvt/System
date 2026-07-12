import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';
import { playButtonPress } from '@/lib/audio';

type OpeningPhase = 'searching' | 'found' | 'question' | 'rejected';

export function OpeningScreen() {
  const [phase, setPhase] = useState<OpeningPhase>('searching');
  const [textVisible, setTextVisible] = useState(false);
  const { navigateTo } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'searching') {
      const timer = setTimeout(() => setPhase('found'), 3000);
      return () => clearTimeout(timer);
    }
    if (phase === 'found') {
      const timer = setTimeout(() => setPhase('question'), 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleAccept = () => {
    playButtonPress();
    navigateTo('onboarding');
  };

  const handleReject = () => {
    playButtonPress();
    setPhase('rejected');
    setTimeout(() => setPhase('searching'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(203, 213, 225, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      <AnimatePresence mode="wait">
        {/* SEARCHING PHASE */}
        {phase === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-8"
            >
              <div className="w-20 h-20 mx-auto rounded-full border border-[#CBD5E1]/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#CBD5E1]/10 animate-pulse" />
              </div>
            </motion.div>

            {textVisible && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="system-text text-white/50 tracking-[0.15em]"
              >
                Searching for a suitable Player...
              </motion.p>
            )}

            {/* Scanning dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* CANDIDATE FOUND PHASE */}
        {phase === 'found' && (
          <motion.div
            key="found"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#CBD5E1]/10 border border-[#CBD5E1]/40 flex items-center justify-center">
                <Power size={28} className="text-[#CBD5E1]" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="system-text text-[#CBD5E1] tracking-[0.15em] mb-2"
            >
              CANDIDATE FOUND
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/40 text-sm"
            >
              Vital signs acceptable
            </motion.p>
          </motion.div>
        )}

        {/* QUESTION PHASE */}
        {phase === 'question' && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center w-full max-w-sm"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 mb-10 leading-relaxed"
            >
              Would you like to become
              <span className="text-[#CBD5E1] font-semibold"> stronger</span>?
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={handleAccept}
                className="w-full py-4 bg-gradient-to-r from-[#CBD5E1]/20 to-[#64748B]/20 hover:from-[#CBD5E1]/30 hover:to-[#64748B]/30 border border-[#CBD5E1]/40 text-[#CBD5E1] rounded-xl font-semibold text-sm tracking-wider transition-all duration-300 btn-press glow-border"
              >
                ACCEPT
              </button>

              <button
                onClick={handleReject}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/60 rounded-xl text-sm tracking-wider transition-all duration-300 btn-press"
              >
                REJECT
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* REJECTED PHASE */}
        {phase === 'rejected' && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="system-text text-white/40 tracking-[0.15em]"
            >
              Reinitializing search...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom version */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="system-text text-white/20 tracking-[0.2em]">SYSTEM v1.0</p>
      </div>
    </div>
  );
}
