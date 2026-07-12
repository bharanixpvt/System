import { useState, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Settings, Volume2, VolumeX, Bell, BellOff, Moon,
  Download, Upload, Trash2, AlertTriangle, ChevronRight,
  Shield, RefreshCw, UserRound, Save
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import { exportAllData } from '@/db';
import { encryptData, downloadSystemFile, readSystemFile } from '@/lib/encryption';

export function SettingsScreen() {
  const { settings, profile, updateSettings, updateProfile, resetSystem, importData, navigateTo, toggleSystemPause } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData_, setImportData] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileDraft, setProfileDraft] = useState(() => {
    // Parse existing dateOfBirth if present
    let dobDay = '', dobMonth = '', dobYear = '';
    if (profile?.dateOfBirth) {
      const parts = profile.dateOfBirth.split('-');
      if (parts.length === 3) {
        dobYear = parts[0];
        dobMonth = String(parseInt(parts[1]));
        dobDay = String(parseInt(parts[2]));
      }
    }
    return {
      name: profile?.name || '',
      height: String(profile?.height || ''),
      weight: String(profile?.weight || ''),
      dobDay,
      dobMonth,
      dobYear,
    };
  });

  const getDOBAge = () => {
    const d = parseInt(profileDraft.dobDay), m = parseInt(profileDraft.dobMonth), y = parseInt(profileDraft.dobYear);
    if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null;
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
    return age >= 0 ? age : null;
  };

  const calculateBodyFat = () => {
    if (!profile) return 0;
    const height = Number(profileDraft.height);
    const weight = Number(profileDraft.weight);
    if (!height || !weight || height < 100 || weight < 25) return profile.bodyFat;
    const ageForCalc = getDOBAge() ?? profile.age;
    const bmi = weight / Math.pow(height / 100, 2);
    const sexFactor = profile.gender.toLowerCase() === 'male' ? 1 : profile.gender.toLowerCase() === 'female' ? 0 : 0.5;
    return Math.max(3, Math.min(60, Math.round((1.2 * bmi + 0.23 * ageForCalc - 10.8 * sexFactor - 5.4) * 10) / 10));
  };

  const saveProfileDetails = async () => {
    if (!profile) return;
    const height = Number(profileDraft.height);
    const weight = Number(profileDraft.weight);
    if (!profileDraft.name.trim() || height < 100 || weight < 25) return;
    const ageFromDOB = getDOBAge();
    const y = profileDraft.dobYear.padStart(4, '0');
    const mo = profileDraft.dobMonth.padStart(2, '0');
    const d = profileDraft.dobDay.padStart(2, '0');
    const dateOfBirth = ageFromDOB !== null ? `${y}-${mo}-${d}` : profile.dateOfBirth;
    await updateProfile({
      name: profileDraft.name.trim(),
      height,
      weight,
      bodyFat: calculateBodyFat(),
      ...(ageFromDOB !== null ? { age: ageFromDOB, dateOfBirth } : {}),
    });
  };

  const handleExport = async () => {
    playButtonPress();
    const data = await exportAllData();
    const encrypted = encryptData(data as Record<string, unknown>);
    downloadSystemFile(encrypted);
  };

  const handleImportClick = () => {
    playButtonPress();
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readSystemFile(file);
    if (data) {
      setImportData(data);
      setShowImportConfirm(true);
    }
  };

  const confirmImport = async () => {
    if (importData_) {
      await importData(importData_);
      setShowImportConfirm(false);
      setImportData(null);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={18} className="text-[#CBD5E1]" />
        <h1 className="text-lg font-bold">System Settings</h1>
      </div>

      {/* Player Info */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CBD5E1]/20 to-[#64748B]/20 flex items-center justify-center border border-[#CBD5E1]/20">
              <Shield size={20} className="text-[#CBD5E1]" />
            </div>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-xs text-white/40">Level {profile.totalLevel} — {profile.currentRank}</p>
            </div>
          </div>
        </motion.div>
      )}

      {profile && (
        <SettingsSection title="Profile & Measurements">
          <div className="mb-3 flex items-center gap-2 text-white/60"><UserRound size={16} className="text-[#CBD5E1]" /><span className="text-xs">Keep your profile current for more accurate training targets.</span></div>
          <div className="space-y-3">
            <label className="block text-xs text-white/45">Name<input value={profileDraft.name} onChange={e => setProfileDraft(d => ({ ...d, name: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50" /></label>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs text-white/45 mb-1.5">Date of Birth</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={profileDraft.dobDay}
                  onChange={e => setProfileDraft(d => ({ ...d, dobDay: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={String(day)}>{day}</option>
                  ))}
                </select>
                <select
                  value={profileDraft.dobMonth}
                  onChange={e => setProfileDraft(d => ({ ...d, dobMonth: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50"
                >
                  <option value="">Month</option>
                  {[
                    ['1','Jan'],['2','Feb'],['3','Mar'],['4','Apr'],['5','May'],['6','Jun'],
                    ['7','Jul'],['8','Aug'],['9','Sep'],['10','Oct'],['11','Nov'],['12','Dec']
                  ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select
                  value={profileDraft.dobYear}
                  onChange={e => setProfileDraft(d => ({ ...d, dobYear: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 5 - i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
              {(() => {
                const age = getDOBAge();
                return age !== null ? (
                  <p className="mt-1.5 text-xs text-[#CBD5E1]/70">Age: <span className="font-semibold text-[#CBD5E1]">{age} years old</span></p>
                ) : null;
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-white/45">Height (cm)<input type="number" min="100" max="250" value={profileDraft.height} onChange={e => setProfileDraft(d => ({ ...d, height: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50" /></label>
              <label className="block text-xs text-white/45">Weight (kg)<input type="number" min="25" max="350" step="0.1" value={profileDraft.weight} onChange={e => setProfileDraft(d => ({ ...d, weight: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#CBD5E1]/50" /></label>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#CBD5E1]/15 bg-[#CBD5E1]/5 px-3 py-2.5"><div><p className="text-xs font-medium text-[#CBD5E1]">Estimated body fat</p><p className="mt-0.5 text-[10px] text-white/40">BMI-based estimate using age, height, weight, and profile sex.</p></div><strong className="text-lg">{calculateBodyFat()}%</strong></div>
            <button onClick={saveProfileDetails} className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-[#CBD5E1] py-2.5 text-sm font-semibold text-[#050608] hover:bg-white"><Save size={15} />Save profile</button>
          </div>
        </SettingsSection>
      )}

      {/* Audio Settings */}
      <SettingsSection title="Audio">
        <ToggleSetting
          icon={settings.audioEnabled ? Volume2 : VolumeX}
          label="Interface Sounds"
          description="Quest complete, level up, notifications"
          enabled={settings.audioEnabled}
          onChange={(v) => updateSettings({ audioEnabled: v })}
        />
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection title="Notifications">
        <ToggleSetting
          icon={settings.notificationsEnabled ? Bell : BellOff}
          label="Push Notifications"
          description="Daily quest reminders"
          enabled={settings.notificationsEnabled}
          onChange={(v) => updateSettings({ notificationsEnabled: v })}
        />
      </SettingsSection>

      {/* System Status */}
      <SettingsSection title="System Status">
        <ToggleSetting
          icon={Shield}
          label="Pause System"
          description="Freeze streaks, quest generation, and evaluation timers during unavoidable situations."
          enabled={settings.systemPaused ?? false}
          onChange={() => toggleSystemPause()}
        />
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance">
        <ToggleSetting
          icon={Moon}
          label="Dark Mode"
          description="Always enabled in SYSTEM"
          enabled={true}
          onChange={() => {}}
          disabled
        />
      </SettingsSection>

      {/* Data Management */}
      <SettingsSection title="Data Management">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between p-3.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Download size={18} className="text-[#CBD5E1]" />
            <div>
              <p className="text-sm font-medium">Export Save File</p>
              <p className="text-xs text-white/40">Download encrypted .system file</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20" />
        </button>

        <button
          onClick={handleImportClick}
          className="w-full flex items-center justify-between p-3.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left mt-2"
        >
          <div className="flex items-center gap-3">
            <Upload size={18} className="text-[#4ADE80]" />
            <div>
              <p className="text-sm font-medium">Import Save File</p>
              <p className="text-xs text-white/40">Restore from .system file</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".system"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => navigateTo('evaluation')}
          className="w-full flex items-center justify-between p-3.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors text-left mt-2"
        >
          <div className="flex items-center gap-3">
            <RefreshCw size={18} className="text-[#FBBF24]" />
            <div>
              <p className="text-sm font-medium">System Evaluation</p>
              <p className="text-xs text-white/40">30-day rank assessment</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/20" />
        </button>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone">
        {!showResetConfirm ? (
          <button
            onClick={() => { playButtonPress(); setShowResetConfirm(true); }}
            className="w-full flex items-center justify-between p-3.5 rounded-lg bg-[#FF5A5F]/10 hover:bg-[#FF5A5F]/15 transition-colors text-left border border-[#FF5A5F]/20"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-[#FF5A5F]" />
              <div>
                <p className="text-sm font-medium text-[#FF5A5F]">Reset System</p>
                <p className="text-xs text-white/40">Erase all data and start over</p>
              </div>
            </div>
            <AlertTriangle size={16} className="text-[#FF5A5F]" />
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border-[#FF5A5F]/30"
          >
            <p className="text-sm text-[#FF5A5F] mb-3 font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => resetSystem()}
                className="flex-1 py-2 bg-[#FF5A5F] text-white rounded-lg text-sm font-medium"
              >
                Reset Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-white/10 text-white/60 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </SettingsSection>

      {/* Version */}
      <div className="text-center pt-4">
        <p className="system-text text-white/20 tracking-[0.2em]">SYSTEM v1.0.0</p>
        <p className="text-[10px] text-white/10 mt-1">Offline-First PWA</p>
      </div>

      {/* Import Confirmation Modal */}
      {showImportConfirm && importData_ && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
          onClick={() => setShowImportConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-card glow-border p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Confirm Import</h3>
            <p className="text-sm text-white/60 mb-4">
              This will replace all current data with the imported save file. Current progress will be lost.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmImport}
                className="flex-1 py-2.5 bg-[#4ADE80]/20 text-[#4ADE80] rounded-lg text-sm font-medium border border-[#4ADE80]/30"
              >
                Import
              </button>
              <button
                onClick={() => setShowImportConfirm(false)}
                className="flex-1 py-2.5 bg-white/10 text-white/60 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Settings Section
function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">{title}</h2>
      {children}
    </motion.div>
  );
}

// Toggle Setting
function ToggleSetting({
  icon: Icon, label, description, enabled, onChange, disabled
}: {
  icon: typeof Volume2; label: string; description: string;
  enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={enabled ? 'text-[#CBD5E1]' : 'text-white/30'} />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </div>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[#CBD5E1]' : 'bg-white/10'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
