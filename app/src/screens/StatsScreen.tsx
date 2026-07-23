// ============================================================
// SYSTEM v3 — Player Stats Screen
// Progressive Disclosure, Hidden Attributes, Level Demotion Modal
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
  TrendingUp, ChevronDown, ChevronUp, Info, EyeOff, RotateCcw, AlertOctagon, Scale, CheckCircle2, Activity, Eye, BrainCircuit, Sparkles, Cpu, Flame
} from 'lucide-react';
import type { StatName } from '@/types';
import { STAT_CONFIG } from '@/types';
import { RankingsModal } from '@/components/RankingsModal';

const ICON_MAP: Record<string, typeof Dumbbell> = {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
  Scale, CheckCircle2, Activity, Eye, BrainCircuit, Sparkles, Cpu, Flame,
};

export function StatsScreen() {
  const { stats, profile, voluntarilyReduceLevel } = useGameStore();
  const [expandedStat, setExpandedStat] = useState<StatName | null>(null);
  const [showRanks, setShowRanks] = useState(false);
  const [showDemotionModal, setShowDemotionModal] = useState(false);
  const [targetLevelInput, setTargetLevelInput] = useState<number>(1);

  if (!profile) return null;

  const unlockedStats = stats.filter(s => s.unlocked || profile.unlockedStats?.includes(s.name));
  const lockedStats = stats.filter(s => !unlockedStats.some(u => u.name === s.name));

  const handleDemote = async () => {
    if (targetLevelInput >= profile.totalLevel || targetLevelInput < 1) return;
    await voluntarilyReduceLevel(targetLevelInput);
    setShowDemotionModal(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[#CBD5E1]" />
          <h1 className="text-lg font-bold">Player Attributes</h1>
        </div>
        <button
          onClick={() => setShowDemotionModal(true)}
          className="flex items-center gap-1 text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-lg hover:bg-red-900/50 btn-press"
        >
          <RotateCcw size={12} /> Level Replay
        </button>
      </div>

      <button onClick={() => setShowRanks(true)} className="w-full glass-card p-3 text-left flex items-center justify-between border-[#CBD5E1]/15">
        <span className="text-xs text-white/50">Current rank</span>
        <span className="text-sm font-semibold text-[#CBD5E1]">{profile.currentRank} · View Rank Ladder</span>
      </button>

      {/* Unlocked Stats List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#CBD5E1] tracking-wider uppercase">Active Attributes ({unlockedStats.length})</div>
        {unlockedStats.map((stat, index) => {
          const Icon = ICON_MAP[STAT_CONFIG[stat.name]?.icon] || Target;
          const isExpanded = expandedStat === stat.name;
          const xpPercent = stat.xpToNext > 0 ? (stat.xp / stat.xpToNext) * 100 : 0;

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setExpandedStat(isExpanded ? null : stat.name)}
              className="glass-card glass-card-hover p-4 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{stat.displayName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">{stat.rank}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{stat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.level}</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
                </div>
              </div>

              {/* XP Bar */}
              <div className="mt-3">
                <div className="stat-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, xpPercent)}%` }}
                    transition={{ duration: 0.8 }}
                    className="stat-bar-fill"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <DetailItem label="Current XP" value={`${stat.xp}`} />
                    <DetailItem label="XP to Next" value={`${stat.xpToNext}`} />
                    <DetailItem label="Rank" value={stat.rank} />
                    <DetailItem label="Pacing" value={`${Math.round(xpPercent)}%`} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Hidden / Locked Attributes Section */}
      {lockedStats.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <EyeOff size={14} className="text-white/40" />
            <div className="text-xs font-bold text-white/40 tracking-wider uppercase">Locked Attributes ({lockedStats.length})</div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {lockedStats.map(stat => (
              <div key={stat.name} className="glass-card p-3 opacity-60 flex items-center justify-between border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Lock size={14} className="text-white/40" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/70">{stat.displayName}</div>
                    <div className="text-[10px] text-white/40">Unlock via Leveling or SYSTEM Repository Upskills</div>
                  </div>
                </div>
                <span className="text-xs text-white/30 font-mono">LOCKED</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRanks && <RankingsModal onClose={() => setShowRanks(false)} />}

      {/* Voluntary Level Reduction Modal */}
      <AnimatePresence>
        {showDemotionModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full border-red-500/30"
            >
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <AlertOctagon size={24} />
                <h3 className="text-lg font-bold text-white">Voluntary Level Reduction</h3>
              </div>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Voluntarily reduce your total level to replay progression or increase challenge. Achievements, coins, and titles will remain intact.
              </p>
              <div className="mb-4">
                <label className="text-xs text-white/50 block mb-1">Target Level (Current: Lv.{profile.totalLevel})</label>
                <input
                  type="number"
                  min={1}
                  max={profile.totalLevel - 1}
                  value={targetLevelInput}
                  onChange={e => setTargetLevelInput(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-2.5 text-sm text-white focus:border-red-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDemotionModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDemote}
                  className="flex-1 py-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold hover:bg-red-600/50"
                >
                  Confirm Reduction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-medium mt-0.5">{value}</div>
    </div>
  );
}
