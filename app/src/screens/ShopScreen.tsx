import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Coins, Palette, Sparkles, Shirt, LayoutGrid, Check, ShieldCheck
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import type { ShopItemCategory } from '@/types';

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
  const { profile, shopItems, purchaseItem } = useGameStore();

  const categories = ['utility'] as ShopItemCategory[];


  const isPurchased = (_itemId: string) => false;
  const isPurchased = (itemId: string) => {
  return inventory.some(item => item.id === itemId);
};

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#4FD8FF]" />
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
                        <Icon size={18} className="text-[#4FD8FF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-white/40">{item.description}</p>{item.effect && <p className="text-[10px] text-[#4FD8FF]/70 mt-1">{item.effect}</p>}
                      </div>
                    </div>

                    {purchased ? (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80]">
                        <Check size={14} /> Owned
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            playButtonPress();
                            purchaseItem(item.id);
                          }
                        }}
                        disabled={!canAfford}
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
    </div>
  );
}
