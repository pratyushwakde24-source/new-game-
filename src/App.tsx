/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SparkRushCanvas } from './game/rendering/SparkRushCanvas.tsx';
import { HUDOverlay } from './components/HUDOverlay.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { HeaderBanner } from './components/HeaderBanner.tsx';
import { NavigationDock } from './components/NavigationDock.tsx';
import { ModeSelectorModal } from './components/ModeSelectorModal.tsx';
import { CosmeticsModal } from './components/CosmeticsModal.tsx';
import { AchievementsModal } from './components/AchievementsModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { SubscriptionModal } from './components/SubscriptionModal.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { TutorialModal } from './components/TutorialModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { useGameStore } from './stores/useGameStore.ts';
import { useUserStore } from './stores/useUserStore.ts';
import { apiClient } from './services/apiClient.ts';

export default function App() {
  const [isModesOpen, setIsModesOpen] = useState(false);
  const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { status, pauseGame, resumeGame } = useGameStore();

  // Load saved high score and cloud save on initial mount
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem('sparkverse_highscore');
      if (savedHigh) {
        useGameStore.setState((s) => ({
          stats: { ...s.stats, highScore: parseInt(savedHigh, 10) || 0 },
        }));
      }
    } catch {}

    // Restore from Cloud Save
    const profile = useUserStore.getState().profile;
    apiClient.fetchCloudSave(profile.id).then((cloud) => {
      if (cloud?.stats) {
        useGameStore.setState((s) => ({
          stats: {
            ...s.stats,
            highScore: Math.max(s.stats.highScore, cloud.stats.highScore || 0),
            level: cloud.stats.level || s.stats.level,
            xp: cloud.stats.xp || s.stats.xp,
            sparkCoins: cloud.stats.sparkCoins || s.stats.sparkCoins,
          },
        }));
      }
    });
  }, []);

  // Keyboard shortcut listener for cinema mode / pause
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (status === 'playing') pauseGame();
        else if (status === 'paused') resumeGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status, pauseGame, resumeGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080718] font-sans select-none">
      {/* Real-time 3D Three.js Canvas */}
      <SparkRushCanvas />

      {/* Persistent minimal branding header */}
      <HeaderBanner
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Idle / Welcome Hub */}
      <WelcomeScreen onOpenTutorial={() => setIsTutorialOpen(true)} />

      {/* Active Flight HUD & Mobile Steer */}
      <HUDOverlay />

      {/* Flight Concluded / Score Breakdown */}
      <GameOverModal />

      {/* Unified Bottom Ergonomic Control Dock */}
      <NavigationDock
        onOpenModes={() => setIsModesOpen(true)}
        onOpenCosmetics={() => setIsCosmeticsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Interactive Modals */}
      <ModeSelectorModal isOpen={isModesOpen} onClose={() => setIsModesOpen(false)} />
      <CosmeticsModal isOpen={isCosmeticsOpen} onClose={() => setIsCosmeticsOpen(false)} />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
      <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
