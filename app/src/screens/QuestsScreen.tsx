// ============================================================
// SYSTEM v3 — Dynamic Quest Engine Screen
// System Quest Deletion (50 Coins), Voluntary XP Reduction, Upskills
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, Check, Zap, Shield,
  Sun, Flag, HelpCircle, HeartPulse, Sword, Plus, Trash2, RotateCcw, AlertTriangle, Sparkles, Coins, Minus
} from 'lucide-react';
import type { QuestType, QuestCategory, Quest } from '@/types';
import { playQuestCompleted, playButtonPress } from '@/lib/audio';
import { QuestEditor } from '@/components/QuestEditor';

type TabType = QuestType | 'all' | 'hidden';

const TABS: { key: TabType; label: string; icon: typeof Sun }[] = [
  { key: 'daily', label: 'Daily', icon: Sun },
  { key: 'hidden', label: 'Hidden Upskills', icon: Sparkles },
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
  reaction: Zap,
  balance: Shield,
  coordination: Zap,
  nutrition: HeartPulse,
  general: HelpCircle,
};

const CATEGORY_COLORS: Record<QuestCategory, string> = {
  strength: '#EF4444',
  agility: '#FBBF24',
  endurance: '#4ADE80',
  combat: '#8B5CF6',
  focus: '#64748B',
  discipline: '#EC4899',
  recovery: '#CBD5E1',
  mobility: '#06B6D4',
  reaction: '#F97316',
  balance: '#10B981',
  coordination: '#8B5CF6',
  nutrition: '#3B82F6',
  general: '#6B7280',
};

export function QuestsScreen() {
  const { quests, completeQuest, undoCompleteQuest, deleteCustomQuest, deleteSystemQuest, reduceQuestXP, profile, inventory, useQuestUtility } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [editing, setEditing] = useState<Quest | undefined>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingSystemQuest, setDeletingSystemQuest] = useState<Quest | null>(null);
  const [reducingXPQuest, setReducingXPQuest] = useState<Quest | null>(null);

  const filteredQuests = quests.filter(q => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hidden') return q.type === 'hidden';
    if (activeTab === 'recovery') return q.category === 'recovery';
    return q.type === activeTab;
  });

  const activeQuests = filteredQuests.filter(q => q.status === 'active');
  const completedQuests = filteredQuests.filter(q => q.status === 'completed');

  const handleComplete = (questId: string) => {
    playQuestCompleted();
    completeQuest(questId);
  };

  const handleConfirmDeleteSystemQuest = async () => {
    if (!deletingSystemQuest) return;
    await deleteSystemQuest(deletingSystemQuest.id);
    setDeletingSystemQuest(null);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ScrollText size={18} className="text-[#CBD5E1]" />
          <h1 className="text-lg font-bold">Dynamic Quest Engine</h1>
        </div>
        <button onClick={() => { setEditing(undefined); setEditorOpen(true); }} className="p-2 rounded-lg bg-[#CBD5E1]/10 text-[#CBD5E1] hover:bg-[#CBD5E1]/20">
          <Plus size={17}/>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = quests.filter(q => (tab.key === 'hidden' ? q.type === 'hidden' : q.type === tab.key) && q.status === 'active').length;
          return (
            <button
              key={tab.key}
              onClick={() => { playButtonPress(); setActiveTab(tab.key); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all btn-press ${
                isActive
                  ? 'bg-[#CBD5E1]/15 text-[#CBD5E1] border border-[#CBD5E1]/30'
                  : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/8'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-[#CBD5E1]/20 text-[#CBD5E1]' : 'bg-white/10'
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
              <p className="text-sm text-white/50">All {activeTab} quests completed or cleared</p>
            </motion.div>
          ) : (
            activeQuests.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                index={i}
                onComplete={() => handleComplete(quest.id)}
                onDeleteCustom={() => deleteCustomQuest(quest.id)}
                onDeleteSystem={() => setDeletingSystemQuest(quest)}
                onReduceXP={() => setReducingXPQuest(quest)}
                utility={inventory.find(item => (item.quantity || 0) > 0 && ((item.id === 'day-pass' && ['daily','side'].includes(quest.type))))}
                onUseUtility={(itemId) => useQuestUtility(quest.id, itemId)}
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
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#4ADE80]">+{quest.xpReward} XP</span>
                  <button
                    onClick={() => {
                      playButtonPress();
                      undoCompleteQuest(quest.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] text-[10px] font-medium transition-all"
                  >
                    <RotateCcw size={10} />
                    <span>Undo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editorOpen && <QuestEditor quest={editing} onClose={() => setEditorOpen(false)} />}

      {/* Delete System Quest Modal (50 Coins) */}
      <AnimatePresence>
        {deletingSystemQuest && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full border-red-500/30"
            >
              <div className="flex items-center gap-3 text-red-400 mb-2">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-white">Delete SYSTEM Quest?</h3>
              </div>
              <p className="text-xs text-white/60 mb-3 leading-relaxed">
                Permanently remove "{deletingSystemQuest.name}". Deleting a SYSTEM quest costs <span className="text-yellow-400 font-bold">50 Coins</span>. Deleted SYSTEM quests will not return automatically today.
              </p>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-4 text-xs font-mono">
                <span className="text-white/50">Your Coins: {profile?.coins || 0}</span>
                <span className="text-yellow-400 font-bold">Cost: 50 Coins</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeletingSystemQuest(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteSystemQuest}
                  className="flex-1 py-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold hover:bg-red-600/50"
                >
                  Pay 50 Coins & Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voluntarily Reduce XP Modal */}
      <AnimatePresence>
        {reducingXPQuest && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full border-yellow-500/30"
            >
              <div className="flex items-center gap-3 text-yellow-400 mb-2">
                <Minus size={24} />
                <h3 className="text-lg font-bold text-white">Voluntarily Reduce XP</h3>
              </div>
              <p className="text-xs text-white/60 mb-3 leading-relaxed">
                You may voluntarily lower the XP reward for "{reducingXPQuest.name}" to slow down your progression. XP cannot be increased.
              </p>
              <div className="mb-4">
                <label className="text-xs text-white/50 block mb-1">New XP Value (Max: {reducingXPQuest.xpReward})</label>
                <input
                  type="number"
                  min={1}
                  max={reducingXPQuest.xpReward}
                  defaultValue={Math.max(1, Math.floor(reducingXPQuest.xpReward * 0.75))}
                  id="new-xp-input"
                  className="w-full bg-white/5 border border-white/20 rounded-xl p-2.5 text-sm text-white focus:border-yellow-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setReducingXPQuest(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/70 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const el = document.getElementById('new-xp-input') as HTMLInputElement;
                    if (el) {
                      await reduceQuestXP(reducingXPQuest.id, Number(el.value));
                    }
                    setReducingXPQuest(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-bold"
                >
                  Apply Reduced XP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestCard({ quest, index, onComplete, onDeleteCustom, onDeleteSystem, onReduceXP, utility, onUseUtility }: {
  quest: Quest;
  index: number;
  onComplete: () => void;
  onDeleteCustom: () => void;
  onDeleteSystem: () => void;
  onReduceXP: () => void;
  utility?: import('@/types').InventoryItem;
  onUseUtility: (itemId: string) => void;
}) {
  const Icon = CATEGORY_ICONS[quest.category] || HelpCircle;
  const color = CATEGORY_COLORS[quest.category] || '#6B7280';
  const isHidden = quest.type === 'hidden';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={`glass-card p-4 transition-all ${
        isHidden ? 'border-purple-500/40 bg-purple-950/10' : 'hover:border-white/15'
      }`}
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
            {isHidden && (
              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Hidden Upskill
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mb-2">{quest.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-[#CBD5E1]">
                <Zap size={12} /> +{quest.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Coins size={12} /> +{quest.coinReward}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {utility && (
                <button onClick={() => onUseUtility(utility.id)} className="px-2 py-1 rounded bg-[#EAB308]/10 text-[#EAB308] text-[10px]">
                  Use {utility.name}
                </button>
              )}

              {/* Reduce XP action */}
              {quest.canReduceXP && (
                <button
                  onClick={onReduceXP}
                  title="Reduce XP (Voluntary)"
                  className="p-1 rounded bg-white/5 text-white/40 hover:text-yellow-400 text-[10px]"
                >
                  <Minus size={13} />
                </button>
              )}

              {/* Custom Quest Delete */}
              {quest.isCustom && (
                <button onClick={onDeleteCustom} className="p-1 text-[#EF4444] hover:bg-red-500/10 rounded">
                  <Trash2 size={14} />
                </button>
              )}

              {/* System Quest Delete (Costs 50 Coins) */}
              {quest.isSystemQuest && (
                <button
                  onClick={onDeleteSystem}
                  title="Delete SYSTEM Quest (50 Coins)"
                  className="px-2 py-1 rounded bg-red-950/40 border border-red-500/30 text-red-300 text-[10px] flex items-center gap-1"
                >
                  <Trash2 size={11} /> 50c
                </button>
              )}

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-3 py-1.5 bg-[#CBD5E1]/15 hover:bg-[#CBD5E1]/25 text-[#CBD5E1] rounded-lg text-xs font-medium border border-[#CBD5E1]/30"
              >
                Complete
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
