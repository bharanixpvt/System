import { useEffect, useState } from 'react';
import { Castle, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

export function BossDungeonAlert() {
  const { activeBossDungeon, dismissBossDungeon, navigateTo, summonBossDungeon, settings } = useGameStore();
  const [, tick] = useState(0);
  useEffect(() => {
    if (!settings?.onboardingComplete) return;
    const id = window.setInterval(() => tick(n => n + 1), 1000);
    const invite = window.setTimeout(() => { if (Math.random() > .35) summonBossDungeon(); }, 45000);
    return () => { clearInterval(id); clearTimeout(invite); };
  }, [summonBossDungeon, settings?.onboardingComplete]);
  if (!settings?.onboardingComplete || !activeBossDungeon) return null;
  const seconds = Math.max(0, Math.ceil((new Date(activeBossDungeon.expiresAt).getTime() - Date.now()) / 1000));
  if (!seconds) { dismissBossDungeon(); return null; }
  return <div className="fixed inset-x-4 bottom-24 z-[65] max-w-lg mx-auto glass-card border-[#EF4444]/40 p-4 shadow-xl"><div className="flex gap-3"><Castle className="text-[#EF4444] shrink-0"/><div className="flex-1"><p className="system-text text-[#EF4444]">BOSS DUNGEON DETECTED</p><p className="font-semibold">{activeBossDungeon.name}</p><p className="text-xs text-white/55 mt-1">{activeBossDungeon.description}</p><button onClick={() => { navigateTo('dungeon'); dismissBossDungeon(); }} className="mt-3 text-xs text-[#CBD5E1]">Enter portal · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</button></div><button onClick={dismissBossDungeon}><X size={18} className="text-white/45"/></button></div></div>;
}
