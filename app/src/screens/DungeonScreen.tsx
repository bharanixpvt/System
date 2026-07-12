import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Castle, Lock, Clock, Zap, ChevronRight, X, Sword, Shield, Timer, Trophy
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';

export function DungeonScreen() {
  const { dungeons, completeDungeon } = useGameStore();
  const [activeDungeon, setActiveDungeon] = useState<string | null>(null);

  const selected = dungeons.find(d => d.id === activeDungeon);

  if (selected) {
    return (
      <DungeonActive
        dungeon={selected}
        onClose={() => setActiveDungeon(null)}
        onComplete={(time) => {
          completeDungeon(selected.id, time);
          setActiveDungeon(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Castle size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">Dungeons</h1>
      </div>
      <p className="text-sm text-white/40 mb-4">Select a challenge to undertake</p>

      <div className="space-y-3">
        {dungeons.map((dungeon, index) => (
          <motion.div
            key={dungeon.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-4 transition-all ${
              dungeon.status === 'locked'
                ? 'opacity-40 cursor-not-allowed'
                : 'glass-card-hover cursor-pointer'
            }`}
            style={dungeon.status !== 'locked' ? { borderColor: `${dungeon.color}20` } : {}}
            onClick={() => {
              if (dungeon.status !== 'locked') {
                playButtonPress();
                setActiveDungeon(dungeon.id);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${dungeon.color}15` }}
                >
                  {dungeon.status === 'locked' ? (
                    <Lock size={20} style={{ color: dungeon.color }} />
                  ) : (
                    <Sword size={20} style={{ color: dungeon.color }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{dungeon.name}</h3>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: `${dungeon.color}20`, color: dungeon.color }}
                    >
                      {'★'.repeat(dungeon.difficulty)}{'☆'.repeat(5 - dungeon.difficulty)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{dungeon.description}</p>
                  {dungeon.status === 'locked' && dungeon.requirements && (
                    <p className="text-[10px] text-[#FBBF24] mt-1">{dungeon.requirements}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-white/20 mt-1" />
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Clock size={12} /> {dungeon.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1 text-xs text-[#4FD8FF]">
                <Zap size={12} /> +{dungeon.xpReward} XP
              </span>
              {dungeon.bestTime && (
                <span className="flex items-center gap-1 text-xs text-[#4ADE80]">
                  <Trophy size={12} /> Best: {dungeon.bestTime}min
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DungeonActive({ dungeon, onClose, onComplete }: {
  dungeon: import('@/types').Dungeon;
  onClose: () => void;
  onComplete: (time: number) => void;
}) {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Timer effect
  useState(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    const timeMinutes = Math.ceil(timer / 60);
    onComplete(timeMinutes);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 transition-colors">
          <X size={16} /> Exit
        </button>
        <div
          className="text-xs px-2 py-1 rounded font-bold"
          style={{ backgroundColor: `${dungeon.color}20`, color: dungeon.color }}
        >
          {dungeon.name}
        </div>
      </div>

      {/* Timer Display */}
      <div className="glass-card p-6 text-center" style={{ borderColor: `${dungeon.color}30` }}>
        <Timer size={32} className="mx-auto mb-3" style={{ color: dungeon.color }} />
        <div className="text-5xl font-mono font-bold text-gradient-cyan mb-2">
          {formatTime(timer)}
        </div>
        <p className="text-xs text-white/40">Elapsed Time</p>

        {!completed ? (
          <div className="flex gap-3 mt-4 justify-center">
            {!isRunning ? (
              <button
                onClick={() => setIsRunning(true)}
                className="px-6 py-2.5 bg-[#4FD8FF]/20 text-[#4FD8FF] rounded-lg text-sm font-medium border border-[#4FD8FF]/30"
              >
                Start
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-4 py-2.5 bg-white/10 text-white/60 rounded-lg text-sm"
                >
                  Pause
                </button>
                <button
                  onClick={() => { setIsRunning(false); setCompleted(true); }}
                  className="px-6 py-2.5 bg-[#4ADE80]/20 text-[#4ADE80] rounded-lg text-sm font-medium border border-[#4ADE80]/30"
                >
                  Complete
                </button>
              </>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <p className="text-sm text-[#4ADE80] mb-3">Dungeon Cleared!</p>
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 bg-gradient-to-r from-[#4FD8FF] to-[#3A8DFF] text-[#050608] rounded-lg text-sm font-bold"
            >
              Claim Rewards (+{dungeon.xpReward} XP)
            </button>
          </motion.div>
        )}
      </div>

      {/* Exercises */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3">Challenge Exercises</h3>
        <div className="space-y-2">
          {dungeon.exercises.map((ex, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
              <Shield size={14} style={{ color: dungeon.color }} />
              <span className="text-sm">{ex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-2">Rewards</h3>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-sm text-[#4FD8FF]">
            <Zap size={14} /> {dungeon.xpReward} XP
          </span>
          <span className="flex items-center gap-1 text-sm text-[#EAB308]">
            <Trophy size={14} /> {dungeon.coinReward} Coins
          </span>
        </div>
      </div>
    </div>
  );
}
