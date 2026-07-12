import { Shield, X } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

export function CombatTrainingPrompt() {
  const { profile, setCombatTrainingStatus } = useGameStore();
  if (!profile || profile.combatTrainingStatus === 'accepted') return null;
  const isReady = profile.totalLevel >= 5 && (!profile.combatPromptAfter || new Date(profile.combatPromptAfter) <= new Date());
  if (!isReady) return null;
  return <div className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5"><section className="glass-card max-w-sm p-6 border-[#8B5CF6]/40"><div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center"><Shield className="text-[#A78BFA]"/></div><p className="system-text text-[#A78BFA] mt-4">OPTIONAL PATH UNLOCKED</p><h2 className="text-lg font-bold mt-1">Ready for defensive training?</h2><p className="text-sm text-white/55 mt-3">You’ve established a body-conditioning foundation. Combat training remains optional and focused on awareness, safety, and controlled movement.</p><div className="grid grid-cols-1 gap-2 mt-5"><button onClick={() => setCombatTrainingStatus('accepted')} className="py-2.5 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 text-[#C4B5FD] text-sm">Accept and unlock</button><button onClick={() => setCombatTrainingStatus('held')} className="py-2.5 rounded-xl bg-white/5 text-white/65 text-sm">Keep on hold</button><button onClick={() => setCombatTrainingStatus('declined')} className="py-2.5 text-white/40 text-xs flex justify-center gap-1"><X size={14}/> Not now — ask next week</button></div></section></div>;
}
