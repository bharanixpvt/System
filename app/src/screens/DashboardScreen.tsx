// ============================================================
// SYSTEM v3 — Adaptive Player Dashboard Screen
// Ruthless System Broadcast, Progressive Disclosure, Quest Pacing
// ============================================================

import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Flame,
  Shield,
  Trophy,
  Zap,
  ChevronRight,
  Target,
  Award,
  Clock,
  ScrollText,
} from 'lucide-react';
import { RANK_LEVEL_RANGES } from '@/types';
import type { ScreenName } from '@/types';
import { getRuthlessMessage } from '@/db/ruthlessMessages';
import { useState } from 'react';

export function DashboardScreen() {
  const { profile, stats, quests, navigateTo } = useGameStore();
  const [ruthlessQuote] = useState(() => getRuthlessMessage());

  if (!profile) return null;

  const completedToday = quests.filter(q => q.type === 'daily' && q.status === 'completed').length;
  const totalDaily = quests.filter(q => q.type === 'daily').length;
  const completionPercent = totalDaily > 0 ? Math.round((completedToday / totalDaily) * 100) : 0;
  const xpPercent = profile.xpToNextLevel > 0
    ? ((profile.totalXP % profile.xpToNextLevel) / profile.xpToNextLevel) * 100
    : 0;

  const rankColor = RANK_LEVEL_RANGES[profile.currentRank]?.color || '#CBD5E1';

  // Filter stats by progressive disclosure (only unlocked ones)
  const visibleStats = stats.filter(s => s.unlocked || profile.unlockedStats?.includes(s.name));

  return (
    <div className="space-y-4 pb-6">
      {/* Player Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card glow-border p-5 relative overflow-hidden"
      >
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: rankColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="system-text text-white/40 mb-1">SYSTEM OPERATOR</div>
              <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
            </div>
            <div className="text-right">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
              >
                <Shield size={12} />
                {profile.currentRank}
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex items-end gap-3 mb-3">
            <span className="text-5xl font-bold text-gradient-cyan">Lv.{profile.totalLevel}</span>
            <span className="text-xs text-white/40 mb-1.5 font-mono">AVAILABLE TIME: {profile.availableTimeMinutes || 30} MINS/DAY</span>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Experience Pacing</span>
              <span className="text-[#CBD5E1] font-mono">{Math.round(xpPercent)}%</span>
            </div>
            <div className="xp-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpPercent)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="xp-bar-fill"
              />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <QuickStat icon={Flame} value={profile.streak} label="Day Streak" color="#FBBF24" />
            <QuickStat icon={Trophy} value={profile.coins} label="Coins" color="#EAB308" />
            <QuickStat icon={Target} value={`${completionPercent}%`} label="Quests Cleared" color="#4ADE80" />
          </div>
        </div>
      </motion.div>

      {/* SYSTEM DIRECTIVE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 border-[#CBD5E1]/30 bg-gradient-to-r from-[#CBD5E1]/10 to-transparent relative overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CBD5E1]/20 border border-[#CBD5E1]/30 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={20} className="text-[#CBD5E1] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="system-text text-[#CBD5E1] text-xs">SYSTEM DIRECTIVE</span>
            </div>
            <p className="text-xs font-semibold text-white/90 leading-relaxed font-mono">
              "{ruthlessQuote}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Available Time Budget Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-3.5 flex items-center justify-between border-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#CBD5E1]">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-xs font-bold">Daily Time Foundation</div>
            <div className="text-[11px] text-white/50">{profile.availableTimeMinutes || 30} minutes dedicated today</div>
          </div>
        </div>
        <button
          onClick={() => navigateTo('settings' as ScreenName)}
          className="text-xs text-[#CBD5E1] underline hover:text-white"
        >
          Adjust
        </button>
      </motion.div>

      {/* Fatigue Condition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className={profile.fatigue > 60 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'} />
            <span className="text-xs font-semibold">Physical Fatigue Index</span>
          </div>
          <span className={`text-xs font-bold ${
            profile.fatigue > 70 ? 'text-[#FF5A5F]' :
            profile.fatigue > 40 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'
          }`}>
            {profile.fatigue > 70 ? 'ELEVATED FATIGUE' : profile.fatigue > 40 ? 'MODERATE' : 'OPTIMAL CONDITION'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            style={{ width: `${profile.fatigue}%` }}
            className={`h-full rounded-full ${
              profile.fatigue > 70 ? 'bg-[#FF5A5F]' : profile.fatigue > 40 ? 'bg-[#FBBF24]' : 'bg-[#4ADE80]'
            }`}
          />
        </div>
      </motion.div>

      {/* Quick Navigation Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionButton
          icon={ScrollText}
          label="Quests Engine"
          description="View daily missions"
          onClick={() => navigateTo('quests' as ScreenName)}
          color="#CBD5E1"
        />
        <QuickActionButton
          icon={Award}
          label="Enter Dungeon"
          description="Rank trial"
          onClick={() => navigateTo('dungeon' as ScreenName)}
          color="#8B5CF6"
        />
      </div>

      {/* Progressive Disclosure Attributes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Active Attributes</h2>
            <p className="text-[10px] text-white/40">Only attributes matching your directives are visible</p>
          </div>
          <button
            onClick={() => navigateTo('stats' as ScreenName)}
            className="flex items-center gap-1 text-xs text-[#CBD5E1] hover:text-[#CBD5E1]/80 transition-colors"
          >
            All Stats <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {visibleStats.slice(0, 4).map(stat => (
            <div key={stat.name} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold">{stat.displayName}</div>
                <div className="text-[10px] text-white/40">Level {stat.level}</div>
              </div>
              <div className="text-base font-bold" style={{ color: stat.color }}>{stat.level}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ icon: Icon, value, label, color }: {
  icon: typeof Flame; value: string | number; label: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-sm font-bold">{value}</div>
        <div className="text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, onClick, color }: {
  icon: typeof ScrollText; label: string; description: string; onClick: () => void; color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-4 text-left transition-all hover:border-opacity-30 btn-press"
      style={{ borderColor: `${color}30` }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-white/40">{description}</p>
    </motion.button>
  );
}
