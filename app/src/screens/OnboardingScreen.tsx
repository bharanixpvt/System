import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, User, Activity, Target, Brain } from 'lucide-react';
import { playButtonPress } from '@/lib/audio';

const TOTAL_STEPS = 4;

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    bodyFat: '',
    fitnessLevel: 5,
    sleepQuality: 7,
    maxPushups: '',
    maxPlank: '',
    bandStrength: 'light',
    pornFrequency: 'daily',
    screenTime: '6',
    goals: [] as string[],
  });
  const { completeOnboarding } = useGameStore();

  const updateField = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return formData.name && formData.age && formData.weight && formData.height;
    if (step === 1) return formData.maxPushups && formData.maxPlank;
    return true;
  };

  const handleSubmit = () => {
    playButtonPress();
    
    const parsedAge = parseInt(formData.age);
    const parsedWeight = parseFloat(formData.weight);
    const parsedHeight = parseFloat(formData.height);
    const parsedBodyFat = parseFloat(formData.bodyFat);
    const parsedPushups = parseInt(formData.maxPushups);
    const parsedPlank = parseInt(formData.maxPlank);
    const parsedScreenTime = parseInt(formData.screenTime);

    completeOnboarding({
      name: formData.name,
      age: isNaN(parsedAge) ? 25 : parsedAge,
      gender: formData.gender,
      weight: isNaN(parsedWeight) ? 75 : parsedWeight,
      height: isNaN(parsedHeight) ? 175 : parsedHeight,
      bodyFat: isNaN(parsedBodyFat) ? 20 : parsedBodyFat,
      fitnessLevel: formData.fitnessLevel,
      sleepQuality: formData.sleepQuality,
      maxPushups: isNaN(parsedPushups) ? 0 : parsedPushups,
      maxPlank: isNaN(parsedPlank) ? 0 : parsedPlank,
      bandStrength: formData.bandStrength,
      pornFrequency: formData.pornFrequency,
      screenTime: (isNaN(parsedScreenTime) ? 6 : parsedScreenTime) * 60,
      goals: formData.goals,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepIdentity formData={formData} updateField={updateField} />;
      case 1:
        return <StepFitness formData={formData} updateField={updateField} />;
      case 2:
        return <StepWellness formData={formData} updateField={updateField} />;
      case 3:
        return <StepConfirm formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-[#4FD8FF]" />
          <span className="system-text text-[#4FD8FF]">INITIAL SYSTEM SCAN</span>
        </div>
        <div className="flex gap-1.5">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#4FD8FF]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep()}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => { playButtonPress(); setStep(step - 1); }}
            className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors btn-press"
          >
            <ChevronLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => { playButtonPress(); setStep(step + 1); }}
            disabled={!canProceed()}
            className="flex items-center gap-1 px-5 py-2.5 bg-[#4FD8FF]/20 hover:bg-[#4FD8FF]/30 text-[#4FD8FF] rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed btn-press border border-[#4FD8FF]/30"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1 px-6 py-2.5 bg-gradient-to-r from-[#4FD8FF] to-[#3A8DFF] text-[#050608] rounded-lg text-sm font-bold transition-all btn-press"
          >
            <span>Initialize</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// Step Components
function StepIdentity({ formData, updateField }: { formData: any; updateField: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <User size={32} className="mx-auto text-[#4FD8FF] mb-3" />
        <h2 className="text-xl font-bold">Player Identity</h2>
        <p className="text-sm text-white/50 mt-1">Enter your physical parameters</p>
      </div>

      <InputField label="Player Name" value={formData.name} onChange={v => updateField('name', v)} placeholder="Your name" />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Age" value={formData.age} onChange={v => updateField('age', v)} type="number" placeholder="25" />
        <div>
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Gender</label>
          <select
            value={formData.gender}
            onChange={e => updateField('gender', e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#4FD8FF]/50"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Weight (kg)" value={formData.weight} onChange={v => updateField('weight', v)} type="number" placeholder="75" />
        <InputField label="Height (cm)" value={formData.height} onChange={v => updateField('height', v)} type="number" placeholder="175" />
      </div>
      <InputField label="Body Fat % (optional)" value={formData.bodyFat} onChange={v => updateField('bodyFat', v)} type="number" placeholder="18" />
    </div>
  );
}

function StepFitness({ formData, updateField }: { formData: any; updateField: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <Target size={32} className="mx-auto text-[#4FD8FF] mb-3" />
        <h2 className="text-xl font-bold">Fitness Baseline</h2>
        <p className="text-sm text-white/50 mt-1">Assess your current capabilities</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField label="Max Push-ups" value={formData.maxPushups} onChange={v => updateField('maxPushups', v)} type="number" placeholder="20" />
        <InputField label="Max Plank (seconds)" value={formData.maxPlank} onChange={v => updateField('maxPlank', v)} type="number" placeholder="60" />
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Fitness Level (1-10)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.fitnessLevel}
          onChange={e => updateField('fitnessLevel', parseInt(e.target.value))}
          className="w-full accent-[#4FD8FF]"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Beginner</span>
          <span className="text-[#4FD8FF] font-bold">{formData.fitnessLevel}</span>
          <span>Elite</span>
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Band Strength</label>
        <select
          value={formData.bandStrength}
          onChange={e => updateField('bandStrength', e.target.value)}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#4FD8FF]/50"
        >
          <option value="light">Light</option>
          <option value="medium">Medium</option>
          <option value="heavy">Heavy</option>
        </select>
      </div>
    </div>
  );
}

function StepWellness({ formData, updateField }: { formData: any; updateField: (f: string, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <Brain size={32} className="mx-auto text-[#4FD8FF] mb-3" />
        <h2 className="text-xl font-bold">Digital Wellness</h2>
        <p className="text-sm text-white/50 mt-1">Understanding your habits</p>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Sleep Quality (1-10)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.sleepQuality}
          onChange={e => updateField('sleepQuality', parseInt(e.target.value))}
          className="w-full accent-[#4FD8FF]"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Poor</span>
          <span className="text-[#4FD8FF] font-bold">{formData.sleepQuality}</span>
          <span>Excellent</span>
        </div>
      </div>

      <InputField label="Daily Screen Time (hours)" value={formData.screenTime} onChange={v => updateField('screenTime', v)} type="number" placeholder="6" />

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Training Goals</label>
        <div className="space-y-2">
          {['Build Strength', 'Lose Weight', 'Improve Cardio', 'Learn Self-Defense', 'Build Discipline'].map(goal => (
            <label key={goal} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/8 transition-colors">
              <input
                type="checkbox"
                checked={formData.goals.includes(goal)}
                onChange={e => {
                  const newGoals = e.target.checked
                    ? [...formData.goals, goal]
                    : formData.goals.filter((g: string) => g !== goal);
                  updateField('goals', newGoals);
                }}
                className="accent-[#4FD8FF]"
              />
              <span className="text-sm">{goal}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepConfirm({ formData }: { formData: any }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto rounded-full bg-[#4FD8FF]/10 border border-[#4FD8FF]/30 flex items-center justify-center mb-6">
        <Activity size={36} className="text-[#4FD8FF]" />
      </div>
      <h2 className="text-xl font-bold mb-2">Scan Complete</h2>
      <p className="text-sm text-white/50 mb-8">Your Player profile is ready for initialization</p>

      <div className="glass-card p-4 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Player</span>
          <span className="text-white font-medium">{formData.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Fitness Level</span>
          <span className="text-[#4FD8FF] font-medium">{formData.fitnessLevel}/10</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Goals</span>
          <span className="text-white font-medium">{formData.goals.length} selected</span>
        </div>
      </div>

      <p className="system-text text-white/30 mt-6 tracking-[0.15em]">
        Press Initialize to begin
      </p>
    </div>
  );
}

// Input Field Component
function InputField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#4FD8FF]/50 placeholder:text-white/20 transition-colors"
      />
    </div>
  );
}
