import { useState, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  Settings, Volume2, VolumeX, Bell, BellOff, Moon,
  Download, Upload, Trash2, AlertTriangle, ChevronRight,
  Shield, RefreshCw
} from 'lucide-react';
import { playButtonPress } from '@/lib/audio';
import { exportAllData } from '@/db';
import { encryptData, downloadSystemFile, readSystemFile } from '@/lib/encryption';

export function SettingsScreen() {
  const { settings, profile, updateSettings, resetSystem, importData, navigateTo, toggleSystemPause } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData_, setImportData] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      {/* Boss Dungeon Settings */}
      <SettingsSection title="Boss Dungeon">
        <ToggleSetting
          icon={Shield}
          label="Boss Dungeon Penalty"
          description="Resets streak and deducts XP on expiration"
          enabled={settings.bossDungeonPenaltyEnabled ?? true}
          onChange={(v) => updateSettings({ bossDungeonPenaltyEnabled: v })}
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
