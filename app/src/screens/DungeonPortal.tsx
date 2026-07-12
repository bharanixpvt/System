import { ArrowLeft, Castle } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { DungeonScreen } from './DungeonScreen';

export function DungeonPortal() {
  const { goBack } = useGameStore();
  return <div><div className="flex items-center justify-between mb-3"><button onClick={goBack} className="text-xs text-white/50 flex gap-1"><ArrowLeft size={15}/> Back</button><span className="system-text text-[#CBD5E1] flex gap-1"><Castle size={14}/> DUNGEON PORTAL</span></div><DungeonScreen /></div>;
}
