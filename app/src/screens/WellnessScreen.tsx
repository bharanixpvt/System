import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Brain, Monitor, Check, X,
  Shield, AlertCircle, Zap
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';

export function WellnessScreen() {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">Digital Wellness</h1>
      </div>
      <p className="text-sm text-white/40 mb-4">Track and improve your mental discipline</p>

      <PornRecoveryModule />
      <ScreenTimeModule />
      <FocusModule />
    </div>
  );
}

// Porn Recovery Module
function PornRecoveryModule() {
  const { profile, logPornFreeDay } = useGameStore();
  const [checkedIn, setCheckedIn] = useState(false);

  if (!profile) return null;

  const handleCheckIn = (clean: boolean) => {
    playButtonPress();
    logPornFreeDay(clean);
    setCheckedIn(true);
  };

  const milestones = [
    { days: 7, label: '1 Week', color: '#4ADE80' },
    { days: 30, label: '1 Month', color: '#3A8DFF' },
    { days: 90, label: '3 Months', color: '#8B5CF6' },
    { days: 365, label: '1 Year', color: '#FBBF24' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} className="text-[#4FD8FF]" />
        <h2 className="text-sm font-semibold">Digital Discipline</h2>
      </div>

      {/* Streak Display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-gradient-cyan mb-1">
          {profile.pornFreeStreak}
        </div>
        <p className="text-xs text-white/40">Current Streak (Days)</p>
        {profile.maxPornFreeStreak > 0 && (
          <p className="text-xs text-[#FBBF24] mt-1">Best: {profile.maxPornFreeStreak} days</p>
        )}
      </div>

      {/* Progress to milestones */}
      <div className="space-y-2 mb-4">
        {milestones.map(m => {
          const progress = Math.min(100, (profile.pornFreeStreak / m.days) * 100);
          return (
            <div key={m.days}>
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>{m.label}</span>
                <span style={{ color: progress >= 100 ? m.color : undefined }}>
                  {profile.pornFreeStreak}/{m.days}
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? m.color : 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Check-in */}
      {!checkedIn ? (
        <div className="space-y-2">
          <p className="text-xs text-white/50 text-center mb-2">Daily Check-in</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleCheckIn(true)}
              className="flex-1 py-2.5 bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 text-[#4ADE80] rounded-lg text-xs font-medium border border-[#4ADE80]/30 transition-colors btn-press flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> Clean Day (+40 XP)
            </button>
            <button
              onClick={() => handleCheckIn(false)}
              className="flex-1 py-2.5 bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/15 text-[#FF5A5F]/70 hover:text-[#FF5A5F] rounded-lg text-xs font-medium border border-[#FF5A5F]/20 transition-colors btn-press flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Relapse (No shame)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <Check size={20} className="mx-auto text-[#4ADE80] mb-1" />
          <p className="text-xs text-[#4ADE80]">Checked in for today</p>
        </div>
      )}
    </motion.div>
  );
}

// Screen Time Module
function ScreenTimeModule() {
  const { profile, settings, logScreenTime } = useGameStore();
  const [screenMinutes, setScreenMinutes] = useState('');

  if (!profile || !settings) return null;

  const limit = settings.screenTimeLimit;
  const current = profile.todayScreenTime;
  const percent = Math.min(100, (current / limit) * 100);
  const isOver = current > limit;

  const handleLog = () => {
    playButtonPress();
    const mins = parseInt(screenMinutes);
    if (!isNaN(mins)) {
      logScreenTime(mins);
      setScreenMinutes('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Monitor size={16} className="text-[#4FD8FF]" />
        <h2 className="text-sm font-semibold">Screen Time</h2>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/50">Today: {Math.floor(current / 60)}h {current % 60}m</span>
          <span className={isOver ? 'text-[#FF5A5F]' : 'text-[#4ADE80]'}>
            Limit: {Math.floor(limit / 60)}h
          </span>
        </div>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-gradient-to-r from-[#FBBF24] to-[#FF5A5F]' : 'bg-gradient-to-r from-[#4ADE80] to-[#4FD8FF]'
            }`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
        {isOver && (
          <p className="text-[10px] text-[#FBBF24] mt-1 flex items-center gap-1">
            <AlertCircle size={10} /> Over limit — Discipline penalty applies
          </p>
        )}
      </div>

      {/* Log Screen Time */}
      <div className="flex gap-2">
        <input
          type="number"
          value={screenMinutes}
          onChange={e => setScreenMinutes(e.target.value)}
          placeholder="Minutes today"
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#4FD8FF]/50 placeholder:text-white/20"
        />
        <button
          onClick={handleLog}
          className="px-4 py-2 bg-[#4FD8FF]/15 text-[#4FD8FF] rounded-lg text-xs font-medium border border-[#4FD8FF]/30 transition-colors btn-press"
        >
          Log
        </button>
      </div>
    </motion.div>
  );
}

// Focus Module
function FocusModule() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [completed, setCompleted] = useState(false);

  // Timer logic would go here with useEffect
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    playButtonPress();
    setIsActive(true);
    setTimeLeft(focusMinutes * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    setCompleted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[#4FD8FF]" />
        <h2 className="text-sm font-semibold">Focus Mode</h2>
      </div>

      {!isActive && !completed ? (
        <>
          <div className="text-center mb-4">
            <p className="text-xs text-white/40 mb-2">Session Duration</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setFocusMinutes(Math.max(5, focusMinutes - 5))}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">{focusMinutes}</span>
              <span className="text-xs text-white/40">min</span>
              <button
                onClick={() => setFocusMinutes(Math.min(120, focusMinutes + 5))}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-2.5 bg-[#4FD8FF]/15 text-[#4FD8FF] rounded-lg text-sm font-medium border border-[#4FD8FF]/30 transition-colors btn-press"
          >
            Start Focus Session
          </button>
        </>
      ) : isActive ? (
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-gradient-cyan mb-2">
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs text-white/40 mb-4">Stay focused. Distractions reduce XP gain.</p>
          <button
            onClick={handleComplete}
            className="px-6 py-2.5 bg-[#4ADE80]/15 text-[#4ADE80] rounded-lg text-sm font-medium border border-[#4ADE80]/30"
          >
            Complete Early
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Check size={32} className="mx-auto text-[#4ADE80] mb-2" />
          <p className="text-sm font-medium text-[#4ADE80]">Focus Session Complete</p>
          <p className="text-xs text-white/40 mt-1">+{Math.round(focusMinutes * 0.6)} Focus XP</p>
          <button
            onClick={() => { setCompleted(false); setIsActive(false); }}
            className="mt-3 px-4 py-2 bg-white/5 text-white/60 rounded-lg text-xs"
          >
            Start Another
          </button>
        </div>
      )}
    </motion.div>
  );
}

// Export as standalone screen too
export default WellnessScreen;
