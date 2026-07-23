// ============================================================
// SYSTEM v3 — Adaptive Multi-Stage Synchronization Onboarding
// Conversational cards, step progress, system pulse transitions
// ============================================================

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Dumbbell,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Globe,
  Briefcase,
  AlertTriangle,
  Calendar,
  Cpu,
} from 'lucide-react';
import type {
  OnboardingData,
  LifeSituation,
  EquipmentOption,
  FitnessLevelOption,
} from '@/types';

export const STAGE_LABELS = [
  'Identity Scan',
  'Life Situation',
  'Daily Available Time',
  'Primary Directives',
  'Equipment Arsenal',
  'Current Capacity',
  'Physical Exclusions',
  'Circadian Schedule',
  'System Synchronization',
];

const GOAL_OPTIONS = [
  'Get Stronger',
  'Build Muscle',
  'Lose Weight',
  'Become Faster',
  'Improve Balance',
  'Learn Self Defense',
  'Improve My Health',
  'Quit Porn',
  'Reduce Screen Time',
  'Improve Focus',
  'Sleep Better',
  'Build Discipline',
  'Become More Confident',
];

const TIME_OPTIONS = [
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '1 Hour', value: 60 },
  { label: '90 Minutes', value: 90 },
  { label: '2 Hours', value: 120 },
];

const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  'Bodyweight Only',
  'Resistance Band',
  'Pull-up Bar',
  'Jump Rope',
  'Dumbbells',
  'Gym Membership',
  'Other',
];

const LIFE_SITUATIONS: LifeSituation[] = [
  'Student',
  'College Student',
  'Working Professional',
  'Business Owner',
  'Freelancer',
  'Other',
];

export function OnboardingScreen() {
  const { completeOnboarding } = useGameStore();
  const [step, setStep] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Form State
  const [preferredName, setPreferredName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [timezone, setTimezone] = useState('');
  const [purpose] = useState('Mastering my physical and mental potential.');

  const [lifeSituation, setLifeSituation] = useState<LifeSituation>('Working Professional');
  const [availableTimeMinutes, setAvailableTimeMinutes] = useState<number>(30);

  const [goals, setGoals] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevelOption>('Beginner');
  const [limitations, setLimitations] = useState('');

  const [wakeTime, setWakeTime] = useState('');
  const [sleepTime, setSleepTime] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [preferredTrainingTime, setPreferredTrainingTime] = useState('');

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter(item => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const toggleEquipment = (eq: EquipmentOption) => {
    if (equipment.includes(eq)) {
      if (equipment.length > 1) setEquipment(equipment.filter(i => i !== eq));
    } else {
      setEquipment([...equipment, eq]);
    }
  };

  const handleFinish = async () => {
    setIsSyncing(true);
    const data: OnboardingData = {
      preferredName: preferredName.trim() || 'Player',
      age: typeof age === 'number' && age > 0 ? age : 24,
      country: country.trim() || 'Earth',
      language: language.trim() || 'English',
      timezone: timezone.trim() || 'GMT',
      purpose: purpose || 'Mastering physical and mental potential.',
      lifeSituation: lifeSituation || 'Working Professional',
      availableTimeMinutes: availableTimeMinutes || 30,
      goals: goals.length > 0 ? goals : ['Get Stronger', 'Improve My Health', 'Build Discipline'],
      equipment: equipment.length > 0 ? equipment : ['Bodyweight Only'],
      fitnessLevel: fitnessLevel || 'Beginner',
      limitations,
      schedule: {
        wakeTime: wakeTime || '07:00',
        sleepTime: sleepTime || '23:00',
        workHours: workHours || '09:00 - 17:00',
        preferredTrainingTime: preferredTrainingTime || '18:00',
      },
    };

    setTimeout(async () => {
      await completeOnboarding(data);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col items-center justify-between p-4 max-w-lg mx-auto relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CBD5E1]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="w-full pt-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[#CBD5E1] animate-pulse" />
            <span className="system-text text-[#CBD5E1] tracking-widest text-xs">SYSTEM ADAPTIVE ANALYSIS</span>
          </div>
          <span className="text-xs text-white/50 font-mono">STAGE 0{step + 1} / 09</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#CBD5E1] to-[#38BDF8]"
            animate={{ width: `${((step + 1) / 9) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Content Area */}
      <div className="w-full flex-1 flex items-center justify-center my-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {step === 0 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <User className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 1: PLAYER IDENTITY</div>
                <h2 className="text-xl font-bold mb-4">Who is the System evaluating?</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Preferred Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      value={preferredName}
                      onChange={e => setPreferredName(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Age</label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={age}
                        onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="e.g. United States, India..."
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Language</label>
                      <input
                        type="text"
                        placeholder="e.g. English..."
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Timezone</label>
                      <input
                        type="text"
                        placeholder="e.g. GMT-5..."
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Briefcase className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 2: LIFE SITUATION</div>
                <h2 className="text-xl font-bold mb-4">Which best describes your current routine?</h2>
                <div className="grid grid-cols-1 gap-2">
                  {LIFE_SITUATIONS.map(item => (
                    <button
                      key={item}
                      onClick={() => setLifeSituation(item)}
                      className={`p-3.5 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${
                        lifeSituation === item
                          ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white font-semibold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span>{item}</span>
                      {lifeSituation === item && <Check size={16} className="text-[#CBD5E1]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Clock className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 3: FOUNDATIONAL TIME</div>
                <h2 className="text-xl font-bold mb-2">How much REAL time can you dedicate daily?</h2>
                <p className="text-xs text-white/55 mb-4">
                  This value becomes the cornerstone foundation of your SYSTEM quest load, recovery pacing, and XP progression.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAvailableTimeMinutes(opt.value)}
                      className={`p-3 rounded-xl border text-center text-sm transition-all ${
                        availableTimeMinutes === opt.value
                          ? 'bg-[#CBD5E1]/25 border-[#CBD5E1] text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Sparkles className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 4: MAIN GOALS</div>
                <h2 className="text-xl font-bold mb-2">Select your primary objectives</h2>
                <p className="text-xs text-white/55 mb-3">Select all that apply. Technical stats are translated automatically.</p>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {GOAL_OPTIONS.map(g => {
                    const selected = goals.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGoal(g)}
                        className={`p-3 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{g}</span>
                        {selected && <Check size={16} className="text-[#CBD5E1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Dumbbell className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 5: EQUIPMENT ARSENAL</div>
                <h2 className="text-xl font-bold mb-3">What training gear do you own?</h2>
                <div className="grid grid-cols-1 gap-2">
                  {EQUIPMENT_OPTIONS.map(eq => {
                    const has = equipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`p-3 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${
                          has
                            ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{eq}</span>
                        {has && <Check size={16} className="text-[#CBD5E1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Globe className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 6: CURRENT FITNESS</div>
                <h2 className="text-xl font-bold mb-4">Where are you starting from today?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as FitnessLevelOption[]).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setFitnessLevel(lvl)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        fitnessLevel === lvl
                          ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-sm font-semibold">{lvl}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {lvl === 'Beginner' && 'Building core movement patterns and baseline stamina.'}
                        {lvl === 'Intermediate' && 'Accustomed to regular exercise, ready for higher volume.'}
                        {lvl === 'Advanced' && 'High physical conditioning, requiring intense quest loads.'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <AlertTriangle className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 7: PHYSICAL EXCLUSIONS</div>
                <h2 className="text-xl font-bold mb-2">Any injuries or medical limitations?</h2>
                <p className="text-xs text-white/55 mb-4">
                  The SYSTEM will exclude high-risk quests to protect your body.
                </p>
                <textarea
                  rows={4}
                  placeholder="e.g. Lower back pain, left shoulder stiffness, knee injury..."
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white focus:border-[#CBD5E1] outline-none"
                />
              </div>
            )}

            {step === 7 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Calendar className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 8: DAILY SCHEDULE</div>
                <h2 className="text-xl font-bold mb-3">Sync your daily clock</h2>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Wake-up Time</label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={e => setWakeTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Sleep Time</label>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={e => setSleepTime(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">Work / College Hours</label>
                    <input
                      type="text"
                      value={workHours}
                      onChange={e => setWorkHours(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">Preferred Quest Window</label>
                    <input
                      type="time"
                      value={preferredTrainingTime}
                      onChange={e => setPreferredTrainingTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="glass-card p-6 border-[#CBD5E1]/40 text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-[#CBD5E1]/20 border border-[#CBD5E1]/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Cpu className="text-[#CBD5E1]" size={32} />
                </div>
                <div className="system-text text-[#CBD5E1] text-sm mb-1 tracking-widest">SYNCHRONIZATION COMPLETE</div>
                <h2 className="text-2xl font-bold mb-2">Creating Player Profile...</h2>
                <p className="text-xs text-white/60 max-w-xs mx-auto mb-6">
                  Calculated visible stats, initial quests, and personalized progression parameters.
                </p>

                {isSyncing ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-[#CBD5E1]">
                    <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] border-t-transparent animate-spin" />
                    <span>Engaging Operating Core...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#CBD5E1] to-[#38BDF8] text-black font-bold text-sm tracking-wide shadow-lg shadow-[#CBD5E1]/20 hover:opacity-90 btn-press"
                  >
                    ENTER SYSTEM
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {step < 8 && (
        <div className="w-full flex items-center justify-between pt-2 z-10">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-1 text-xs px-4 py-2.5 rounded-xl border ${
              step === 0
                ? 'opacity-30 pointer-events-none border-transparent'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <button
            onClick={() => setStep(Math.min(8, step + 1))}
            className="flex items-center gap-1 text-xs px-5 py-2.5 rounded-xl bg-[#CBD5E1] text-black font-bold hover:bg-white transition-all btn-press shadow-md"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
