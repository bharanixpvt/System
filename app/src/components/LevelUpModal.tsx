import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';

export function LevelUpModal() {
  const { showLevelUp, showRankUp, profile, clearLevelUp, clearRankUp } = useGameStore();

  const handleClose = () => {
    clearLevelUp();
    clearRankUp();
  };

  return (
    <AnimatePresence>
      {(showLevelUp || showRankUp) && profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="glass-card glow-border p-8 max-w-sm w-full mx-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Particle burst effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos(i * 30 * Math.PI / 180) * 80,
                    y: Math.sin(i * 30 * Math.PI / 180) * 80,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.2, delay: i * 0.05 }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#4FD8FF]"
                />
              ))}
            </div>

            {showRankUp && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-4"
              >
                <Award size={48} className="mx-auto text-[#FBBF24]" />
              </motion.div>
            )}

            {showLevelUp && !showRankUp && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-4"
              >
                <Star size={48} className="mx-auto text-[#4FD8FF]" />
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              {showRankUp ? (
                <span className="text-gradient-cyan">Rank Up!</span>
              ) : (
                <span className="text-gradient-cyan">Level Up!</span>
              )}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {showRankUp ? (
                <>
                  <p className="text-white/60 text-sm mb-2">Player has been promoted</p>
                  <p className="text-xl font-bold text-[#FBBF24]">{profile.currentRank}</p>
                </>
              ) : (
                <>
                  <p className="text-white/60 text-sm mb-1">Player reached</p>
                  <p className="text-3xl font-bold text-[#4FD8FF]">Level {profile.totalLevel}</p>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-white/50"
            >
              <TrendingUp size={14} />
              <span>Keep training to progress further</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-[#4FD8FF]/20 hover:bg-[#4FD8FF]/30 text-[#4FD8FF] rounded-lg text-sm font-medium transition-colors border border-[#4FD8FF]/30"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
