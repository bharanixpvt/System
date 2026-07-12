import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
  TrendingUp, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import type { StatName } from '@/types';
import { STAT_CONFIG } from '@/types';

const ICON_MAP: Record<string, typeof Dumbbell> = {
  Dumbbell, Zap, Heart, Target, Gauge, Shield, Move, Lock, BatteryCharging,
};

export function StatsScreen() {
  const { stats } = useGameStore();
  const [expandedStat, setExpandedStat] = useState<StatName | null>(null);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">Player Stats</h1>
      </div>
      <p className="text-sm text-white/40 mb-4">Tap any stat to view details</p>

      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat, index) => {
          const Icon = ICON_MAP[STAT_CONFIG[stat.name].icon] || Target;
          const isExpanded = expandedStat === stat.name;
          const xpPercent = stat.xpToNext > 0 ? (stat.xp / stat.xpToNext) * 100 : 0;

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                      <span className="font-semibold">{stat.displayName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{stat.rank}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{stat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.level}</span>
                    <span className="text-xs text-white/30 ml-1">/ 100</span>
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
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                    className="stat-bar-fill"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>{stat.xp} / {stat.xpToNext} XP</span>
                  <span>{Math.round(xpPercent)}%</span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem label="Current XP" value={`${stat.xp}`} />
                    <DetailItem label="XP to Next" value={`${stat.xpToNext}`} />
                    <DetailItem label="Rank" value={stat.rank} />
                    <DetailItem label="Progress" value={`${Math.round(xpPercent)}%`} />
                  </div>
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                    <Info size={14} className="text-[#4FD8FF] mt-0.5 shrink-0" />
                    <p className="text-xs text-white/50 leading-relaxed">
                      Train {stat.displayName.toLowerCase()}-related exercises to increase this stat. 
                      Higher levels unlock new tiers in training paths.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
