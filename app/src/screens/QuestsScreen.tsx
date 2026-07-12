import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, Check, Clock, Zap, Shield,
  Sun, Flag, HelpCircle, HeartPulse, Sword
} from 'lucide-react';
import type { QuestType, QuestCategory } from '@/types';
import { playQuestCompleted, playButtonPress } from '@/lib/audio';

type TabType = QuestType | 'all';

const TABS: { key: TabType; label: string; icon: typeof Sun }[] = [
  { key: 'daily', label: 'Daily', icon: Sun },
  { key: 'main', label: 'Main', icon: Flag },
  { key: 'side', label: 'Side', icon: HelpCircle },
  { key: 'recovery', label: 'Recovery', icon: HeartPulse },
];

const CATEGORY_ICONS: Record<QuestCategory, typeof Zap> = {
  strength: Sword,
  agility: Zap,
  endurance: HeartPulse,
  combat: Shield,
  focus: Sun,
  discipline: ScrollText,
  recovery: HeartPulse,
  mobility: Zap,
  general: HelpCircle,
};

const CATEGORY_COLORS: Record<QuestCategory, string> = {
  strength: '#EF4444',
  agility: '#FBBF24',
  endurance: '#4ADE80',
  combat: '#8B5CF6',
  focus: '#3A8DFF',
  discipline: '#EC4899',
  recovery: '#4FD8FF',
  mobility: '#06B6D4',
  general: '#6B7280',
};

export function QuestsScreen() {
  const { quests, completeQuest } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  const filteredQuests = quests.filter(q => {
    if (activeTab === 'all') return true;
    return q.type === activeTab;
  });

  const activeQuests = filteredQuests.filter(q => q.status === 'active');
  const completedQuests = filteredQuests.filter(q => q.status === 'completed');

  const handleComplete = (questId: string) => {
    playQuestCompleted();
    completeQuest(questId);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <ScrollText size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">Active Quests</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = quests.filter(q => q.type === tab.key && q.status === 'active').length;
          return (
            <button
              key={tab.key}
              onClick={() => { playButtonPress(); setActiveTab(tab.key); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all btn-press ${
                isActive
                  ? 'bg-[#4FD8FF]/15 text-[#4FD8FF] border border-[#4FD8FF]/30'
                  : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/8'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-[#4FD8FF]/20 text-[#4FD8FF]' : 'bg-white/10'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Quests */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {activeQuests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <Check size={32} className="mx-auto text-[#4ADE80] mb-3" />
              <p className="text-sm text-white/50">All {activeTab} quests completed</p>
            </motion.div>
          ) : (
            activeQuests.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={i}
                onComplete={() => handleComplete(quest.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Completed Section */}
      {completedQuests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Completed Today</h3>
          <div className="space-y-2">
            {completedQuests.slice(0, 5).map(quest => (
              <div
                key={quest.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-[#4ADE80]" />
                  <span className="text-sm line-through text-white/40">{quest.name}</span>
                </div>
                <span className="text-xs text-[#4ADE80]">+{quest.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestCard({ quest, index, onComplete }: {
  quest: import('@/types').Quest; index: number; onComplete: () => void;
}) {
  const Icon = CATEGORY_ICONS[quest.category] || HelpCircle;
  const color = CATEGORY_COLORS[quest.category] || '#6B7280';
  const timeLeft = quest.expiresAt ? new Date(quest.expiresAt).getTime() - Date.now() : 0;
  const hoursLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-4 hover:border-white/15 transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={18} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate">{quest.name}</h3>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {quest.category}
            </span>
          </div>
          <p className="text-xs text-white/50 mb-2">{quest.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-[#4FD8FF]">
                <Zap size={12} /> +{quest.xpReward} XP
              </span>
              {hoursLeft > 0 && hoursLeft < 24 && (
                <span className="flex items-center gap-1 text-xs text-[#FBBF24]">
                  <Clock size={12} /> {hoursLeft}h
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-3 py-1.5 bg-[#4FD8FF]/15 hover:bg-[#4FD8FF]/25 text-[#4FD8FF] rounded-lg text-xs font-medium transition-colors border border-[#4FD8FF]/30"
            >
              Complete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
