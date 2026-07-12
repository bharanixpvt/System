import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Zap, Heart, Move, Shield,
  ChevronRight, Lock, Check, Play, Trophy, Clock, Flame
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
        <Dumbbell size={18} className="text-[#4FD8FF]" />
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
  const Icon = PATH_ICONS[path.name];

  const handleCompleteExercise = (index: number) => {
    completeTrainingExercise(path.name, index);
    setActiveExercise(null);
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
              onClick={() => isUnlocked && !isCompleted && setActiveExercise(isActive ? null : index)}
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
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded bg-white/5">
                        <Flame size={14} className="mx-auto text-[#FBBF24] mb-1" />
                        <div className="text-xs font-medium">{exercise.sets} sets</div>
                      </div>
                      <div className="text-center p-2 rounded bg-white/5">
                        <Trophy size={14} className="mx-auto text-[#4FD8FF] mb-1" />
                        <div className="text-xs font-medium">{exercise.reps} reps</div>
                      </div>
                      <div className="text-center p-2 rounded bg-white/5">
                        <Clock size={14} className="mx-auto text-[#4ADE80] mb-1" />
                        <div className="text-xs font-medium">{exercise.restSeconds}s rest</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteExercise(index)}
                      className="w-full py-2.5 bg-[#4FD8FF]/15 hover:bg-[#4FD8FF]/25 text-[#4FD8FF] rounded-lg text-xs font-medium transition-colors border border-[#4FD8FF]/30"
                    >
                      Mark Complete
                    </button>
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
