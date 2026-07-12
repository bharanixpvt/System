import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  ScrollText,
  Backpack,
  Settings,
} from 'lucide-react';
import type { ScreenName } from '@/types';

const navItems: { screen: ScreenName; icon: typeof LayoutDashboard; label: string }[] = [
  { screen: 'dashboard', icon: LayoutDashboard, label: 'Status' },
  { screen: 'stats', icon: BarChart3, label: 'Stats' },
  { screen: 'quests', icon: ScrollText, label: 'Quests' },
  { screen: 'inventory', icon: Backpack, label: 'Inventory' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentScreen, navigateTo } = useGameStore();

  return (
    <div className="flex flex-col min-h-screen bg-[#050608]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#CBD5E1] animate-pulse" />
            <span className="system-text text-[#CBD5E1]">SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-3">
            <XPIndicator />
            <button onClick={() => navigateTo('settings')} aria-label="Open settings" className="p-1.5 rounded-lg text-white/45 hover:text-[#CBD5E1] hover:bg-white/5"><Settings size={18} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 px-4 pt-4 max-w-lg mx-auto w-full overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/5">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => navigateTo(item.screen)}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all duration-200 btn-press ${
                  isActive ? 'nav-active' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-[#CBD5E1]' : ''}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function XPIndicator() {
  const { profile } = useGameStore();
  if (!profile) return null;

  const xpPercent = (profile.totalXP / profile.xpToNextLevel) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="text-right hidden sm:block">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">Level {profile.totalLevel}</div>
        <div className="w-20 h-1 bg-white/10 rounded-full mt-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#CBD5E1] to-[#64748B] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, xpPercent)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-gradient-cyan">Lv.{profile.totalLevel}</span>
      </div>
    </div>
  );
}
