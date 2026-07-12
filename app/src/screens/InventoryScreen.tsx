import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Backpack, Award, Shirt, Sparkles, Gem, Check
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import type { AchievementTier } from '@/types';

type InvTab = 'titles' | 'items' | 'achievements';

const TABS: { key: InvTab; label: string; icon: typeof Award }[] = [
  { key: 'titles', label: 'Titles', icon: Award },
  { key: 'items', label: 'Items', icon: Shirt },
  { key: 'achievements', label: 'Achievements', icon: Gem },
];

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
  legendary: '#ff6b35',
  mythic: '#ff00ff',
};

export function InventoryScreen() {
  const { titles, inventory, achievements, equipTitle, equipItem } = useGameStore();
  const [activeTab, setActiveTab] = useState<InvTab>('titles');

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Backpack size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">Inventory</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { playButtonPress(); setActiveTab(tab.key); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#4FD8FF]/15 text-[#4FD8FF] border border-[#4FD8FF]/30'
                  : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/8'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'titles' && (
        <div className="space-y-2">
          {titles.map((title, i) => (
            <motion.div
              key={title.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => title.unlocked && equipTitle(title.id)}
              className={`glass-card p-3.5 flex items-center justify-between transition-all ${
                title.unlocked ? 'cursor-pointer hover:border-white/15' : 'opacity-40'
              } ${title.equipped ? 'border-[#4FD8FF]/30' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: title.unlocked ? `${TIER_COLORS[title.tier]}15` : 'rgba(255,255,255,0.03)' }}
                >
                  <Award size={18} style={{ color: title.unlocked ? TIER_COLORS[title.tier] : 'rgba(255,255,255,0.2)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${!title.unlocked ? 'text-white/30' : ''}`}>{title.name}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                      style={{ backgroundColor: `${TIER_COLORS[title.tier]}20`, color: TIER_COLORS[title.tier] }}
                    >
                      {title.tier}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{title.unlocked ? title.description : '???'}</p>
                  {title.unlocked && (
                    <p className="text-[10px] text-[#4FD8FF]/60 mt-0.5">{title.bonus}</p>
                  )}
                </div>
              </div>
              {title.equipped && (
                <span className="flex items-center gap-1 text-[10px] text-[#4FD8FF]">
                  <Check size={12} /> Equipped
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Shirt size={32} className="mx-auto text-white/20 mb-3" />
              <p className="text-sm text-white/40">No items yet. Visit the Shop.</p>
            </div>
          ) : (
            inventory.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => equipItem(item.id)}
                className={`glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15 transition-all ${
                  item.equipped ? 'border-[#4FD8FF]/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Sparkles size={18} className="text-[#4FD8FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                  </div>
                </div>
                {item.equipped && (
                  <span className="text-[10px] text-[#4FD8FF]">Equipped</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-2">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-3.5 ${!ach.unlocked && ach.hidden ? 'opacity-30' : ach.unlocked ? '' : 'opacity-50'}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: ach.unlocked ? `${TIER_COLORS[ach.tier]}15` : 'rgba(255,255,255,0.03)' }}
                >
                  <Gem size={18} style={{ color: ach.unlocked ? TIER_COLORS[ach.tier] : 'rgba(255,255,255,0.2)' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ach.hidden && !ach.unlocked ? '???' : ach.name}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                      style={{ backgroundColor: `${TIER_COLORS[ach.tier]}20`, color: TIER_COLORS[ach.tier] }}
                    >
                      {ach.tier}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    {ach.hidden && !ach.unlocked ? 'Hidden achievement' : ach.description}
                  </p>
                  {ach.unlocked && ach.unlockedAt && (
                    <p className="text-[10px] text-[#4ADE80] mt-0.5">
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
