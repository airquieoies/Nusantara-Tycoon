import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Layers,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BELAJAR_MODULES,
  TIMELINE_PHASES,
  WORLD_SYSTEM_TIERS,
} from '../game/data/belajarData';
import { CHARACTERS } from '../game/data/characters';
import { audioEngine } from '../game/audio';

interface ModeBelajarProps {
  completedIds: string[];
  onCompleteModule: (moduleId: string, expReward: number) => void;
  onBackDashboard: () => void;
  onGoToPlay: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const ModeBelajar: React.FC<ModeBelajarProps> = ({
  completedIds,
  onCompleteModule,
  onBackDashboard,
  onGoToPlay,
  muted,
  onToggleMute,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>(TIMELINE_PHASES[0].id);
  const [selectedTierId, setSelectedTierId] = useState<string>(WORLD_SYSTEM_TIERS[0].id);

  const currentModule = BELAJAR_MODULES[activeIndex];
  const leadChar = CHARACTERS[currentModule.leadCharacter];
  const isCompleted = completedIds.includes(currentModule.id);

  const activePhase =
    TIMELINE_PHASES.find((p) => p.id === selectedTimelineId) ?? TIMELINE_PHASES[0];
  const activeTier =
    WORLD_SYSTEM_TIERS.find((t) => t.id === selectedTierId) ?? WORLD_SYSTEM_TIERS[0];

  const toggleFlashcard = (id: string) => {
    audioEngine.playClick();
    setFlippedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectModule = (idx: number) => {
    audioEngine.playClick();
    setActiveIndex(idx);
  };

  const handleMarkDone = () => {
    audioEngine.playMissionComplete();
    onCompleteModule(currentModule.id, currentModule.expReward);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onBackDashboard();
              }}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:text-white whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Mode Belajar · Ensiklopedia Sosiologi</h1>
              <p className="text-xs text-slate-400">
                Perubahan Sosial & Globalisasi · {completedIds.length}/6 Topik Tuntas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onGoToPlay();
              }}
              className="flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0"
            >
              Terapkan di Mode Bermain
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
            >
              {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-12">
        {/* Left Navigation: 6 Topics */}
        <aside className="space-y-2 lg:col-span-3">
          <div className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Daftar 6 Submateri
          </div>
          {BELAJAR_MODULES.map((mod, idx) => {
            const active = idx === activeIndex;
            const done = completedIds.includes(mod.id);
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(idx)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? 'border-sky-400/60 bg-sky-500/15 text-white'
                    : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400">
                    Materi {mod.number} · +{mod.expReward} EXP
                  </div>
                  <div className="truncate text-sm font-semibold">{mod.title}</div>
                </div>
                {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              </button>
            );
          })}
        </aside>

        {/* Main Encyclopedia Content */}
        <section className="space-y-6 lg:col-span-9">
          {/* Topic Banner + Character Commentary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-sky-300">
                  Materi {currentModule.number} dari 6 · Hadiah {currentModule.expReward} EXP
                </div>
                <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                  {currentModule.title}
                </h2>
                <p className="mt-1 text-sm text-slate-300">{currentModule.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={handleMarkDone}
                disabled={isCompleted}
                className={`flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  isCompleted
                    ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-default'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Materi Selesai (+{currentModule.expReward} EXP)
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    Tandai Selesai & Klaim +{currentModule.expReward} EXP
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-200">
              {currentModule.coreSummary}
            </p>

            {/* Lead Character Guidance Box */}
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <img
                src={leadChar.avatarSrc}
                alt={leadChar.name}
                referrerPolicy="no-referrer"
                className="h-14 w-14 shrink-0 rounded-xl border border-slate-700 object-cover"
              />
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-white">{leadChar.name}</span>
                  <span className={leadChar.textAccentClass}>{leadChar.title}</span>
                  <span className="text-slate-400">· Perspektif {leadChar.theory}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">"{currentModule.characterNote}"</p>
              </div>
            </div>
          </div>

          {/* Scholar Definitions (if Materi 1) */}
          {currentModule.scholarDefinitions && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-base font-bold text-white">
                Definisi Globalisasi Menurut Para Ahli Sosiologi
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {currentModule.scholarDefinitions.map((item) => (
                  <div
                    key={item.scholar}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="font-bold text-amber-300">{item.scholar}</div>
                    <div className="text-xs text-slate-400">{item.yearOrWork}</div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive World System Theory Explorer (if Materi 4) */}
          {currentModule.hasWorldSystem && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Eksplorasi Interaktif: World System Theory (Immanuel Wallerstein)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Klik setiap lapisan ekonomi dunia untuk memahami ketimpangan struktural global.
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {WORLD_SYSTEM_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick();
                      setSelectedTierId(tier.id);
                    }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                      activeTier.id === tier.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="text-base font-bold text-amber-300">{activeTier.name}</div>
                <div className="mt-1 text-sm font-medium text-slate-200">{activeTier.role}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
                  {activeTier.characteristics.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-3 border-t border-slate-800 pt-3 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Contoh Negara</div>
                    <div className="mt-0.5 text-sm text-white">{activeTier.examples}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Dampak Ketimpangan Global</div>
                    <div className="mt-0.5 text-sm text-rose-200">{activeTier.inequalityImpact}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Timeline (if Materi 5) */}
          {currentModule.hasTimeline && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-4 text-base font-bold text-white">
                Timeline Interaktif Perkembangan Globalisasi
              </h3>

              <div className="mb-5 grid gap-2 sm:grid-cols-3">
                {TIMELINE_PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick();
                      setSelectedTimelineId(phase.id);
                    }}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                      activePhase.id === phase.id
                        ? 'border-amber-400 bg-amber-500/15 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-amber-300">{phase.periodLabel}</div>
                    <div className="mt-0.5 text-sm font-bold">{phase.era}</div>
                  </button>
                ))}
              </div>

              <div className="grid items-stretch gap-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:grid-cols-12">
                <div className="overflow-hidden rounded-lg md:col-span-5">
                  <img
                    src={activePhase.stageRefImage}
                    alt={activePhase.era}
                    referrerPolicy="no-referrer"
                    className="h-full min-h-[190px] w-full scale-110 object-cover object-left-bottom"
                  />
                </div>
                <div className="space-y-3 md:col-span-7">
                  <div className="text-lg font-bold text-white">{activePhase.era}</div>
                  <p className="text-sm leading-relaxed text-slate-300">{activePhase.summary}</p>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {activePhase.drivers.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                  <div className="rounded-lg bg-slate-900 p-3 text-xs text-emerald-200">
                    <strong className="text-emerald-300">Konteks Nusantara:</strong> {activePhase.nusantaraContext}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Sociological Points + Everyday Student Examples */}
          <div className="grid gap-4 md:grid-cols-2">
            {currentModule.keyPoints.map((kp) => (
              <div
                key={kp.heading}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div>
                  <h3 className="text-base font-bold text-white">{kp.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{kp.detail}</p>
                </div>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-relaxed text-amber-200">
                  <span className="font-bold text-amber-300">Contoh Sehari-hari: </span>
                  {kp.example}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Flip Flashcards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Kartu Flashcard Interaktif (Klik Kartu untuk Membalik)
                </h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentModule.flashcards.map((card) => {
                const flipped = !!flippedCardIds[card.id];
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleFlashcard(card.id)}
                    className={`flex min-h-[190px] flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      flipped
                        ? 'border-emerald-500/50 bg-emerald-950/35'
                        : 'border-slate-700 bg-slate-950/75 hover:border-sky-400/50'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between text-xs font-semibold">
                      <span className={flipped ? 'text-emerald-300' : 'text-sky-300'}>
                        {flipped ? 'Jawaban & Penjelasan' : card.frontTitle}
                      </span>
                      <RotateCw className="h-3.5 w-3.5 text-slate-400" />
                    </div>

                    {flipped ? (
                      <div className="my-2 space-y-2">
                        <p className="text-xs leading-relaxed text-white">{card.backExplanation}</p>
                        <p className="text-[11px] text-emerald-200">
                          Contoh: {card.everydayExample}
                        </p>
                      </div>
                    ) : (
                      <p className="my-3 text-sm font-semibold leading-snug text-slate-100">
                        {card.frontPrompt}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400">
                      {flipped ? 'Klik untuk kembali ke pertanyaan' : 'Klik untuk melihat jawaban'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prev / Next Navigation */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => handleSelectModule(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Materi Sebelumnya
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectModule(Math.min(BELAJAR_MODULES.length - 1, activeIndex + 1))
              }
              disabled={activeIndex === BELAJAR_MODULES.length - 1}
              className="flex h-11 items-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-400 disabled:opacity-40"
            >
              Materi Berikutnya
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
