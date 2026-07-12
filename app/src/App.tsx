// ============================================================
// SYSTEM — Main Application Component
// ============================================================

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { OpeningScreen } from '@/screens/OpeningScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { QuestsScreen } from '@/screens/QuestsScreen';
import { TrainingScreen } from '@/screens/TrainingScreen';
import { DungeonScreen } from '@/screens/DungeonScreen';
import { InventoryScreen } from '@/screens/InventoryScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { EvaluationScreen } from '@/screens/EvaluationScreen';
import { AppLayout } from '@/components/AppLayout';
import { SystemNotification } from '@/components/SystemNotification';
import { LevelUpModal } from '@/components/LevelUpModal';
import { LoadingScreen } from '@/components/LoadingScreen';

function App() {
  const { initialize, isLoading, currentScreen } = useGameStore();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    initialize().then(() => {
      setTimeout(() => setShowContent(true), 300);
    });
  }, []);

  if (isLoading || !showContent) {
    return <LoadingScreen />;
  }

  // Screen router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'opening':
        return <OpeningScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'stats':
        return <StatsScreen />;
      case 'quests':
        return <QuestsScreen />;
      case 'training':
        return <TrainingScreen />;
      case 'dungeon':
        return <DungeonScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'evaluation':
        return <EvaluationScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Screens that don't use the app layout
  const noLayoutScreens = ['opening', 'onboarding'];
  const useLayout = !noLayoutScreens.includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-[#4FD8FF] selection:text-black">
      {useLayout ? (
        <AppLayout>
          {renderScreen()}
        </AppLayout>
      ) : (
        renderScreen()
      )}
      <SystemNotification />
      <LevelUpModal />
    </div>
  );
}

export default App;
