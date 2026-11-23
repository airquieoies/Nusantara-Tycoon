import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardHub } from './components/DashboardHub';
import { ModeBelajar } from './components/ModeBelajar';
import { ModeBerlatih } from './components/ModeBerlatih';
import { ModeBermain } from './components/ModeBermain';
import { PanduanModal } from './components/PanduanModal';
import { TitleScreen } from './components/TitleScreen';
import { audioEngine } from './game/audio';
import { getGlobalProgressionSummary, loadMultiStageFromStorage } from './game/multiStageLogic';
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
  const [selectedStageLaunch, setSelectedStageLaunch] = useState<StageNumber | null>(null);
  const [summaryVersion, setSummaryVersion] = useState<number>(0);

  const worldSummary = useMemo(() => {
    void summaryVersion;
    return getGlobalProgressionSummary(loadMultiStageFromStorage());
  }, [summaryVersion]);

  // Sync document.body.dataset.state & refresh live summary when returning to title/dashboard
  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
      setSummaryVersion((v) => v + 1);
    } else if (screen === 'dashboard') {
      document.body.dataset.state = 'playing';
      setSummaryVersion((v) => v + 1);
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
        setSelectedStageLaunch(null);
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
    if (nextScreen !== 'bermain') {
      setSelectedStageLaunch(null);
    }
    setScreen(nextScreen);
  }, []);

  const handlePlayStage = useCallback((stage?: StageNumber) => {
    audioEngine.unlockOnGesture();
    audioEngine.playClick();
    setSelectedStageLaunch(stage ?? null);
    setScreen('bermain');
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
          summary={worldSummary}
          learningExp={exp}
          completedTopicsCount={completedTopicIds.length}
          bestHotsScore={bestHotsScore}
          onStartHub={() => handleNavigate('dashboard')}
          onQuickPlay={handlePlayStage}
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
          summary={worldSummary}
          onNavigate={handleNavigate}
          onPlayStage={handlePlayStage}
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
          onGoToPlay={() => handlePlayStage()}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'bermain' && (
        <ModeBermain
          initialStage={selectedStageLaunch}
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
