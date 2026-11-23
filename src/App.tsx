import { useCallback, useEffect, useState } from 'react';
import { DashboardHub } from './components/DashboardHub';
import { ModeBelajar } from './components/ModeBelajar';
import { ModeBerlatih } from './components/ModeBerlatih';
import { ModeBermain } from './components/ModeBermain';
import { PanduanModal } from './components/PanduanModal';
import { TitleScreen } from './components/TitleScreen';
import { audioEngine } from './game/audio';
import { AppScreen, StageNumber } from './game/types';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' || params.get('room')) {
        return 'bermain';
      }
    }
    return 'title';
  });

  const [panduanOpen, setPanduanOpen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [exp, setExp] = useState<number>(0);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [highestCityStage, setHighestCityStage] = useState<StageNumber>(1);
  const [bestCityScore, setBestCityScore] = useState<number>(0);
  const [bestHotsScore, setBestHotsScore] = useState<number | null>(null);

  // Sync document.body.dataset.state for non-playing screens
  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
    } else if (screen !== 'bermain') {
      document.body.dataset.state = 'playing';
    }
  }, [screen]);

  // Bind Enter / Space on TitleScreen to start game hub
  useEffect(() => {
    if (screen !== 'title' || panduanOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        audioEngine.unlockOnGesture();
        audioEngine.playClick();
        setScreen('dashboard');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, panduanOpen]);

  const handleToggleMute = useCallback(() => {
    audioEngine.unlockOnGesture();
    const nextMuted = audioEngine.toggleMute();
    setMuted(nextMuted);
  }, []);

  const handleNavigate = useCallback((nextScreen: AppScreen) => {
    audioEngine.unlockOnGesture();
    audioEngine.playClick();
    setScreen(nextScreen);
  }, []);

  const handleCompleteModule = useCallback((moduleId: string, expReward: number) => {
    setCompletedTopicIds((prev) => {
      if (prev.includes(moduleId)) return prev;
      setExp((e) => e + expReward);
      return [...prev, moduleId];
    });
  }, []);

  const handleUpdateCityRecord = useCallback((stageReached: StageNumber, score: number) => {
    setHighestCityStage((prev) => (stageReached > prev ? stageReached : prev));
    setBestCityScore((prev) => (score > prev ? score : prev));
  }, []);

  const handleSaveHotsScore = useCallback((score: number) => {
    setBestHotsScore((prev) => (prev === null || score > prev ? score : prev));
    setExp((e) => e + Math.round(score * 1.5));
  }, []);

  return (
    <>
      {screen === 'title' && (
        <TitleScreen
          onStartHub={() => handleNavigate('dashboard')}
          onQuickPlay={() => handleNavigate('bermain')}
          onOpenPanduan={() => {
            audioEngine.unlockOnGesture();
            audioEngine.playClick();
            setPanduanOpen(true);
          }}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'dashboard' && (
        <DashboardHub
          onNavigate={handleNavigate}
          onOpenPanduan={() => {
            audioEngine.unlockOnGesture();
            audioEngine.playClick();
            setPanduanOpen(true);
          }}
          exp={exp}
          completedTopicsCount={completedTopicIds.length}
          highestCityStage={highestCityStage}
          bestCityScore={bestCityScore}
          bestHotsScore={bestHotsScore}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'belajar' && (
        <ModeBelajar
          completedIds={completedTopicIds}
          onCompleteModule={handleCompleteModule}
          onBackDashboard={() => handleNavigate('dashboard')}
          onGoToPlay={() => handleNavigate('bermain')}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'bermain' && (
        <ModeBermain
          onBackDashboard={() => handleNavigate('dashboard')}
          onUpdateRecord={handleUpdateCityRecord}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'berlatih' && (
        <ModeBerlatih
          onBackDashboard={() => handleNavigate('dashboard')}
          onSaveScore={handleSaveHotsScore}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      <PanduanModal
        open={panduanOpen}
        onClose={() => {
          audioEngine.playClick();
          setPanduanOpen(false);
        }}
      />
    </>
  );
}
