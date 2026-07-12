import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#050608] flex flex-col items-center justify-center z-[300]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Cyan pulsing orb */}
        <div className="relative mb-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full bg-[#4FD8FF]/20"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="absolute inset-0 w-16 h-16 rounded-full bg-[#4FD8FF]/10"
          />
          <div className="absolute inset-0 w-16 h-16 rounded-full border border-[#4FD8FF]/30" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="system-text text-[#4FD8FF]/60 tracking-[0.2em]"
        >
          INITIALIZING SYSTEM
        </motion.p>
      </motion.div>
    </div>
  );
}
