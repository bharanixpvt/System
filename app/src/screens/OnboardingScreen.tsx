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
    dobDay: '',
    dobMonth: '',
    dobYear: '',
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

  const calculateAgeFromDOB = (day: string, month: string, year: string): number => {
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return 0;
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
    return Math.max(0, age);
  };
  const { completeOnboarding } = useGameStore();

  const updateField = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) {
      const dobValid = formData.dobDay && formData.dobMonth && formData.dobYear &&
        parseInt(formData.dobYear) >= 1900 && parseInt(formData.dobYear) <= new Date().getFullYear() - 5;
      return formData.name && dobValid && formData.weight && formData.height;
    }
    if (step === 1) return formData.maxPushups && formData.maxPlank;
    return true;
  };

  const handleSubmit = () => {
    playButtonPress();

    const computedAge = calculateAgeFromDOB(formData.dobDay, formData.dobMonth, formData.dobYear);
    const y = formData.dobYear.padStart(4, '0');
    const mo = formData.dobMonth.padStart(2, '0');
    const d = formData.dobDay.padStart(2, '0');
    const dateOfBirth = `${y}-${mo}-${d}`;

    const parsedWeight = parseFloat(formData.weight);
    const parsedHeight = parseFloat(formData.height);
    const parsedBodyFat = parseFloat(formData.bodyFat);
    const parsedPushups = parseInt(formData.maxPushups);
    const parsedPlank = parseInt(formData.maxPlank);
    const parsedScreenTime = parseInt(formData.screenTime);

    // Auto-calculate body fat from BMI if not provided
    let bodyFat = isNaN(parsedBodyFat) ? 0 : parsedBodyFat;
    if (!bodyFat && parsedHeight >= 100 && parsedWeight >= 25 && computedAge > 0) {
      const bmi = parsedWeight / Math.pow(parsedHeight / 100, 2);
      const sexFactor = formData.gender === 'male' ? 1 : 0;
      bodyFat = Math.max(3, Math.min(60, Math.round((1.2 * bmi + 0.23 * computedAge - 10.8 * sexFactor - 5.4) * 10) / 10));
    }

    completeOnboarding({
      name: formData.name,
      age: computedAge || 25,
      dateOfBirth,
      gender: formData.gender,
      weight: isNaN(parsedWeight) ? 75 : parsedWeight,
      height: isNaN(parsedHeight) ? 175 : parsedHeight,
      bodyFat: bodyFat || 20,
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
          <Activity size={16} className="text-[#CBD5E1]" />
          <span className="system-text text-[#CBD5E1]">INITIAL SYSTEM SCAN</span>
        </div>
        <div className="flex gap-1.5">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#CBD5E1]' : 'bg-white/10'
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
            className="flex items-center gap-1 px-5 py-2.5 bg-[#CBD5E1]/20 hover:bg-[#CBD5E1]/30 text-[#CBD5E1] rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed btn-press border border-[#CBD5E1]/30"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1 px-6 py-2.5 bg-gradient-to-r from-[#CBD5E1] to-[#64748B] text-[#050608] rounded-lg text-sm font-bold transition-all btn-press"
          >
            <span>Initialize</span>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// Helper: compute age live for display
function computeAge(day: string, month: string, year: string): number | null {
  const d = parseInt(day), m = parseInt(month), y = parseInt(year);
  if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age >= 0 ? age : null;
}

// Step Components
function StepIdentity({ formData, updateField }: { formData: any; updateField: (f: string, v: any) => void }) {
  const liveAge = computeAge(formData.dobDay, formData.dobMonth, formData.dobYear);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { v: '1', l: 'Jan' }, { v: '2', l: 'Feb' }, { v: '3', l: 'Mar' },
    { v: '4', l: 'Apr' }, { v: '5', l: 'May' }, { v: '6', l: 'Jun' },
    { v: '7', l: 'Jul' }, { v: '8', l: 'Aug' }, { v: '9', l: 'Sep' },
    { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 5 - i);

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <User size={32} className="mx-auto text-[#CBD5E1] mb-3" />
        <h2 className="text-xl font-bold">Player Identity</h2>
        <p className="text-sm text-white/50 mt-1">Enter your physical parameters</p>
      </div>

      <InputField label="Player Name" value={formData.name} onChange={v => updateField('name', v)} placeholder="Your name" />

      {/* Date of Birth */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Date of Birth</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={formData.dobDay}
            onChange={e => updateField('dobDay', e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50 text-white"
          >
            <option value="">Day</option>
            {days.map(d => <option key={d} value={String(d)}>{d}</option>)}
          </select>
          <select
            value={formData.dobMonth}
            onChange={e => updateField('dobMonth', e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50 text-white"
          >
            <option value="">Month</option>
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          <select
            value={formData.dobYear}
            onChange={e => updateField('dobYear', e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50 text-white"
          >
            <option value="">Year</option>
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>
        {liveAge !== null && (
          <p className="mt-1.5 text-xs text-[#CBD5E1]/70">
            Age: <span className="font-semibold text-[#CBD5E1]">{liveAge} years old</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Gender</label>
        <select
          value={formData.gender}
          onChange={e => updateField('gender', e.target.value)}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
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
        <Target size={32} className="mx-auto text-[#CBD5E1] mb-3" />
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
          className="w-full accent-[#CBD5E1]"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Beginner</span>
          <span className="text-[#CBD5E1] font-bold">{formData.fitnessLevel}</span>
          <span>Elite</span>
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Band Strength</label>
        <select
          value={formData.bandStrength}
          onChange={e => updateField('bandStrength', e.target.value)}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50"
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
        <Brain size={32} className="mx-auto text-[#CBD5E1] mb-3" />
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
          className="w-full accent-[#CBD5E1]"
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Poor</span>
          <span className="text-[#CBD5E1] font-bold">{formData.sleepQuality}</span>
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
                className="accent-[#CBD5E1]"
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
      <div className="w-20 h-20 mx-auto rounded-full bg-[#CBD5E1]/10 border border-[#CBD5E1]/30 flex items-center justify-center mb-6">
        <Activity size={36} className="text-[#CBD5E1]" />
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
          <span className="text-[#CBD5E1] font-medium">{formData.fitnessLevel}/10</span>
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
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#CBD5E1]/50 placeholder:text-white/20 transition-colors"
      />
    </div>
  );
}
