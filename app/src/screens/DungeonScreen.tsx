import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Castle, Lock, Clock, Zap, ChevronRight, X, Sword, Shield, Timer, Trophy, Sliders, Plus, Trash2
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';

export function DungeonScreen() {
  const { dungeons, completeDungeon, profile, dungeonTimerBonusSeconds, dungeonDifficultyReduction, consumeDungeonAids, settings } = useGameStore();
  const [activeDungeon, setActiveDungeon] = useState<string | null>(null);

  const selected = dungeons.find(d => d.id === activeDungeon);

  if (selected) {
    return (
      <DungeonActive
        dungeon={selected}
        rankLevel={profile?.totalLevel || 1}
        timerBonusSeconds={dungeonTimerBonusSeconds}
        difficultyReduction={dungeonDifficultyReduction}
        onStart={consumeDungeonAids}
        onClose={() => setActiveDungeon(null)}
        onComplete={(time, feltEasy) => {
          completeDungeon(selected.id, time, feltEasy);
          setActiveDungeon(null);
        }}
      />
    );
  }

  const onboardingComplete = settings?.onboardingComplete ?? false;

  const visibleDungeons = dungeons.filter(d => {
    if (d.type === 'boss') {
      return onboardingComplete;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Castle size={18} className="text-[#CBD5E1]" />
        <h1 className="text-lg font-bold">Dungeons</h1>
      </div>
      <p className="text-sm text-white/40 mb-4">Select a challenge to undertake</p>

      <div className="space-y-3">
        {visibleDungeons.map((dungeon, index) => {
          const isBoss = dungeon.id === 'dungeon-weekly-boss';
          const isLocked = dungeon.status === 'locked' || (isBoss && dungeon.status !== 'available');
          
          let cardBorderColor = dungeon.status !== 'locked' ? `${dungeon.color}20` : undefined;
          let cardBoxShadow = undefined;

          if (isBoss) {
            if (dungeon.status === 'available') {
              cardBorderColor = '#EF4444';
              cardBoxShadow = '0 0 15px rgba(239, 68, 68, 0.2)';
            } else if (dungeon.status === 'expired') {
              cardBorderColor = 'rgba(239, 68, 68, 0.2)';
            } else if (dungeon.status === 'completed') {
              cardBorderColor = 'rgba(74, 222, 128, 0.2)';
            }
          }

          return (
            <motion.div
              key={dungeon.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 transition-all ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed'
                  : 'glass-card-hover cursor-pointer'
              }`}
              style={{ 
                borderColor: cardBorderColor,
                boxShadow: cardBoxShadow
              }}
              onClick={() => {
                if (!isLocked) {
                  playButtonPress();
                  setActiveDungeon(dungeon.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: isBoss && dungeon.status === 'available' ? 'rgba(239, 68, 68, 0.15)' : `${dungeon.color}15` }}
                  >
                    {isLocked ? (
                      <Lock size={20} style={{ color: isBoss ? '#EF4444' : dungeon.color }} />
                    ) : (
                      <Sword size={20} style={{ color: isBoss ? '#EF4444' : dungeon.color }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{dungeon.name}</h3>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                        style={{ backgroundColor: `${dungeon.color}20`, color: dungeon.color }}
                      >
                        {'★'.repeat(dungeon.difficulty)}{'☆'.repeat(5 - dungeon.difficulty)}
                      </span>
                      {dungeon.difficultyOffset && dungeon.difficultyOffset > 0 ? (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/20">
                          +{dungeon.difficultyOffset} Escalated
                        </span>
                      ) : null}
                      {isBoss && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-950/50 text-red-500 border border-red-500/20">
                          BOSS DUNGEON
                        </span>
                      )}
                      {isBoss && dungeon.status === 'completed' && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-950/40 text-green-400 border border-green-500/20">
                          CLEARED
                        </span>
                      )}
                      {isBoss && dungeon.status === 'expired' && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-950/30 text-red-700 border border-red-900/20">
                          EXPIRED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-1">{dungeon.description}</p>
                    {dungeon.status === 'locked' && dungeon.requirements && (
                      <p className="text-[10px] text-[#FBBF24] mt-1">{dungeon.requirements}</p>
                    )}
                    {isBoss && dungeon.status === 'available' && (
                      <p className="text-[10px] text-[#EF4444] font-bold mt-1">
                        Time Remaining: 24h evaluation window active!
                      </p>
                    )}
                  </div>
                </div>
                {!isLocked && <ChevronRight size={18} className="text-white/20 mt-1" />}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Clock size={12} /> {Math.max(2, dungeon.estimatedMinutes - Math.floor((profile?.totalLevel || 1) / 15))} min limit
                </span>
                <span className="flex items-center gap-1 text-xs text-[#CBD5E1]">
                  <Zap size={12} /> +{dungeon.xpReward} XP
                </span>
                {dungeon.bestTime && (
                  <span className="flex items-center gap-1 text-xs text-[#4ADE80]">
                    <Trophy size={12} /> Best: {dungeon.bestTime}min
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DungeonActive({ dungeon, rankLevel, timerBonusSeconds, difficultyReduction, onStart, onClose, onComplete }: {
  dungeon: import('@/types').Dungeon;
  rankLevel: number; timerBonusSeconds: number; difficultyReduction: number;
  onStart: () => void;
  onClose: () => void;
  onComplete: (time: number, feltEasy: boolean) => void;
}) {
  const { profile } = useGameStore();

  const offset = dungeon.difficultyOffset || 0;
  const permBonus = (profile as any)?.dungeonTimerPermanentBonusSeconds || 0;

  const rankPressure = Math.floor(rankLevel / 15);
  const effectiveDifficulty = Math.min(5, Math.max(1, dungeon.difficulty + rankPressure - difficultyReduction + offset));
  const timeLimit = Math.max(120, dungeon.estimatedMinutes * 60 - rankPressure * 30 + timerBonusSeconds + permBonus - offset * 30);
  
  const [timer, setTimer] = useState(timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lost, setLost] = useState(false);

  // Exercise customization states
  const [localExercises, setLocalExercises] = useState<string[]>(dungeon.exercises);
  const [isEditing, setIsEditing] = useState(false);
  const [newExerciseText, setNewExerciseText] = useState('');

  // Difficulty escalation feedback state
  const [feltEasy, setFeltEasy] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => { if (timer === 0 && isRunning) { setIsRunning(false); setLost(true); } }, [timer, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    const timeMinutes = Math.ceil((timeLimit - timer) / 60);
    onComplete(timeMinutes, feltEasy);
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
        <p className="text-xs text-white/40">
          Time remaining · Difficulty {effectiveDifficulty}/5
          {offset > 0 && <span className="text-amber-400 ml-1">(+{offset} Escalated)</span>}
          {permBonus > 0 && <span className="text-[#CBD5E1] ml-1">(+{permBonus}s Permanent)</span>}
        </p>

        {lost ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <p className="text-sm text-[#EF4444] mb-2">Dungeon lost. Retreat safely and return when you are ready.</p>
            <button onClick={onClose} className="px-5 py-2 rounded-lg bg-white/10 text-sm">Return to portal</button>
          </motion.div>
        ) : !completed ? (
          <div className="flex gap-3 mt-4 justify-center">
            {!isRunning ? (
              <button
                onClick={() => { onStart(); setIsRunning(true); }}
                className="px-6 py-2.5 bg-[#CBD5E1]/20 text-[#CBD5E1] rounded-lg text-sm font-medium border border-[#CBD5E1]/30"
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
            className="mt-4 border-t border-white/5 pt-4"
          >
            <p className="text-sm text-[#4ADE80] mb-2 font-bold">Dungeon Cleared!</p>
            
            {/* Escalation feedback panel */}
            <div className="glass-panel p-3.5 bg-white/5 border border-white/10 rounded-lg mb-4 text-left">
              <p className="text-xs font-semibold text-white/70 mb-2">Was this dungeon too easy?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeltEasy(false)}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${
                    !feltEasy
                      ? 'bg-[#CBD5E1]/20 text-[#CBD5E1] border-[#CBD5E1]/30'
                      : 'bg-white/5 text-white/45 border-transparent hover:bg-white/10'
                  }`}
                >
                  Perfect Difficulty
                </button>
                <button
                  onClick={() => setFeltEasy(true)}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition-all ${
                    feltEasy
                      ? 'bg-[#EF4444]/25 text-[#EF4444] border-[#EF4444]/30'
                      : 'bg-white/5 text-white/45 border-transparent hover:bg-white/10'
                  }`}
                >
                  Yes, make it harder
                </button>
              </div>
              {feltEasy && (
                <p className="text-[10px] text-[#EF4444] mt-2 leading-tight">
                  ▲ Next time: Dungeon rating increases and timer limit is reduced by 30s.
                </p>
              )}
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-2.5 bg-gradient-to-r from-[#CBD5E1] to-[#64748B] text-[#050608] rounded-lg text-sm font-bold"
            >
              Claim Rewards (+{dungeon.xpReward} XP)
            </button>
          </motion.div>
        )}
      </div>

      {/* Exercises with inline editor */}
      <div className="glass-card p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">Challenge Exercises</h3>
          {!isEditing && !isRunning && !completed && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-[#CBD5E1] hover:underline"
            >
              <Sliders size={12} />
              Customize
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2.5">
            {localExercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ex}
                  onChange={(e) => {
                    const updated = [...localExercises];
                    updated[i] = e.target.value;
                    setLocalExercises(updated);
                  }}
                  className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-white focus:border-[#CBD5E1]/50 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setLocalExercises(localExercises.filter((_, idx) => idx !== i));
                  }}
                  className="p-1.5 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                placeholder="Add custom exercise..."
                value={newExerciseText}
                onChange={(e) => setNewExerciseText(e.target.value)}
                className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-white focus:border-[#CBD5E1]/50 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newExerciseText.trim()) {
                      setLocalExercises([...localExercises, newExerciseText.trim()]);
                      setNewExerciseText('');
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newExerciseText.trim()) {
                    setLocalExercises([...localExercises, newExerciseText.trim()]);
                    setNewExerciseText('');
                  }
                }}
                className="p-1.5 rounded bg-[#CBD5E1]/15 hover:bg-[#CBD5E1]/25 text-[#CBD5E1] border border-[#CBD5E1]/20"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-[#CBD5E1]/20 hover:bg-[#CBD5E1]/30 text-[#CBD5E1] border border-[#CBD5E1]/20 rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {localExercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                <Shield size={14} style={{ color: dungeon.color }} />
                <span className="text-sm">{ex}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-2">Rewards</h3>
        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-sm text-[#CBD5E1]">
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
