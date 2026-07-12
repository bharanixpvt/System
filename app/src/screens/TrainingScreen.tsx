import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Zap, Heart, Move, Shield,
  ChevronRight, Lock, Check, Play, Trophy, Clock, Flame, TimerReset, CircleCheck
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import type { TrainingPathName } from '@/types';

const PATH_ICONS: Record<TrainingPathName, typeof Dumbbell> = {
  strength: Dumbbell,
  agility: Zap,
  endurance: Heart,
  mobility: Move,
  selfDefense: Shield,
};

export function TrainingScreen() {
  const { trainingPaths } = useGameStore();
  const [selectedPath, setSelectedPath] = useState<TrainingPathName | null>(null);

  const selectedPathData = trainingPaths.find(p => p.name === selectedPath);

  if (selectedPath && selectedPathData) {
    return (
      <PathDetailScreen
        path={selectedPathData}
        onBack={() => setSelectedPath(null)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Dumbbell size={18} className="text-[#CBD5E1]" />
        <h1 className="text-lg font-bold">Training Paths</h1>
      </div>
      <p className="text-sm text-white/40 mb-4">Choose a path to develop your abilities</p>

      <div className="space-y-3">
        {trainingPaths.map((path, index) => {
          const Icon = PATH_ICONS[path.name];
          return (
            <motion.button
              key={path.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => { playButtonPress(); setSelectedPath(path.name); }}
              className="w-full glass-card glass-card-hover p-4 text-left btn-press"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${path.color}15` }}
                  >
                    <Icon size={22} style={{ color: path.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{path.displayName}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{path.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-white/30">Tier {path.tier}/{path.maxTier}</span>
                      <span className="text-[10px] text-white/20">|</span>
                      <span className="text-[10px]" style={{ color: path.color }}>{path.progress}% complete</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/20" />
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${path.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: path.color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PathDetailScreen({ path, onBack }: { path: import('@/types').TrainingPath; onBack: () => void }) {
  const { completeTrainingExercise } = useGameStore();
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const Icon = PATH_ICONS[path.name];

  useEffect(() => {
    if (restSeconds <= 0) return;
    const timer = window.setInterval(() => setRestSeconds(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [restSeconds]);

  const handleCompleteExercise = (index: number) => {
    completeTrainingExercise(path.name, index);
    setActiveExercise(null);
  };

  const completeSet = (index: number, exercise: import('@/types').TrainingExercise) => {
    const nextSet = completedSets + 1;
    if (nextSet >= exercise.sets) {
      handleCompleteExercise(index);
      setCompletedSets(0);
      setRestSeconds(0);
      return;
    }
    setCompletedSets(nextSet);
    setRestSeconds(exercise.restSeconds);
  };

  return (
    <div className="space-y-4 pb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 transition-colors mb-2"
      >
        <ChevronRight size={16} className="rotate-180" /> Back to Paths
      </button>

      {/* Path Header */}
      <div className="glass-card p-5" style={{ borderColor: `${path.color}20` }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${path.color}15` }}
          >
            <Icon size={26} style={{ color: path.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold">{path.displayName}</h2>
            <p className="text-xs text-white/40">{path.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Progress: {path.progress}%</span>
          <span>{path.exercises.filter(e => e.completed).length}/{path.exercises.length} exercises</span>
        </div>
        <div className="mt-2 w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${path.progress}%`, backgroundColor: path.color }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center">
          <div><p className="text-[10px] text-white/35">WARM-UP</p><p className="mt-1 text-xs font-medium">3–5 min</p></div>
          <div><p className="text-[10px] text-white/35">FOCUS</p><p className="mt-1 text-xs font-medium">Controlled form</p></div>
          <div><p className="text-[10px] text-white/35">COOL-DOWN</p><p className="mt-1 text-xs font-medium">2 min</p></div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/60">Exercises</h3>
        {path.exercises.map((exercise, index) => {
          const isUnlocked = exercise.unlocked || index === 0;
          const isCompleted = exercise.completed;
          const isActive = activeExercise === index;

          return (
            <motion.div
              key={exercise.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-3.5 transition-all ${
                isCompleted ? 'border-[#4ADE80]/20 opacity-60' :
                isUnlocked ? 'hover:border-white/15 cursor-pointer' :
                'opacity-40'
              }`}
              onClick={() => {
                if (!isUnlocked || isCompleted) return;
                setCompletedSets(0);
                setRestSeconds(0);
                setActiveExercise(isActive ? null : index);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-[#4ADE80]/15' :
                    isUnlocked ? 'bg-white/5' : 'bg-white/3'
                  }`}>
                    {isCompleted ? <Check size={16} className="text-[#4ADE80]" /> :
                     isUnlocked ? <Play size={14} className="text-white/60" /> :
                     <Lock size={14} className="text-white/20" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isCompleted ? 'line-through text-white/40' : ''}`}>
                      {exercise.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/30">Tier {exercise.tier}</span>
                      <span className="text-[10px] text-white/20">|</span>
                      <span className="text-[10px] text-white/30">{exercise.sets} sets x {exercise.reps}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                    {exercise.difficulty}x
                  </span>
                </div>
              </div>

              {/* Active exercise detail */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-white/5"
                  >
                    <p className="text-xs text-white/50 mb-3">{exercise.description}</p>
                    <div className="mb-3 flex items-center justify-between rounded-lg border border-white/8 bg-black/15 px-3 py-2">
                      <div className="flex items-center gap-2"><TimerReset size={15} style={{ color: path.color }} /><span className="text-xs text-white/65">Live session</span></div>
                      <span className="text-xs font-semibold">Set {Math.min(completedSets + 1, exercise.sets)} of {exercise.sets}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded bg-white/5">
                        <Flame size={14} className="mx-auto text-[#FBBF24] mb-1" />
                        <div className="text-xs font-medium">{exercise.sets} sets</div>
                      </div>
                      <div className="text-center p-2 rounded bg-white/5">
                        <Trophy size={14} className="mx-auto text-[#CBD5E1] mb-1" />
                        <div className="text-xs font-medium">{exercise.reps} reps</div>
                      </div>
                      <div className="text-center p-2 rounded bg-white/5">
                        <Clock size={14} className="mx-auto text-[#4ADE80] mb-1" />
                        <div className="text-xs font-medium">{exercise.restSeconds}s rest</div>
                      </div>
                    </div>
                    {restSeconds > 0 ? (
                      <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/10 p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-[#4ADE80]">Recovery interval</p><p className="mt-1 text-xl font-bold text-white">0:{String(restSeconds).padStart(2, '0')}</p><button onClick={e => { e.stopPropagation(); setRestSeconds(0); }} className="mt-1 text-xs text-white/50 hover:text-white">Skip rest</button></div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); completeSet(index, exercise); }}
                        className="w-full py-2.5 bg-[#CBD5E1]/15 hover:bg-[#CBD5E1]/25 text-[#CBD5E1] rounded-lg text-xs font-medium transition-colors border border-[#CBD5E1]/30"
                      >
                        <span className="flex items-center justify-center gap-2"><CircleCheck size={15} />{completedSets + 1 >= exercise.sets ? 'Finish exercise' : 'Complete set & start rest'}</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
