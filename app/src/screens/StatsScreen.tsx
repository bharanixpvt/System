// ============================================================
// SYSTEM v3 — Player Stats Screen
// Progressive Disclosure, Hidden Attributes, Level Demotion Modal
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
  TrendingUp, ChevronDown, ChevronUp, Scale, CheckCircle2, Activity, Eye, BrainCircuit, Sparkles, Cpu, Flame
} from 'lucide-react';
import type { StatName } from '@/types';
import { STAT_CONFIG } from '@/types';
import { RankingsModal } from '@/components/RankingsModal';

const ICON_MAP: Record<string, typeof Dumbbell> = {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
  Scale, CheckCircle2, Activity, Eye, BrainCircuit, Sparkles, Cpu, Flame,
};

export function StatsScreen() {
  const { stats, profile } = useGameStore();
  const [expandedStat, setExpandedStat] = useState<StatName | null>(null);
  const [showRanks, setShowRanks] = useState(false);

  if (!profile) return null;

  const unlockedStats = stats.filter(s => s.unlocked || profile.unlockedStats?.includes(s.name));
  const lockedStats = stats.filter(s => !unlockedStats.some(u => u.name === s.name));

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-[#CBD5E1]" />
          <h1 className="text-lg font-bold">Player Attributes</h1>
        </div>
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

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-white/5 space-y-3"
                  >
                    <div>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>XP Progress</span>
                        <span>{stat.xp} / {stat.xpToNext} XP</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ backgroundColor: stat.color, width: `${xpPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <DetailItem label="Stat Tier" value={stat.rank} />
                      <DetailItem label="Total Stat XP" value={`${stat.xp} XP`} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Locked Stats Section */}
      {lockedStats.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-white/30 tracking-wider uppercase">Locked Attributes ({lockedStats.length})</div>
          <div className="grid grid-cols-1 gap-2">
            {lockedStats.map((stat) => {
              const Icon = ICON_MAP[STAT_CONFIG[stat.name]?.icon] || Lock;
              return (
                <div key={stat.name} className="glass-card p-3 flex items-center justify-between border-dashed border-white/10 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/30">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white/60">{stat.displayName}</div>
                      <div className="text-[10px] text-white/40">Requires SYSTEM Upskill Activation</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-400 font-bold bg-purple-950/30 px-2.5 py-1 rounded-lg border border-purple-500/20">
                    <Lock size={12} /> LOCKED
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranks Ladder Modal */}
      <AnimatePresence>
        {showRanks && (
          <RankingsModal onClose={() => setShowRanks(false)} />
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
