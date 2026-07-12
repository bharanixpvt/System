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
import { DungeonPortal } from '@/screens/DungeonPortal';
import { InventoryScreen } from '@/screens/InventoryScreen';
import { AnalyticsScreen } from '@/screens/AnalyticsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { EvaluationScreen } from '@/screens/EvaluationScreen';
import { ShopScreen } from '@/screens/ShopScreen';
import { AppLayout } from '@/components/AppLayout';
import { SystemNotification } from '@/components/SystemNotification';
import { LevelUpModal } from '@/components/LevelUpModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PenaltyZoneModal } from '@/components/PenaltyZoneModal';
import { CombatTrainingPrompt } from '@/components/CombatTrainingPrompt';
import { SplashScreen } from '@/components/SplashScreen';
import { SuspensionScreen } from '@/components/SuspensionScreen';

function App() {
  const { initialize, isLoading, currentScreen, settings } = useGameStore();
  const [showContent, setShowContent] = useState(false);
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (isStandalone) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    initialize().then(() => {
      setTimeout(() => setShowContent(true), 300);
    });

    // Prevent accidental reloading
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'SYSTEM: Re-initializing will reset temporary state. Confirm exit?';
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Splash screen plays first — cinematic logo animation
  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  if (isLoading || !showContent) {
    return <LoadingScreen />;
  }

  if (settings?.systemPaused) {
    return <SuspensionScreen />;
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
        return <DungeonPortal />;
      case 'inventory':
        return <InventoryScreen />;
      case 'shop':
        return <ShopScreen />;
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
    <div className="min-h-screen bg-[#050608] text-white selection:bg-[#CBD5E1] selection:text-black">
      {useLayout ? (
        <AppLayout>
          {renderScreen()}
        </AppLayout>
      ) : (
        renderScreen()
      )}
      <SystemNotification />
      <LevelUpModal />
      <PenaltyZoneModal />
      <CombatTrainingPrompt />
    </div>
  );
}

export default App;

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
