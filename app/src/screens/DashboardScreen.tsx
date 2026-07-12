import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  Shield,
  Trophy,
  Zap,
  ChevronRight,
  Target,
  Award,
} from 'lucide-react';
import { RANK_LEVEL_RANGES } from '@/types';
import type { ScreenName } from '@/types';

export function DashboardScreen() {
  const { profile, stats, quests, navigateTo } = useGameStore();

  if (!profile) return null;

  const completedToday = quests.filter(q => q.type === 'daily' && q.status === 'completed').length;
  const totalDaily = quests.filter(q => q.type === 'daily').length;
  const completionPercent = totalDaily > 0 ? Math.round((completedToday / totalDaily) * 100) : 0;
  const xpPercent = profile.xpToNextLevel > 0
    ? ((profile.totalXP % profile.xpToNextLevel) / profile.xpToNextLevel) * 100
    : 0;

  const rankColor = RANK_LEVEL_RANGES[profile.currentRank]?.color || '#4FD8FF';

  return (
    <div className="space-y-5 pb-6">
      {/* Player Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card glow-border p-5 relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: rankColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="system-text text-white/40 mb-1">PLAYER STATUS</div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
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
            <span className="text-5xl font-bold text-gradient-cyan">{profile.totalLevel}</span>
            <span className="text-sm text-white/40 mb-1.5">/ 999</span>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">XP Progress</span>
              <span className="text-[#4FD8FF]">{Math.round(xpPercent)}%</span>
            </div>
            <div className="xp-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, xpPercent)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="xp-bar-fill"
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
              <span>{profile.totalXP.toLocaleString()} XP</span>
              <span>{profile.xpToNextLevel.toLocaleString()} to next</span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <QuickStat icon={Flame} value={profile.streak} label="Day Streak" color="#FBBF24" />
            <QuickStat icon={Trophy} value={profile.coins} label="Coins" color="#EAB308" />
            <QuickStat icon={Target} value={`${completionPercent}%`} label="Daily" color="#4ADE80" />
          </div>
        </div>
      </motion.div>

      {/* Fatigue & Condition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className={profile.fatigue > 60 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'} />
            <span className="text-sm font-medium">Condition</span>
          </div>
          <span className={`text-xs font-bold ${
            profile.fatigue > 70 ? 'text-[#FF5A5F]' :
            profile.fatigue > 40 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'
          }`}>
            {profile.fatigue > 70 ? 'ELEVATED' : profile.fatigue > 40 ? 'MODERATE' : 'OPTIMAL'}
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profile.fatigue}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`h-full rounded-full ${
              profile.fatigue > 70 ? 'bg-gradient-to-r from-[#FF5A5F] to-[#FBBF24]' :
              profile.fatigue > 40 ? 'bg-gradient-to-r from-[#FBBF24] to-[#4ADE80]' :
              'bg-gradient-to-r from-[#4ADE80] to-[#4FD8FF]'
            }`}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          Fatigue: {Math.round(profile.fatigue)}% — {profile.fatigue > 70
            ? 'Recovery protocols recommended'
            : profile.fatigue > 40
            ? 'Maintain current intensity'
            : 'Full training capacity available'}
        </p>
      </motion.div>

      {/* Active Quests Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Active Quests</h2>
          <button
            onClick={() => navigateTo('quests' as ScreenName)}
            className="flex items-center gap-1 text-xs text-[#4FD8FF] hover:text-[#4FD8FF]/80 transition-colors"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {quests.filter(q => q.status === 'active').slice(0, 3).map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
              onClick={() => navigateTo('quests' as ScreenName)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{quest.name}</p>
                <p className="text-xs text-white/40 truncate">{quest.description}</p>
              </div>
              <span className="text-xs font-bold text-[#4FD8FF] ml-3">+{quest.xpReward} XP</span>
            </motion.div>
          ))}
          {quests.filter(q => q.status === 'active').length === 0 && (
            <p className="text-sm text-white/30 text-center py-4">All quests completed for today</p>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <QuickActionButton
          icon={TrendingUp}
          label="Start Training"
          description="Begin a session"
          onClick={() => navigateTo('training' as ScreenName)}
          color="#4FD8FF"
        />
        <QuickActionButton
          icon={Award}
          label="Enter Dungeon"
          description="Challenge awaits"
          onClick={() => navigateTo('dungeon' as ScreenName)}
          color="#8B5CF6"
        />
      </motion.div>

      {/* Top Stats Preview */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Top Attributes</h2>
            <button
              onClick={() => navigateTo('stats' as ScreenName)}
              className="flex items-center gap-1 text-xs text-[#4FD8FF] hover:text-[#4FD8FF]/80 transition-colors"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stats.sort((a, b) => b.level - a.level).slice(0, 3).map(stat => (
              <div key={stat.name} className="text-center p-2.5 rounded-lg bg-white/5">
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.level}</div>
                <div className="text-[10px] text-white/50 uppercase">{stat.displayName}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Quick Stat Component
function QuickStat({ icon: Icon, value, label, color }: {
  icon: typeof Flame; value: string | number; label: string; color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-sm font-bold">{value}</div>
        <div className="text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ icon: Icon, label, description, onClick, color }: {
  icon: typeof TrendingUp; label: string; description: string; onClick: () => void; color: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-4 text-left transition-all hover:border-opacity-30 btn-press"
      style={{ borderColor: `${color}30` }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-white/40">{description}</p>
    </motion.button>
  );
}
