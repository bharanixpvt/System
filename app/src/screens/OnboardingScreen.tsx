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
  'Lose Fat & Build Muscle',
  'Build Muscle & Get Stronger',
  'Quit Porn & Reset Dopamine',
  'Reduce Phone & Screen Time',
  'Improve Cardio & Stamina',
  'Fix Posture & Joint Flexibility',
  'Improve Concentration & Focus',
];

const INJURY_OPTIONS = [
  'None / Fully Operational',
  'Lower Back / Spinal Sensitivity',
  'Knee Joint Vulnerability',
  'Shoulder Impingement',
  'Wrist / Elbow Strain',
  'Ankle Instability',
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

function calculateAgeFromDOB(dob: string): number {
  if (!dob) return 24;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? age : 24;
}

function calculateBodyFat(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (!weightKg || !heightCm || !age) return 18;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const genderFactor = gender === 'male' ? 1 : 0;
  const bf = (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
  return Math.max(5, Math.min(50, Math.round(bf * 10) / 10));
}

export function OnboardingScreen() {
  const { completeOnboarding } = useGameStore();
  const [step, setStep] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Form State
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [purpose] = useState('Mastering my physical and mental potential.');

  const [lifeSituation, setLifeSituation] = useState<LifeSituation>('Working Professional');
  const [availableTimeMinutes, setAvailableTimeMinutes] = useState<number>(30);

  const [goals, setGoals] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevelOption>('Beginner');
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(['None / Fully Operational']);

  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [workHours, setWorkHours] = useState('09:00 - 17:00');
  const [preferredTrainingTime, setPreferredTrainingTime] = useState('18:00');

  const calculatedAge = calculateAgeFromDOB(dateOfBirth);
  const estimatedBodyFat = calculateBodyFat(
    typeof weightKg === 'number' ? weightKg : 70,
    typeof heightCm === 'number' ? heightCm : 175,
    calculatedAge,
    gender
  );

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter(item => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const toggleInjury = (inj: string) => {
    if (inj === 'None / Fully Operational') {
      setSelectedInjuries(['None / Fully Operational']);
      return;
    }
    const filtered = selectedInjuries.filter(i => i !== 'None / Fully Operational');
    if (filtered.includes(inj)) {
      const next = filtered.filter(i => i !== inj);
      setSelectedInjuries(next.length === 0 ? ['None / Fully Operational'] : next);
    } else {
      setSelectedInjuries([...filtered, inj]);
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
      age: calculatedAge,
      dateOfBirth: dateOfBirth || '2000-01-01',
      gender,
      weightKg: typeof weightKg === 'number' ? weightKg : 70,
      heightCm: typeof heightCm === 'number' ? heightCm : 175,
      bodyFatPercent: estimatedBodyFat,
      country: 'Earth',
      language: 'English',
      timezone: 'GMT',
      purpose: purpose || 'Mastering physical and mental potential.',
      lifeSituation: lifeSituation || 'Working Professional',
      availableTimeMinutes: availableTimeMinutes || 30,
      goals: goals.length > 0 ? goals : ['Lose Fat & Build Muscle'],
      equipment: equipment.length > 0 ? equipment : ['Bodyweight Only'],
      fitnessLevel: fitnessLevel || 'Beginner',
      limitations: selectedInjuries.join(', '),
      injuries: selectedInjuries,
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
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 1: PLAYER IDENTITY & BIOMETRICS</div>
                <h2 className="text-xl font-bold mb-4">Biometric Initialization</h2>

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
                      <label className="text-xs text-white/60 block mb-1">Date of Birth (DOB)</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={e => setDateOfBirth(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Gender</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setGender('male')}
                          className={`flex-1 py-2 rounded-xl border text-xs font-semibold ${
                            gender === 'male' ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white' : 'bg-white/5 border-white/10 text-white/50'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('female')}
                          className={`flex-1 py-2 rounded-xl border text-xs font-semibold ${
                            gender === 'female' ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white' : 'bg-white/5 border-white/10 text-white/50'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Height (cm)</label>
                      <input
                        type="number"
                        placeholder="e.g. 175"
                        value={heightCm}
                        onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 70"
                        value={weightKg}
                        onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                      />
                    </div>
                  </div>

                  {/* Auto-calculated Body Fat % Card — Rendered ONLY after DOB, Height & Weight are entered */}
                  {Boolean(dateOfBirth && heightCm !== '' && weightKg !== '') && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-[#CBD5E1]/10 border border-[#CBD5E1]/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">Auto Biometric Scan</div>
                        <div className="text-xs font-semibold text-white/90">Age: <span className="text-[#38BDF8]">{calculatedAge} yrs</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/50 uppercase tracking-widest">Est. Body Fat</div>
                        <div className="text-sm font-bold text-[#4ADE80]">{estimatedBodyFat}%</div>
                      </div>
                    </motion.div>
                  )}
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
                <h2 className="text-xl font-bold mb-2">Any injuries or joint limitations?</h2>
                <p className="text-xs text-white/55 mb-4">
                  Select all applicable conditions. The SYSTEM will tailor quest mechanics to avoid strain.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {INJURY_OPTIONS.map(inj => {
                    const selected = selectedInjuries.includes(inj);
                    return (
                      <button
                        key={inj}
                        type="button"
                        onClick={() => toggleInjury(inj)}
                        className={`p-3 rounded-xl border text-left text-sm flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#CBD5E1]/20 border-[#CBD5E1] text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{inj}</span>
                        {selected && <Check size={16} className="text-[#CBD5E1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="glass-card p-6 border-[#CBD5E1]/30">
                <div className="w-12 h-12 rounded-xl bg-[#CBD5E1]/15 border border-[#CBD5E1]/30 flex items-center justify-center mb-4">
                  <Calendar className="text-[#CBD5E1]" size={24} />
                </div>
                <div className="system-text text-[#CBD5E1] text-xs mb-1">STAGE 8: CIRCADIAN SCHEDULE</div>
                <h2 className="text-xl font-bold mb-3">Sync your daily clock & training window</h2>

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
                      placeholder="e.g. 09:00 - 17:00"
                      value={workHours}
                      onChange={e => setWorkHours(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:border-[#CBD5E1] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1">When will you perform SYSTEM Quests?</label>
                    <input
                      type="time"
                      value={preferredTrainingTime}
                      onChange={e => setPreferredTrainingTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#CBD5E1] outline-none font-mono"
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
