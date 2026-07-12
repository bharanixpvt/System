import { X, Crown } from 'lucide-react';
import { RANK_ORDER, RANK_LEVEL_RANGES } from '@/types';

const RANK_PERKS: Record<string, string> = {
  'E Rank': 'Daily Quest Access & Basic Store Unlock',
  'D Rank': 'Fatigue Mitigation (+5 max fatigue limit)',
  'C Rank': 'Combat Training Access & Standard Dungeons',
  'B Rank': 'Extra Attribute Points (+1 AP per level up)',
  'A Rank': 'Fatigue Recovery (+10% sleep quality recovery bonus)',
  'S Rank': 'Elite Dungeon Portals & Unique Titles',
  'SS Rank': 'Double Dungeon Coin Yield',
  'SSS Rank': 'Fatigue Limit Extended to 110',
  'National Level': 'All active daily quest XP boosted by 15%',
  'Monarch Level': 'Free weekly Boss Beacon in shop',
  'Shadow Monarch': 'Fatigue recovery doubled & Monarch Command active (unlimited premium features)',
};

export function RankingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <section className="glass-card w-full max-w-md max-h-[80vh] overflow-auto p-5 border-[#CBD5E1]/25">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="system-text text-[#CBD5E1]">RANK LADDER</p>
            <h2 className="text-lg font-bold">Requirements & perks</h2>
          </div>
          <button onClick={onClose}>
            <X className="text-white/50" />
          </button>
        </div>
        <div className="space-y-2">
          {RANK_ORDER.map((rank) => {
            const data = RANK_LEVEL_RANGES[rank];
            const perk = RANK_PERKS[rank] || 'Standard System benefits';
            return (
              <div key={rank} className="flex gap-3 p-3 rounded-lg bg-white/[.035] border border-white/5">
                <Crown size={18} style={{ color: data.color }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: data.color }}>{rank}</p>
                  <p className="text-xs text-white/45">Level {data.min}–{data.max} · Complete your rank evaluation</p>
                  <p className="text-[11px] text-[#CBD5E1]/70 mt-1">Perk: {perk}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
