import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Activity, Calendar, Flame, Target
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { STAT_CONFIG } from '@/types';

export function AnalyticsScreen() {
  const { profile, stats, quests, workouts } = useGameStore();

  if (!profile) return null;

  // Radar chart data for stats
  const radarData = stats.map(s => ({
    stat: s.displayName.slice(0, 3),
    fullName: s.displayName,
    level: s.level,
    color: s.color,
  }));

  // Mock weekly XP data (would be from real history in production)
  const weeklyData = [
    { day: 'Mon', xp: 450 },
    { day: 'Tue', xp: 380 },
    { day: 'Wed', xp: 620 },
    { day: 'Thu', xp: 290 },
    { day: 'Fri', xp: 510 },
    { day: 'Sat', xp: 740 },
    { day: 'Sun', xp: 410 },
  ];

  // Completed quests by category
  const questCategories = quests
    .filter(q => q.status === 'completed')
    .reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(questCategories).map(([cat, count]) => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    count,
    color: STAT_CONFIG[cat as keyof typeof STAT_CONFIG]?.color || '#4FD8FF',
  }));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={18} className="text-[#4FD8FF]" />
        <h1 className="text-lg font-bold">System Analytics</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={TrendingUp} label="Total XP" value={profile.totalXP.toLocaleString()} color="#4FD8FF" />
        <MetricCard icon={Activity} label="Level" value={`${profile.totalLevel}`} color="#3A8DFF" />
        <MetricCard icon={Flame} label="Max Streak" value={`${profile.maxStreak} days`} color="#FBBF24" />
        <MetricCard icon={Target} label="Quests Done" value={`${quests.filter(q => q.status === 'completed').length}`} color="#4ADE80" />
      </div>

      {/* Stat Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h2 className="text-sm font-semibold mb-4">Stat Distribution</h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
              />
              <Radar
                name="Stats"
                dataKey="level"
                stroke="#4FD8FF"
                fill="#4FD8FF"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Weekly XP Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <h2 className="text-sm font-semibold mb-4">Weekly XP</h2>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />
              <Bar dataKey="xp" fill="#4FD8FF" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quests by Category */}
      {categoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <h2 className="text-sm font-semibold mb-4">Quests by Category</h2>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  type="number"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fillOpacity={0.7}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Workout History Summary */}
      {workouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4"
        >
          <h2 className="text-sm font-semibold mb-3">Recent Training</h2>
          <div className="space-y-2">
            {workouts.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-white/30" />
                  <span className="text-sm">{w.pathDisplayName}</span>
                </div>
                <span className="text-xs text-[#4FD8FF]">+{w.totalXP} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: {
  icon: typeof TrendingUp; label: string; value: string; color: string;
}) {
  return (
    <div className="glass-card p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
