// ============================================================
// SYSTEM v3 — SYSTEM Repository & Upskills Module
// Unlock system capabilities, hidden attributes & hidden quests
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Sparkles, Check, X, Cpu, ShieldCheck
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import { DEFAULT_UPSKILLS } from '@/engine/gameEngine';
import type { Upskill } from '@/types';

export function ShopScreen() {
  const { profile, shopItems, purchaseUpskill } = useGameStore();
  const [selectedUpskill, setSelectedUpskill] = useState<Upskill | null>(null);
  const [activeTab, setActiveTab] = useState<'upskills' | 'utilities'>('upskills');

  if (!profile) return null;

  const handleBuyUpskill = async (upskill: Upskill) => {
    await purchaseUpskill(upskill.id);
    setSelectedUpskill(null);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-[#CBD5E1] animate-pulse" />
          <h1 className="text-lg font-bold">SYSTEM Repository</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/20">
          <Coins size={14} className="text-[#EAB308]" />
          <span className="text-sm font-bold text-[#EAB308]">{profile.coins}</span>
        </div>
      </div>
      <p className="text-sm text-white/40 mb-3">
        Synchronize new SYSTEM capabilities. Upskills never grant artificial stat boosts — they unlock new statistics, hidden quests, and operational parameters.
      </p>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setActiveTab('upskills')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upskills'
              ? 'bg-[#CBD5E1]/20 border border-[#CBD5E1]/40 text-white'
              : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
          }`}
        >
          <Sparkles size={14} className="inline mr-1.5" /> Upskill Modules ({DEFAULT_UPSKILLS.length})
        </button>
        <button
          onClick={() => setActiveTab('utilities')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'utilities'
              ? 'bg-[#CBD5E1]/20 border border-[#CBD5E1]/40 text-white'
              : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
          }`}
        >
          <ShieldCheck size={14} className="inline mr-1.5" /> Utilities
        </button>
      </div>

      {activeTab === 'upskills' && (
        <div className="space-y-3">
          {DEFAULT_UPSKILLS.map((upskill, i) => {
            const isUnlocked = profile.unlockedUpskills?.includes(upskill.id);
            const canAfford = profile.coins >= upskill.cost;

            return (
              <motion.div
                key={upskill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-4 flex flex-col justify-between border ${
                  isUnlocked ? 'border-purple-500/30 bg-purple-950/10' : 'hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Sparkles size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{upskill.name}</h3>
                      {isUnlocked && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          SYNCHRONIZED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{upskill.description}</p>
                    <div className="text-[10px] text-[#CBD5E1] mt-2 font-mono">
                      ⚡ Unlocks: {upskill.unlocksQuestsDescription}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="text-[11px] text-white/40">
                    Unlocks Attribute: <span className="text-white/70 font-semibold">{upskill.unlocksStats.join(', ')}</span>
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-xs text-[#4ADE80] font-bold">
                      <Check size={14} /> Active
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        playButtonPress();
                        setSelectedUpskill(upskill);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all btn-press ${
                        canAfford
                          ? 'bg-[#EAB308]/20 hover:bg-[#EAB308]/30 text-[#EAB308] border border-[#EAB308]/40'
                          : 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <Coins size={13} />
                      {upskill.cost} Coins
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === 'utilities' && (
        <div className="space-y-2">
          {shopItems.map((item, i) => {
            const canAfford = profile.coins >= item.cost;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-3.5 flex items-center justify-between hover:border-white/15"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#CBD5E1]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-white/40">{item.description}</p>
                  </div>
                </div>

                <button
                  disabled={!canAfford}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    canAfford
                      ? 'bg-[#EAB308]/15 hover:bg-[#EAB308]/25 text-[#EAB308] border border-[#EAB308]/30'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Coins size={12} />
                  {item.cost}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upskill Purchase Modal */}
      <AnimatePresence>
        {selectedUpskill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-card border-purple-500/40 p-5 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  SYSTEM UPSKILL SYNCHRONIZATION
                </span>
                <button onClick={() => setSelectedUpskill(null)} className="text-white/40 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{selectedUpskill.name}</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-3">{selectedUpskill.description}</p>
                <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-500/20 text-xs text-purple-200">
                  ⚡ Unlocks Attribute: <span className="font-bold">{selectedUpskill.unlocksStats.join(', ')}</span>
                  <br />
                  ⚡ Unlocks Quests: {selectedUpskill.unlocksQuestsDescription}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-yellow-400">
                  <Coins size={16} />
                  <span>{selectedUpskill.cost} Coins</span>
                </div>

                <button
                  onClick={() => handleBuyUpskill(selectedUpskill)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 btn-press"
                >
                  Synchronize Upskill
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}