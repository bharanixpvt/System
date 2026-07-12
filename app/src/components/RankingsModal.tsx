import { X, Crown } from 'lucide-react';
import { RANK_ORDER, RANK_LEVEL_RANGES } from '@/types';

export function RankingsModal({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
    <section className="glass-card w-full max-w-md max-h-[80vh] overflow-auto p-5 border-[#4FD8FF]/25">
      <div className="flex justify-between items-center mb-4"><div><p className="system-text text-[#4FD8FF]">RANK LADDER</p><h2 className="text-lg font-bold">Requirements & perks</h2></div><button onClick={onClose}><X className="text-white/50" /></button></div>
      <div className="space-y-2">{RANK_ORDER.map((rank, i) => { const data = RANK_LEVEL_RANGES[rank]; return <div key={rank} className="flex gap-3 p-3 rounded-lg bg-white/[.035] border border-white/5"><Crown size={18} style={{ color: data.color }} /><div><p className="text-sm font-semibold" style={{ color: data.color }}>{rank}</p><p className="text-xs text-white/45">Level {data.min}–{data.max} · Complete your rank evaluation</p><p className="text-[11px] text-[#4FD8FF]/70 mt-1">Perk: {i < 3 ? 'New training tiers' : i < 6 ? 'Higher dungeon rewards' : 'Elite challenge access'}</p></div></div> })}</div>
    </section>
  </div>;
}
