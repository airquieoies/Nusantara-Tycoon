import React from 'react';
import {
  Award,
  Backpack,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  HelpCircle,
  Home,
  MapPin,
  Play,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TEAM_IDENTITY } from '../game/data/characters';
import { GlobalProgressionSummary } from '../game/multiStageLogic';
import { AppScreen, StageNumber } from '../game/types';

interface DashboardHubProps {
  summary: GlobalProgressionSummary;
  onNavigate: (screen: AppScreen) => void;
  onPlayStage: (stage?: StageNumber) => void;
  onOpenPanduan: () => void;
  exp: number;
  completedTopicsCount: number;
  highestCityStage: StageNumber;
  bestCityScore: number;
  bestHotsScore: number | null;
  muted: boolean;
  onToggleMute: () => void;
}

export const DashboardHub: React.FC<DashboardHubProps> = ({
  summary,
  onNavigate,
  onPlayStage,
  onOpenPanduan,
  exp,
  completedTopicsCount,
  highestCityStage,
  bestCityScore,
  bestHotsScore,
  muted,
  onToggleMute,
}) => {
  const activeStageSnapshot =
    summary.stages.find((st) => st.stage === summary.activeStage) ?? summary.stages[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const learningProgressPct = Math.round((completedTopicsCount / 6) * 100);

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Launcher Navigation Bar — Single Clean Row on Desktop */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070c18]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-10">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('title')}
              aria-label="Kembali ke Beranda"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-slate-900/90 text-slate-300 transition-colors hover:border-amber-400/50 hover:text-white shrink-0"
            >
              <Home className="h-4 w-4" />
            </button>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-wider text-white uppercase">
                Nusantara Tycoon
              </div>
              <div className="text-[11px] font-medium text-amber-400/90">
                Pusat Kendali Peradaban
              </div>
            </div>
          </div>

          <nav
            aria-label="Navigasi Dashboard"
            className="hidden items-center gap-5 xl:flex"
          >
            <button
              type="button"
              onClick={() => onNavigate('title')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => onPlayStage(summary.activeStage)}
              className="text-xs font-bold text-amber-300 transition-colors hover:text-amber-200 whitespace-nowrap"
            >
              Mulai Bermain
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pilih-era')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Pilih Era
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('progres-hub')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Progress
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('koleksi-hub')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Koleksi
            </button>
            <button
              type="button"
              onClick={() => onNavigate('belajar')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-sky-300 whitespace-nowrap"
            >
              Mode Belajar
            </button>
            <button
              type="button"
              onClick={() => onNavigate('berlatih')}
              className="text-xs font-semibold text-slate-300 transition-colors hover:text-emerald-300 whitespace-nowrap"
            >
              Mode Berlatih
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 sm:flex">
              <Award className="h-3.5 w-3.5" />
              <span className="font-mono-num">
                Lv {summary.playerLevel} · {exp} EXP
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenPanduan}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-slate-900/90 px-3 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white whitespace-nowrap shrink-0"
            >
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Panduan</span>
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-slate-900/90 text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white shrink-0"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-5 py-8 lg:px-10 lg:py-10">
        {/* Compact Quick-Jump Nav on Tablet/Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:hidden">
          <button
            type="button"
            onClick={() => onPlayStage(summary.activeStage)}
            className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 whitespace-nowrap shrink-0"
          >
            Mulai Bermain
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('pilih-era')}
            className="rounded-lg border border-white/15 bg-[#0d1425] px-3.5 py-2 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0"
          >
            Pilih Era
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('progres-hub')}
            className="rounded-lg border border-white/15 bg-[#0d1425] px-3.5 py-2 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0"
          >
            Progress
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('koleksi-hub')}
            className="rounded-lg border border-white/15 bg-[#0d1425] px-3.5 py-2 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0"
          >
            Koleksi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('belajar')}
            className="rounded-lg border border-sky-500/30 bg-[#0d1425] px-3.5 py-2 text-xs font-semibold text-sky-300 whitespace-nowrap shrink-0"
          >
            Mode Belajar
          </button>
          <button
            type="button"
            onClick={() => onNavigate('berlatih')}
            className="rounded-lg border border-emerald-500/30 bg-[#0d1425] px-3.5 py-2 text-xs font-semibold text-emerald-300 whitespace-nowrap shrink-0"
          >
            Mode Berlatih
          </button>
        </div>

        {/* 1. HERO FOCAL CARD: MODE BERMAIN — BUILD YOUR WORLD */}
        <section
          aria-label="Mode Utama Permainan"
          className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0c1324] shadow-2xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <img
              src={activeStageSnapshot.imageSrc}
              alt={`Dunia 3D ${activeStageSnapshot.name}`}
              className="h-full w-full object-cover object-center opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a14]/95 via-[#060a14]/78 to-[#060a14]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-[#060a14]/55" />
          </div>

          <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center gap-2.5 text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                <Building2 className="h-4 w-4" />
                <span>Mode Bermain · Simulasi Kota 3D Terbuka</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                BUILD YOUR WORLD
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                Jelajahi tiga era, bangun kota, selesaikan misi, temukan berbagai rahasia, dan
                ciptakan peradabanmu.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onPlayStage(summary.activeStage)}
                  className="flex h-12 items-center gap-2.5 rounded-xl bg-amber-500 px-6 text-sm font-extrabold text-slate-950 shadow-xl shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-[0.99] whitespace-nowrap"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Mainkan Mode Bermain
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('pilih-era')}
                  className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-slate-950/75 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-amber-400/50 whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Pilih Era Lainnya
                </button>
              </div>
            </div>

            {/* Active World Live Readout */}
            <div className="rounded-2xl border border-white/15 bg-[#070c18]/88 p-5 backdrop-blur-md lg:col-span-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                    Era Aktif Saat Ini
                  </div>
                  <div className="mt-0.5 text-base font-extrabold text-white">
                    Stage {summary.activeStage}: {summary.activeStageName}
                  </div>
                </div>
                <span className="font-mono-num text-xs font-bold text-amber-300">
                  {activeStageSnapshot.progressPercent}%
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-2">
                <div>
                  <div className="text-slate-400">Kas Kota</div>
                  <div className="font-mono-num mt-0.5 text-sm font-bold text-amber-300">
                    {summary.coins.toLocaleString('id-ID')} Koin
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Misi Era</div>
                  <div className="font-mono-num mt-0.5 text-sm font-bold text-white">
                    {activeStageSnapshot.questsCompleted}/{activeStageSnapshot.questsTotal}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Distrik</div>
                  <div className="font-mono-num mt-0.5 text-sm font-bold text-sky-300">
                    {activeStageSnapshot.districtsDiscovered}/{activeStageSnapshot.districtsTotal}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Rekor Skor</div>
                  <div className="font-mono-num mt-0.5 text-sm font-bold text-emerald-300">
                    {Math.max(bestCityScore, summary.bestStageScore)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. KNOWLEDGE & STRATEGY MODES: MODE BELAJAR & MODE BERLATIH */}
        <section aria-label="Mode Pembelajaran dan Evaluasi" className="grid gap-6 md:grid-cols-2">
          {/* Mode Belajar */}
          <article className="flex flex-col justify-between rounded-2xl border border-sky-500/25 bg-[#0b1222] p-6 transition-colors hover:border-sky-400/50 sm:p-7">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.18em] text-sky-400 uppercase">
                  Mode Belajar · Discover The Knowledge
                </span>
                <BookOpen className="h-5 w-5 text-sky-400" />
              </div>
              <h2 className="mt-2.5 text-2xl font-extrabold text-white">
                Ensiklopedia Sosiologi Kelas XII
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Kuasai 6 materi inti Perubahan Sosial & Globalisasi: Pengertian & Ahli, Ciri-ciri,
                Bentuk-bentuk, Teori Held & McGrew, World System Theory Wallerstein, serta Timeline
                Sejarah & Dampak Globalisasi.
              </p>

              <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-[#070b15] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progres Materi Tuntas</span>
                  <span className="font-mono-num font-bold text-sky-300">
                    {completedTopicsCount} / 6 Modul
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-sky-400 transition-all"
                    style={{ width: `${Math.max(4, learningProgressPct)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('belajar')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-extrabold text-slate-950 transition-colors hover:bg-sky-400"
            >
              <BookOpen className="h-4 w-4" />
              Buka Mode Belajar
            </button>
          </article>

          {/* Mode Berlatih */}
          <article className="flex flex-col justify-between rounded-2xl border border-emerald-500/25 bg-[#0b1222] p-6 transition-colors hover:border-emerald-400/50 sm:p-7">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.18em] text-emerald-400 uppercase">
                  Mode Berlatih · Prove Your Strategy
                </span>
                <ClipboardCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="mt-2.5 text-2xl font-extrabold text-white">
                Evaluasi Studi Kasus HOTS
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Uji ketajaman analisis kebijakanmu melalui 10 soal studi kasus nyata berbasis HOTS
                lengkap dengan umpan balik instan, pembahasan sosiologis, dan Rapor Evaluasi Akhir.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-[#070b15] p-4 text-xs">
                <div>
                  <div className="text-slate-400">Skor HOTS Terbaik</div>
                  <div className="font-mono-num mt-0.5 text-base font-extrabold text-emerald-300">
                    {bestHotsScore !== null ? `${bestHotsScore}/100` : 'Belum Diuji'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">EXP Akademik</div>
                  <div className="font-mono-num mt-0.5 text-base font-extrabold text-amber-300">
                    {exp} EXP
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('berlatih')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-extrabold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <ClipboardCheck className="h-4 w-4" />
              Mulai Kuis HOTS (10 Soal)
            </button>
          </article>
        </section>

        {/* 3. STAGE SELECTION MATRIX — 3 Real 3D Eras */}
        <section id="pilih-era" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                Pilih Era Peradaban
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Tiga Dunia 3D Nusantara Tycoon
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Karakter, kostum, koin, dan inventaris otomatis terbawa di seluruh era.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {summary.stages.map((st) => (
              <article
                key={st.stage}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-[#0c1324] transition-all hover:-translate-y-0.5 ${
                  st.isActive
                    ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={st.imageSrc}
                    alt={`Peta 3D Stage ${st.stage}: ${st.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="rounded bg-[#060a14]/85 px-2.5 py-1 text-amber-300 backdrop-blur-sm">
                      Stage {st.stage}
                    </span>
                    <span
                      className={`rounded px-2.5 py-1 backdrop-blur-sm ${
                        st.isActive
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {st.isActive ? 'Aktif' : 'Terbuka'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{st.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold text-amber-400/90">{st.identity}</p>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{st.storyDesc}</p>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="rounded-lg bg-[#070b15] p-2">
                        <div className="text-slate-400">Misi</div>
                        <div className="font-mono-num mt-0.5 font-bold text-white">
                          {st.questsCompleted}/{st.questsTotal}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#070b15] p-2">
                        <div className="text-slate-400">Distrik</div>
                        <div className="font-mono-num mt-0.5 font-bold text-sky-300">
                          {st.districtsDiscovered}/{st.districtsTotal}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#070b15] p-2">
                        <div className="text-slate-400">Artefak</div>
                        <div className="font-mono-num mt-0.5 font-bold text-amber-300">
                          {st.collectiblesFound}/{st.collectiblesTotal}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#070b15] p-2">
                        <div className="text-slate-400">Gedung</div>
                        <div className="font-mono-num mt-0.5 font-bold text-emerald-300">
                          {st.placedBuildingsCount}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPlayStage(st.stage)}
                      className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition-colors ${
                        st.isActive
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'border border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500 hover:text-slate-950'
                      }`}
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>
                        {st.isActive
                          ? `Lanjutkan Stage ${st.stage}`
                          : `Masuk ke ${st.name}`}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. PROGRESSION & COLLECTION OVERVIEW */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Progress Hub */}
          <div
            id="progres-hub"
            className="rounded-2xl border border-white/10 bg-[#0b1222] p-6 lg:col-span-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.18em] text-amber-400 uppercase">
                  Progress & Pencapaian
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  {summary.displayName === summary.equippedTitleLabel
                    ? summary.displayName
                    : `${summary.displayName} · ${summary.equippedTitleLabel}`}
                </h2>
              </div>
              <span className="font-mono-num rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                Level {summary.playerLevel}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Pengalaman Level</span>
                  <span className="font-mono-num font-bold text-amber-300">
                    {summary.xp} / {summary.xpToNext} XP
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${Math.max(4, summary.xpProgressPercent)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Pembangunan Kota Global (3 Era)</span>
                  <span className="font-mono-num font-bold text-emerald-300">
                    {summary.cityDevelopmentProgress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${Math.max(4, summary.cityDevelopmentProgress)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Target className="h-3.5 w-3.5 text-amber-400" />
                  Misi Selesai
                </div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-white">
                  {summary.completedMissions}/{summary.totalMissions}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  Bangunan
                </div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-emerald-300">
                  {summary.placedBuildingsCount}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Trophy className="h-3.5 w-3.5 text-amber-300" />
                  Era Tertinggi
                </div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-amber-300">
                  Stage {Math.max(highestCityStage, summary.activeStage)}
                </div>
              </div>
            </div>
          </div>

          {/* Collection Hub */}
          <div
            id="koleksi-hub"
            className="rounded-2xl border border-white/10 bg-[#0b1222] p-6 lg:col-span-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold tracking-[0.18em] text-sky-400 uppercase">
                  Koleksi & Studio Karakter
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-white">
                  Artefak, Kostum & Lencana
                </h2>
              </div>
              <Backpack className="h-5 w-5 text-sky-400" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5">
                <div className="text-xs text-slate-400">Artefak</div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-amber-300">
                  {summary.collectiblesFound}/{summary.collectiblesTotal}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5">
                <div className="text-xs text-slate-400">Kostum</div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-sky-300">
                  {summary.costumesUnlocked}/{summary.costumesTotal}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#070b15] p-3.5">
                <div className="text-xs text-slate-400">Pencapaian</div>
                <div className="font-mono-num mt-1 text-lg font-extrabold text-emerald-300">
                  {summary.achievementsUnlocked}/{summary.achievementsTotal}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Busana & Aksesori Terbuka ({summary.unlockedCostumeLabels.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {summary.unlockedCostumeLabels.slice(0, 6).map((c) => (
                    <span
                      key={c.id}
                      className="rounded-md border border-white/10 bg-[#070b15] px-2.5 py-1 text-[11px] font-medium text-slate-200"
                    >
                      {c.label}
                    </span>
                  ))}
                  {summary.unlockedCostumeLabels.length > 6 && (
                    <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
                      +{summary.unlockedCostumeLabels.length - 6} lainnya
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    Pencapaian Terbaru ({summary.unlockedAchievementTitles.length})
                  </span>
                </div>
                {summary.unlockedAchievementTitles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {summary.unlockedAchievementTitles.slice(-4).map((ach) => (
                      <span
                        key={ach.id}
                        className="rounded-md border border-emerald-500/25 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-medium text-emerald-200"
                      >
                        Stage {ach.stage}: {ach.title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Selesaikan misi, jelajahi distrik, atau temukan artefak di Mode Bermain untuk
                    membuka lencana pencapaian.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Credits Footer */}
      <footer className="border-t border-white/10 bg-[#050811] px-5 py-5 text-xs text-slate-400 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>
            {TEAM_IDENTITY.groupName} · Kelas {TEAM_IDENTITY.className} · {TEAM_IDENTITY.subject}
          </span>
          <span>{TEAM_IDENTITY.members.join(' · ')}</span>
        </div>
      </footer>
    </div>
  );
};
