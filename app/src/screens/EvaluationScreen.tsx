import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, Timer, Dumbbell, Zap, Heart, Shield, Move,
  Trophy, AlertTriangle
} from 'lucide-react';
import { isEligibleForEvaluation } from '@/engine/gameEngine';
import { playButtonPress } from '@/lib/audio';

interface TestField {
  key: string;
  label: string;
  icon: typeof Dumbbell;
  placeholder: string;
  unit: string;
}

const TESTS: { category: string; icon: typeof Dumbbell; fields: TestField[] }[] = [
  {
    category: 'Strength Test',
    icon: Dumbbell,
    fields: [
      { key: 'pushups', label: 'Max Push-ups', icon: Dumbbell, placeholder: '25', unit: 'reps' },
      { key: 'bandRows', label: 'Band Rows', icon: Dumbbell, placeholder: '15', unit: 'reps' },
      { key: 'wallSit', label: 'Wall Sit', icon: Timer, placeholder: '60', unit: 'seconds' },
      { key: 'plank', label: 'Plank Hold', icon: Timer, placeholder: '60', unit: 'seconds' },
    ],
  },
  {
    category: 'Agility Test',
    icon: Zap,
    fields: [
      { key: 'reactionTime', label: 'Reaction Time', icon: Timer, placeholder: '300', unit: 'ms' },
      { key: 'lateralShuffles', label: 'Lateral Shuffles', icon: Zap, placeholder: '20', unit: 'in 30s' },
      { key: 'balance', label: 'Single-leg Balance', icon: Move, placeholder: '30', unit: 'seconds' },
    ],
  },
  {
    category: 'Endurance Test',
    icon: Heart,
    fields: [
      { key: 'circuitTime', label: 'Circuit Completion', icon: Timer, placeholder: '10', unit: 'minutes' },
      { key: 'burpees', label: 'Burpees (5 min)', icon: Heart, placeholder: '30', unit: 'reps' },
      { key: 'runDistance', label: 'Run (12 min)', icon: Heart, placeholder: '2000', unit: 'meters' },
    ],
  },
  {
    category: 'Combat Test',
    icon: Shield,
    fields: [
      { key: 'shadowRounds', label: 'Shadow Boxing Rounds', icon: Shield, placeholder: '3', unit: 'x 3min' },
      { key: 'footwork', label: 'Footwork Accuracy', icon: Zap, placeholder: '80', unit: '%' },
    ],
  },
];

export function EvaluationScreen() {
  const { profile, submitEvaluation, navigateTo } = useGameStore();
  const [scores, setScores] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!profile) return null;

  const eligible = isEligibleForEvaluation(profile);
  const nextEvalDate = profile.nextEvaluationDate;

  const updateScore = (key: string, value: string) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    playButtonPress();
    const numericScores: Record<string, number> = {};
    Object.entries(scores).forEach(([k, v]) => {
      numericScores[k] = parseFloat(v) || 0;
    });

    // Simple pass/fail logic: need at least 60% of fields filled with reasonable values
    const totalFields = TESTS.reduce((sum, t) => sum + t.fields.length, 0);
    const filledFields = Object.values(numericScores).filter(v => v > 0).length;
    const passed = filledFields >= totalFields * 0.5;

    submitEvaluation(numericScores, passed);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card glow-border p-8 max-w-sm w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Trophy size={48} className="mx-auto text-[#FBBF24] mb-4" />
          </motion.div>
          <h2 className="text-xl font-bold mb-2">Evaluation Submitted</h2>
          <p className="text-sm text-white/50 mb-2">
            SYSTEM will analyze your performance and determine rank eligibility.
          </p>
          <p className="text-xs text-white/30 mb-6">
            Next evaluation available in 30 days.
          </p>
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-6 py-2.5 bg-[#CBD5E1]/20 text-[#CBD5E1] rounded-lg text-sm font-medium border border-[#CBD5E1]/30"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!eligible && nextEvalDate) {
    const daysLeft = Math.ceil((new Date(nextEvalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-sm w-full text-center"
        >
          <Timer size={48} className="mx-auto text-[#FBBF24] mb-4" />
          <h2 className="text-xl font-bold mb-2">Evaluation Not Yet Available</h2>
          <p className="text-sm text-white/50 mb-2">
            Continue training. Your next evaluation is in:
          </p>
          <p className="text-3xl font-bold text-[#FBBF24] mb-6">{daysLeft} days</p>
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-6 py-2.5 bg-[#CBD5E1]/20 text-[#CBD5E1] rounded-lg text-sm font-medium border border-[#CBD5E1]/30"
          >
            Continue Training
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardCheck size={18} className="text-[#CBD5E1]" />
        <h1 className="text-lg font-bold">System Evaluation</h1>
      </div>

      <div className="glass-card p-4 border-[#CBD5E1]/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#FBBF24] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">30-Day Evaluation</p>
            <p className="text-xs text-white/50 mt-1">
              Enter your best performance for each test. Rank promotion is determined by overall improvement, 
              not absolute numbers. Compete against your previous self.
            </p>
          </div>
        </div>
      </div>

      {TESTS.map((test, testIndex) => {
        const Icon = test.icon;
        return (
          <motion.div
            key={test.category}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: testIndex * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon size={16} className="text-[#CBD5E1]" />
              <h2 className="text-sm font-semibold">{test.category}</h2>
            </div>
            <div className="space-y-3">
              {test.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-white/50 mb-1.5">{field.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={scores[field.key] || ''}
                      onChange={e => updateScore(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50 placeholder:text-white/20"
                    />
                    <span className="flex items-center text-xs text-white/40 px-2">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleSubmit}
        className="w-full py-3.5 bg-gradient-to-r from-[#CBD5E1] to-[#64748B] text-[#050608] rounded-xl font-bold text-sm tracking-wider transition-all btn-press"
      >
        Submit Evaluation
      </motion.button>
    </div>
  );
}
