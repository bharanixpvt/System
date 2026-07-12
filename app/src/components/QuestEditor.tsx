import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { Quest, QuestCategory } from '@/types';

const categories: QuestCategory[] = ['strength', 'agility', 'endurance', 'focus', 'mobility', 'discipline', 'recovery', 'general'];
export function QuestEditor({ quest, onClose }: { quest?: Quest; onClose: () => void }) {
  const { saveCustomQuest } = useGameStore();
  const [name, setName] = useState(quest?.name || ''); const [description, setDescription] = useState(quest?.description || ''); const [category, setCategory] = useState<QuestCategory>(quest?.category || 'general');
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return; await saveCustomQuest({ ...quest, name, description, category }); onClose(); };
  return <div className="fixed inset-0 z-[70] bg-black/75 flex items-end sm:items-center justify-center p-4"><form onSubmit={submit} className="glass-card w-full max-w-md p-5"><div className="flex justify-between items-center"><h2 className="font-bold">{quest ? 'Edit quest' : 'Create quest'}</h2><button type="button" onClick={onClose}><X className="text-white/50"/></button></div><label className="block text-xs text-white/50 mt-4">Quest name<input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-xl bg-white/5 p-3 text-sm" required /></label><label className="block text-xs text-white/50 mt-3">What does success look like?<textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-xl bg-white/5 p-3 text-sm min-h-20" /></label><label className="block text-xs text-white/50 mt-3">Focus<div className="relative mt-1"><select value={category} onChange={e => setCategory(e.target.value as QuestCategory)} className="ios-select">{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45"/></div></label><button className="mt-5 w-full py-3 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 text-[#CBD5E1] text-sm font-medium">Save quest</button></form></div>;
}
