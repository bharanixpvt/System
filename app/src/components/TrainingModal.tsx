import { useState } from 'react';
import { Dumbbell, X, Check, ChevronDown } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import type { TrainingPathName } from '@/types';

export function TrainingModal({ pathName, onClose }: { pathName?: TrainingPathName; onClose: () => void }) {
  const { trainingPaths, completeTrainingExercise } = useGameStore();
  const [path, setPath] = useState<TrainingPathName | undefined>(pathName || trainingPaths[0]?.name);
  const selected = trainingPaths.find(p => p.name === path);
  if (!selected) return null;
  return <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"><section className="glass-card w-full max-w-md p-5 border-[#4FD8FF]/25">
    <div className="flex justify-between items-center"><div><p className="system-text text-[#4FD8FF]">QUEST TRAINING</p><h2 className="text-lg font-bold">{selected.displayName}</h2></div><button onClick={onClose}><X className="text-white/50" /></button></div>
    {!pathName && <div className="relative mt-4"><select value={path} onChange={e => setPath(e.target.value as TrainingPathName)} className="ios-select">{trainingPaths.map(p => <option key={p.name} value={p.name}>{p.displayName}</option>)}</select><ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45"/></div>}
    <p className="text-xs text-white/50 mt-3">{selected.description}</p><div className="space-y-2 mt-4 max-h-72 overflow-auto">{selected.exercises.filter(e => e.unlocked && !e.completed).slice(0, 4).map(exercise => <div className="p-3 rounded-lg bg-white/5" key={exercise.name}><p className="text-sm font-medium">{exercise.name}</p><p className="text-xs text-white/45 mt-1">{exercise.sets} sets × {exercise.reps} · {exercise.restSeconds}s rest</p><button onClick={() => completeTrainingExercise(selected.name, selected.exercises.indexOf(exercise))} className="mt-2 text-xs text-[#4FD8FF] flex gap-1"><Check size={14}/> Mark complete</button></div>)}</div>
    <div className="mt-4 text-xs text-white/40 flex gap-2"><Dumbbell size={15} className="text-[#4FD8FF]"/>Training is opened only when a quest calls for it.</div>
  </section></div>;
}
