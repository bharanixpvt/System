import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function SystemNotification() {
  const { systemMessage, setSystemMessage } = useGameStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (systemMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setSystemMessage(null), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  if (!systemMessage) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -60, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -60, x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-16 left-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="glass-panel rounded-xl p-4 border border-[#CBD5E1]/20 shadow-lg shadow-[#CBD5E1]/10">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="system-text text-[#CBD5E1] mb-1">SYSTEM</div>
                <p className="text-sm text-white/90 leading-relaxed">{systemMessage}</p>
              </div>
              <button
                onClick={() => { setVisible(false); setSystemMessage(null); }}
                className="text-white/40 hover:text-white/80 transition-colors p-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
