import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Coins, Palette, Sparkles, Shirt, LayoutGrid, Check, ShieldCheck, X
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import type { ShopItemCategory, ShopItem } from '@/types';

const CATEGORY_ICONS: Record<ShopItemCategory, typeof Palette> = {
  theme: Palette,
  animation: Sparkles,
  customization: Shirt,
  widget: LayoutGrid,
  title_cosmetic: ShoppingBag,
  utility: ShieldCheck,
};

const CATEGORY_LABELS: Record<ShopItemCategory, string> = {
  theme: 'Themes',
  animation: 'Animations',
  customization: 'Customizations',
  widget: 'Widgets',
  title_cosmetic: 'Cosmetic Titles',
  utility: 'System Utilities',
};

export function ShopScreen() {
  const { profile, shopItems, purchaseItem, inventory } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const categories = ['utility'] as ShopItemCategory[];

const isPurchased = (itemId: string) => {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return false;

  // Utility items can be purchased multiple times.
  if (item.type === 'utility') return false;

  return inventory.some(i => i.id === itemId);
};

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#CBD5E1]" />
          <h1 className="text-lg font-bold">System Shop</h1>
        </div>
        {profile && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/20">
            <Coins size={14} className="text-[#EAB308]" />
            <span className="text-sm font-bold text-[#EAB308]">{profile.coins}</span>
          </div>
        )}
      </div>
      <p className="text-sm text-white/40 mb-4">Spend coins on tools that protect momentum, modify quests, and prepare dungeon runs.</p>

      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category];
        const items = shopItems.filter(i => i.type === category);

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className="text-white/40" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {CATEGORY_LABELS[category]}
              </h2>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => {
                const purchased = isPurchased(item.id);
                const canAfford = (profile?.coins || 0) >= item.cost;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card p-3.5 flex items-center justify-between ${
                      purchased ? 'opacity-50' : 'hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon size={18} className="text-[#CBD5E1]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-white/40">{item.description}</p>
                        {item.effect && <p className="text-[10px] text-[#CBD5E1]/70 mt-1">{item.effect}</p>}
                      </div>
                    </div>

                    {purchased ? (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80]">
                        <Check size={14} /> Owned
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          playButtonPress();
                          setSelectedItem(item);
                          setPurchaseSuccess(false);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press ${
                          canAfford
                            ? 'bg-[#EAB308]/15 hover:bg-[#EAB308]/25 text-[#EAB308] border border-[#EAB308]/30'
                            : 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <Coins size={12} />
                        {item.cost}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Purchase Modal Popup */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-card border-[#CBD5E1]/20 p-5 space-y-4 relative overflow-hidden"
            >
              {/* Decorative Header Bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CBD5E1]/60 to-transparent" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#CBD5E1] bg-[#CBD5E1]/10 px-2 py-0.5 rounded">
                  System Shop
                </span>
                <button
                  onClick={() => {
                    playButtonPress();
                    setSelectedItem(null);
                  }}
                  className="p-1 rounded bg-white/5 text-white/50 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {!purchaseSuccess ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-white uppercase tracking-wide">
                      Confirm Purchase
                    </h2>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-sm font-semibold text-white">{selectedItem.name}</p>
                      <p className="text-xs text-white/50 mt-1">{selectedItem.description}</p>
                      {selectedItem.effect && (
                        <p className="text-[10px] text-[#CBD5E1] mt-1.5 font-medium">
                          Effect: {selectedItem.effect}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm py-1 border-y border-white/5">
                    <span className="text-white/50">Cost:</span>
                    <div className="flex items-center gap-1 font-bold text-[#EAB308]">
                      <Coins size={14} />
                      <span>{selectedItem.cost} Coins</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Your Balance:</span>
                    <div className="flex items-center gap-1 font-bold text-white">
                      <Coins size={14} className="text-white/40" />
                      <span>{profile?.coins || 0} Coins</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        playButtonPress();
                        setSelectedItem(null);
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all btn-press"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={(profile?.coins || 0) < selectedItem.cost}
                      onClick={() => {
                        playButtonPress();
                        purchaseItem(selectedItem.id);
                        setPurchaseSuccess(true);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all btn-press ${
                        (profile?.coins || 0) >= selectedItem.cost
                          ? 'bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                          : 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      {(profile?.coins || 0) >= selectedItem.cost ? 'Confirm Buy' : 'Insufficient Coins'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-4 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 flex items-center justify-center mx-auto text-[#4ADE80] mb-2 animate-pulse">
                      <Check size={24} />
                    </div>
                    <h2 className="text-base font-bold text-white tracking-wide uppercase">
                      Acquisition Complete
                    </h2>
                    <p className="text-xs text-white/50">
                      Successfully purchased <span className="text-white font-semibold">{selectedItem.name}</span>.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white/50">Quantity Owned:</span>
                      <span className="font-semibold text-[#CBD5E1]">
                        {inventory.find(i => i.id === selectedItem.id)?.quantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Remaining Coins:</span>
                      <span className="font-semibold text-[#EAB308]">{profile?.coins || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        playButtonPress();
                        setSelectedItem(null);
                        setPurchaseSuccess(false);
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-all btn-press"
                    >
                      Close Shop Menu
                    </button>
                    <button
                      disabled={(profile?.coins || 0) < selectedItem.cost}
                      onClick={() => {
                        playButtonPress();
                        setPurchaseSuccess(false);
                      }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all btn-press ${
                        (profile?.coins || 0) >= selectedItem.cost
                          ? 'bg-[#EAB308] hover:bg-[#EAB308]/90 text-black font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                          : 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      {(profile?.coins || 0) >= selectedItem.cost ? 'Buy Another' : 'Insufficient Coins'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}