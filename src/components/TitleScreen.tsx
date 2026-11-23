import React from 'react';
import {
  ArrowRight,
  Award,
  Backpack,
  Building2,
  ChevronDown,
  Compass,
  HelpCircle,
  Layers,
  MapPin,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TEAM_IDENTITY } from '../game/data/characters';
import { GlobalProgressionSummary } from '../game/multiStageLogic';
import { StageNumber } from '../game/types';

interface TitleScreenProps {
  summary: GlobalProgressionSummary;
  learningExp: number;
  completedTopicsCount: number;
  bestHotsScore: number | null;
  onStartHub: () => void;
  onQuickPlay: (stage?: StageNumber) => void;
  onOpenPanduan: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

const GAMEPLAY_PILLARS = [
  {
    key: 'explore',
    label: 'EXPLORE',
    title: 'Jelajahi Dunia 3D Terbuka',
    desc: 'Telusuri distrik pelabuhan, kawasan pabrik, hingga pusat smart city, masuki interior bangunan, dan kendarai kendaraan era masing-masing.',
    icon: Compass,
    accent: 'text-amber-400',
  },
  {
    key: 'missions',
    label: 'COMPLETE MISSIONS',
    title: 'Selesaikan Misi & Dilema Sosial',
    desc: 'Hadapi studi kasus nyata globalisasi—dari jalur rempah dan hak buruh hingga glokalisasi UMKM dan literasi digital.',
    icon: Target,
    accent: 'text-sky-400',
  },
  {
    key: 'build',
    label: 'BUILD',
    title: 'Bangun & Tingkatkan Kota',
    desc: 'Rancang tata kota dengan bangunan perdagangan, industri, riset, ruang hijau, dan landmark khas Nusantara yang dapat di-upgrade.',
    icon: Building2,
    accent: 'text-emerald-400',
  },
  {
    key: 'collect',
    label: 'COLLECT',
    title: 'Koleksi Artefak & Kostum',
    desc: 'Temukan artefak langka di tiap distrik, buka cetak biru khusus, dan kustomisasi penampilan karaktermu di Studio Karakter.',
    icon: Backpack,
    accent: 'text-amber-300',
  },
  {
    key: 'progress',
    label: 'PROGRESS',
    title: 'Tumbuh Melintasi Tiga Era',
    desc: 'Naikkan level Wali Kota, raih gelar kehormatan, kumpulkan pencapaian lintas era, dan pertahankan progresmu kapan saja.',
    icon: TrendingUp,
    accent: 'text-cyan-300',
  },
] as const;

export const TitleScreen: React.FC<TitleScreenProps> = ({
  summary,
  learningExp,
  completedTopicsCount,
  bestHotsScore,
  onStartHub,
  onQuickPlay,
  onOpenPanduan,
  muted,
  onToggleMute,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-100">
      {/* Top Launcher Navigation Bar — Single Clean Row */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060a14]/88 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3.5 py-3 sm:gap-4 sm:px-5 lg:px-10">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <svg viewBox="0 0 48 48" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" aria-hidden="true">
              <polygon
                points="24,3 44,14 44,34 24,45 4,34 4,14"
                fill="#0b1222"
                stroke="#f59e0b"
                strokeWidth="2.4"
              />
              <path d="M15 32V20l9-7 9 7v12h-5v-7h-8v7h-5z" fill="#f59e0b" />
              <circle cx="24" cy="18" r="2.2" fill="#0b1222" />
            </svg>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs font-extrabold tracking-wider text-white uppercase sm:text-sm">
                Nusantara Tycoon
              </div>
              <div className="truncate text-[10px] font-medium text-amber-400/90 sm:text-[11px]">
                Kota Era Tanpa Batas
              </div>
            </div>
          </div>

          <nav aria-label="Navigasi Beranda" className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection('beranda')}
              className="text-xs font-semibold tracking-wide text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tiga-era')}
              className="text-xs font-semibold tracking-wide text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Tiga Era
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('gameplay')}
              className="text-xs font-semibold tracking-wide text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Gameplay
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('progres')}
              className="text-xs font-semibold tracking-wide text-slate-300 transition-colors hover:text-amber-300 whitespace-nowrap"
            >
              Progres
            </button>
          </nav>

          <div className="flex items-center gap-1.5 shrink-0 sm:gap-2.5">
            <button
              type="button"
              onClick={onOpenPanduan}
              aria-label="Panduan"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-slate-900/90 px-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white whitespace-nowrap shrink-0 sm:px-3"
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
            <button
              type="button"
              onClick={onStartHub}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0 sm:px-3.5"
            >
              <span className="sm:hidden">Masuk</span>
              <span className="hidden sm:inline">Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. CINEMATIC HERO SECTION — Real 3D Nusantara Skyline Backdrop */}
        <section
          id="beranda"
          className="relative flex min-h-[86vh] items-center overflow-hidden border-b border-white/10"
        >
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/assets/stages/hero-nusantara-skyline.png"
              alt="Panorama 3D Kota Digital Masa Depan Nusantara Tycoon"
              className="h-full w-full object-cover object-center scale-[1.02]"
            />
            {/* Layered midnight-navy scrims: legible left text + vivid right 3D towers */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a14]/96 via-[#060a14]/72 via-55% to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-[#060a14]/50" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 lg:px-10 lg:py-24">
            <div className="max-w-2xl space-y-6">
              <div className="text-xs font-bold tracking-[0.22em] text-amber-400 uppercase">
                Simulasi Peradaban 3D · {TEAM_IDENTITY.subject}
              </div>

              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[64px] lg:leading-[1.04]">
                NUSANTARA TYCOON
                <span className="mt-2 block text-2xl font-bold tracking-tight text-amber-400 sm:text-3xl lg:text-4xl">
                  Kota Era Tanpa Batas
                </span>
              </h1>

              <p className="text-lg font-semibold text-amber-100/95 sm:text-xl">
                Bangun Peradaban. Taklukkan Tantangan. Ciptakan Masa Depan.
              </p>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Pimpin evolusi Kota Nusantara dari pelabuhan niaga rempah hingga metropolis digital
                masa depan. Jelajahi dunia 3D terbuka, bangun fasilitas strategis, selesaikan misi
                sosial-ekonomi, dan jaga jati diri bangsa di tengah arus globalisasi.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  data-start="true"
                  onClick={onStartHub}
                  className="flex h-12 items-center gap-2.5 rounded-xl bg-amber-500 px-6 text-sm font-extrabold tracking-wide text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.99] whitespace-nowrap shrink-0"
                >
                  <Play className="h-4 w-4 fill-current" />
                  MASUK KE DUNIA NUSANTARA
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('tiga-era')}
                  className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-slate-950/75 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-amber-400/60 hover:bg-slate-900 whitespace-nowrap shrink-0"
                >
                  <span>JELAJAHI TIGA ERA</span>
                  <ChevronDown className="h-4 w-4 text-amber-400" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-slate-400">
                <span>Tekan Enter untuk masuk ke Dashboard</span>
                <span>
                  Era Aktif:{' '}
                  <strong className="text-amber-300">
                    Stage {summary.activeStage} · {summary.activeStageName}
                  </strong>
                </span>
                <span className="font-mono-num">
                  Level <strong className="text-white">{summary.playerLevel}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. YOUR JOURNEY. YOUR LEGACY. — 3 Real Stage Worlds */}
        <section id="tiga-era" className="border-b border-white/10 bg-[#080d1a] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="max-w-3xl space-y-3">
              <div className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                Your Journey. Your Legacy.
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Tiga era. Tiga tantangan. Satu peradaban yang kamu bangun.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Memimpin perkembangan peradaban Nusantara melalui tiga fase sejarah yang saling
                terhubung. Setiap era menghadirkan peta 3D terbuka, distrik baru, misi tematik,
                kendaraan, dan tantangan strategi tersendiri.
              </p>
            </div>

            <div className="mt-12 grid gap-7 lg:grid-cols-3">
              {summary.stages.map((st) => (
                <article
                  key={st.stage}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1425] transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/45 hover:shadow-2xl hover:shadow-black/60"
                >
                  {/* Real 3D Game World Screenshot */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={st.imageSrc}
                      alt={`Dunia 3D Stage ${st.stage}: ${st.name}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1425] via-[#0d1425]/20 to-transparent" />
                    <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase">
                      <span className="rounded bg-[#060a14]/85 px-2.5 py-1 text-amber-300 backdrop-blur-sm">
                        Stage {st.stage}
                      </span>
                      <span
                        className={`rounded px-2.5 py-1 backdrop-blur-sm ${
                          st.isActive
                            ? 'bg-amber-500/90 text-slate-950'
                            : st.unlocked
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-900/90 text-slate-400'
                        }`}
                      >
                        {st.isActive ? 'Sedang Aktif' : st.unlocked ? 'Terbuka' : 'Terkunci'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{st.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-amber-400/90">{st.identity}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">{st.storyDesc}</p>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-white/10 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-slate-400">Misi</div>
                          <div className="font-mono-num mt-0.5 font-bold text-white">
                            {st.questsCompleted}/{st.questsTotal}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Distrik</div>
                          <div className="font-mono-num mt-0.5 font-bold text-white">
                            {st.districtsDiscovered}/{st.districtsTotal}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Bangunan</div>
                          <div className="font-mono-num mt-0.5 font-bold text-white">
                            {st.placedBuildingsCount}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Progres Era</span>
                          <span className="font-mono-num font-bold text-amber-300">
                            {st.progressPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                            style={{ width: `${Math.max(4, st.progressPercent)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onQuickPlay(st.stage)}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500 hover:text-slate-950"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Masuk ke Stage {st.stage}: {st.name}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. GAMEPLAY LOOP SECTION */}
        <section id="gameplay" className="border-b border-white/10 bg-[#060a14] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="space-y-4 lg:col-span-5">
                <div className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                  Gameplay Loop
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Every city has a story. Every decision changes its future.
                </h2>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                  Bukan sekadar simulasi angka: jelajahi jalanan kota secara langsung, dengarkan
                  aspirasi warga, bangun struktur strategis di lahan kosong, dan saksikan kota
                  bereaksi terhadap kebijakanmu.
                </p>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1425]">
                  <img
                    src="/assets/stages/stage2-kota-industri.png"
                    alt="Aktivitas Industri dan Produksi di Mode Bermain 3D"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-300">
                    <span>Simulasi Kota 3D · Bangunan, NPC & Transportasi</span>
                    <button
                      type="button"
                      onClick={() => onQuickPlay()}
                      className="font-bold text-amber-400 hover:text-amber-300"
                    >
                      Coba Sekarang →
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                {GAMEPLAY_PILLARS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`rounded-2xl border border-white/10 bg-[#0b1120] p-5 transition-colors hover:border-amber-500/35 ${
                        idx === 4 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold tracking-[0.18em] ${item.accent}`}>
                          {item.label}
                        </span>
                        <Icon className={`h-4 w-4 ${item.accent}`} />
                      </div>
                      <h3 className="mt-2.5 text-base font-bold text-white">{item.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. BUILD YOUR LEGACY — Genuine Player Progression Section */}
        <section id="progres" className="bg-[#080d1a] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl space-y-2.5">
                <div className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
                  Build Your Legacy
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Rekam Jejak Wali Kota Nusantara
                </h2>
                <p className="text-sm text-slate-300 sm:text-base">
                  Seluruh level, misi, koleksi, kostum, dan bangunan kotamu tersimpan otomatis dan
                  terbawa di seluruh era.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onStartHub}
                  className="flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-400 whitespace-nowrap"
                >
                  <Layers className="h-4 w-4" />
                  Buka Dashboard Game
                </button>
                <button
                  type="button"
                  onClick={() => onQuickPlay()}
                  className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-slate-900 px-5 text-xs font-bold text-white transition-colors hover:border-amber-400/50 whitespace-nowrap"
                >
                  <Play className="h-3.5 w-3.5 text-amber-400" />
                  Lanjutkan Bermain
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              {/* Left Identity & Development Progress Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-amber-500/25 bg-[#0d1425] p-6 lg:col-span-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      Profil Tersimpan
                    </span>
                    <span className="font-mono-num text-xs font-bold text-slate-300">
                      {summary.coins.toLocaleString('id-ID')} Koin
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-extrabold text-white">{summary.displayName}</h3>
                  <p className="mt-1 text-sm font-semibold text-amber-300">
                    Level {summary.playerLevel} · {summary.equippedTitleLabel}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Stage Saat Ini:{' '}
                    <strong className="text-slate-200">
                      Stage {summary.activeStage} — {summary.activeStageName}
                    </strong>
                  </p>
                </div>

                <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">XP Menuju Level Berikutnya</span>
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
                      <span className="text-slate-300">Kemajuan Peradaban (3 Era)</span>
                      <span className="font-mono-num font-bold text-emerald-300">
                        {summary.cityDevelopmentProgress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${Math.max(3, summary.cityDevelopmentProgress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Genuine Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-7">
                {[
                  {
                    label: 'Misi Selesai',
                    value: `${summary.completedMissions}/${summary.totalMissions}`,
                    sub: 'Total lintas 3 era',
                    icon: Target,
                    color: 'text-amber-300',
                  },
                  {
                    label: 'Kota Dikembangkan',
                    value: `${summary.citiesDeveloped}/3`,
                    sub: `${summary.placedBuildingsCount} bangunan berdiri`,
                    icon: Building2,
                    color: 'text-emerald-300',
                  },
                  {
                    label: 'Pencapaian',
                    value: `${summary.achievementsUnlocked}/${summary.achievementsTotal}`,
                    sub: 'Gelar & lencana terbuka',
                    icon: Award,
                    color: 'text-amber-400',
                  },
                  {
                    label: 'Kostum Terbuka',
                    value: `${summary.costumesUnlocked}/${summary.costumesTotal}`,
                    sub: 'Studio Karakter 3D',
                    icon: Sparkles,
                    color: 'text-sky-300',
                  },
                  {
                    label: 'Koleksi Artefak',
                    value: `${summary.collectiblesFound}/${summary.collectiblesTotal}`,
                    sub: `${summary.districtsDiscovered}/${summary.districtsTotal} distrik`,
                    icon: Backpack,
                    color: 'text-cyan-300',
                  },
                  {
                    label: 'Belajar & HOTS',
                    value: bestHotsScore !== null ? `${bestHotsScore}/100` : `${completedTopicsCount}/6`,
                    sub: `${learningExp} EXP Akademik`,
                    icon: ShieldCheck,
                    color: 'text-emerald-400',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1425] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div className={`font-mono-num mt-3 text-2xl font-extrabold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">{stat.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Credits Footer */}
      <footer className="border-t border-white/10 bg-[#050811] px-5 py-6 text-xs text-slate-400 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>
            Nusantara Tycoon: Kota Era Tanpa Batas · {TEAM_IDENTITY.subject} ({TEAM_IDENTITY.className})
          </span>
          <span>
            {TEAM_IDENTITY.groupName}: {TEAM_IDENTITY.members.join(' · ')}
          </span>
        </div>
      </footer>
    </div>
  );
};
