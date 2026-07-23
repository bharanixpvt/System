import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Backpack, Award, Sparkles, Gem, Check, Lock, ShoppingBag
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import type { AchievementTier } from '@/types';

type InvTab = 'titles' | 'items' | 'achievements';

const TABS: { key: InvTab; label: string; icon: typeof Award }[] = [
  { key: 'titles', label: 'Titles', icon: Award },
  { key: 'items', label: 'Utilities', icon: Backpack },
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
  const { titles, inventory, achievements, equipTitle, equipItem, navigateTo, activateUtility } = useGameStore();
  const [activeTab, setActiveTab] = useState<InvTab>('titles');
  const [selectedTierFilter, setSelectedTierFilter] = useState<AchievementTier | 'all'>('all');

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center gap-2"><Backpack size={18} className="text-[#CBD5E1]" /><h1 className="text-lg font-bold">Inventory</h1></div>
        <button onClick={() => navigateTo('shop')} className="flex items-center gap-1.5 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/20 px-3 py-2 text-xs font-medium text-[#EAB308]"><ShoppingBag size={14}/> Shop</button>
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
                  ? 'bg-[#CBD5E1]/15 text-[#CBD5E1] border border-[#CBD5E1]/30'
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
      {/* Content */}
      {activeTab === 'titles' && (
        <div className="space-y-4">
          {/* Titles Ladder Progress */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <p className="text-[10px] uppercase font-bold text-[#CBD5E1] tracking-widest">Titles Unlock Ladder</p>
            <div className="flex gap-2 overflow-x-auto pb-1 text-[10px]">
              {(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary', 'mythic'] as AchievementTier[]).map(t => {
                const total = titles.filter(x => x.tier === t).length;
                const unlocked = titles.filter(x => x.tier === t && x.unlocked).length;
                return (
                  <button
                    key={t}
                    onClick={() => { playButtonPress(); setSelectedTierFilter(selectedTierFilter === t ? 'all' : t); }}
                    className={`px-2 py-1 rounded shrink-0 border capitalize font-semibold transition-all ${
                      selectedTierFilter === t
                        ? 'bg-white/15 text-white border-white/30'
                        : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10'
                    }`}
                    style={{ borderColor: selectedTierFilter === t ? TIER_COLORS[t] : undefined }}
                  >
                    <span style={{ color: TIER_COLORS[t] }}>●</span> {t}: {unlocked}/{total}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {titles
              .filter(title => selectedTierFilter === 'all' || title.tier === selectedTierFilter)
              .map((title, i) => (
                <motion.div
                  key={title.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => title.unlocked && equipTitle(title.id)}
                  className={`glass-card p-3.5 flex items-center justify-between transition-all ${
                    title.unlocked ? 'cursor-pointer hover:border-white/15' : 'opacity-40'
                  } ${title.equipped ? 'border-[#CBD5E1]/30' : ''}`}
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
                        <p className="text-[10px] text-[#CBD5E1]/60 mt-0.5">{title.bonus}</p>
                      )}
                    </div>
                  </div>
                  {title.equipped && (
                    <span className="flex items-center gap-1 text-[10px] text-[#CBD5E1]">
                      <Check size={12} /> Equipped
                    </span>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Backpack size={32} className="mx-auto text-white/20 mb-3" />
              <p className="text-sm text-white/40">No items in inventory. Purchase utility aids or beacon keys in the System Shop.</p>
              <button onClick={() => navigateTo('shop')} className="mt-3 text-xs text-[#CBD5E1]">Open Shop</button>
            </div>
          ) : (
            inventory.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => item.type === 'utility' ? activateUtility(item.id) : equipItem(item.id)}
                className={`glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-white/15 transition-all ${
                  item.equipped ? 'border-[#CBD5E1]/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Sparkles size={18} className="text-[#CBD5E1]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                    {item.type === 'utility' && <p className="text-[10px] text-[#CBD5E1]/70 mt-1">Tap to activate · {item.quantity || 0} available</p>}
                  </div>
                </div>
                {item.equipped && (
                  <span className="text-[10px] text-[#CBD5E1]">Equipped</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {/* Achievements Ladder Progress */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <p className="text-[10px] uppercase font-bold text-[#CBD5E1] tracking-widest">Achievements Progression Ladder</p>
            <div className="flex gap-2 overflow-x-auto pb-1 text-[10px]">
              {(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary', 'mythic'] as AchievementTier[]).map(t => {
                const total = achievements.filter(x => x.tier === t).length;
                const unlocked = achievements.filter(x => x.tier === t && x.unlocked).length;
                return (
                  <button
                    key={t}
                    onClick={() => { playButtonPress(); setSelectedTierFilter(selectedTierFilter === t ? 'all' : t); }}
                    className={`px-2 py-1 rounded shrink-0 border capitalize font-semibold transition-all ${
                      selectedTierFilter === t
                        ? 'bg-white/15 text-white border-white/30'
                        : 'bg-white/5 text-white/50 border-transparent hover:bg-white/10'
                    }`}
                    style={{ borderColor: selectedTierFilter === t ? TIER_COLORS[t] : undefined }}
                  >
                    <span style={{ color: TIER_COLORS[t] }}>●</span> {t}: {unlocked}/{total}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            {achievements
              .filter(ach => selectedTierFilter === 'all' || ach.tier === selectedTierFilter)
              .map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
                  className={`glass-card p-3.5 transition-all duration-300 ${
                    ach.unlocked
                      ? 'hover:border-[#CBD5E1]/20 hover:shadow-lg hover:shadow-[#CBD5E1]/5'
                      : 'opacity-55'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <AnimatedAchievementBadge unlocked={ach.unlocked} tier={ach.tier} hidden={ach.hidden} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${ach.unlocked ? 'text-white' : 'text-white/40'}`}>
                          {ach.hidden && !ach.unlocked ? '???' : ach.name}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0"
                          style={{ backgroundColor: `${TIER_COLORS[ach.tier]}20`, color: TIER_COLORS[ach.tier] }}
                        >
                          {ach.tier}
                        </span>
                      </div>
                      <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                        {ach.hidden && !ach.unlocked ? 'Complete secret requirements to unlock' : ach.description}
                      </p>
                      {ach.unlocked && ach.unlockedAt && (
                        <p className="text-[10px] text-[#4ADE80] mt-1 font-medium">
                          ✓ Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Animated iOS Premium Badge Component
// ============================================================
function AnimatedAchievementBadge({ unlocked, tier, hidden: _hidden }: { unlocked: boolean; tier: AchievementTier; hidden: boolean }) {
  const tierColor = TIER_COLORS[tier] || '#ffffff';

  if (!unlocked) {
    return (
      <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center relative overflow-hidden shrink-0">
        <Lock size={15} className="text-white/20" />
        <div className="absolute inset-0 bg-black/25" />
      </div>
    );
  }

  return (
    <motion.div
      className="w-11 h-11 rounded-xl flex items-center justify-center relative overflow-hidden animate-sheen cursor-pointer select-none shrink-0"
      style={{
        background: `radial-gradient(circle at center, ${tierColor}25 0%, ${tierColor}04 70%)`,
        border: `1px solid ${tierColor}45`,
        boxShadow: `0 0 12px ${tierColor}15, inset 0 0 6px ${tierColor}08`,
      }}
      whileHover={{
        scale: 1.12,
        rotate: 8,
        boxShadow: `0 0 20px ${tierColor}35, inset 0 0 10px ${tierColor}15`,
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        y: {
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        type: 'spring',
        stiffness: 300,
        damping: 18,
      }}
    >
      {/* Glossy overlay sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none" />

      {/* Pulsing inner particle */}
      <motion.div
        className="absolute w-2 h-2 rounded-full blur-[1px]"
        style={{ backgroundColor: tierColor }}
        animate={{
          scale: [1, 2.2, 1],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Gem size={18} className="relative z-10 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" style={{ color: tierColor }} />
    </motion.div>
  );
}
