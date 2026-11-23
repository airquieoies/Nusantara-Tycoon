import React from 'react';
import {
  Award,
  BookOpen,
  Building2,
  ClipboardCheck,
  HelpCircle,
  Home,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CHARACTER_LIST, TEAM_IDENTITY } from '../game/data/characters';
import { AppScreen, StageNumber } from '../game/types';

interface DashboardHubProps {
  onNavigate: (screen: AppScreen) => void;
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
  onNavigate,
  onOpenPanduan,
  exp,
  completedTopicsCount,
  highestCityStage,
  bestCityScore,
  bestHotsScore,
  muted,
  onToggleMute,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Unified Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/95 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('title')}
              aria-label="Kembali ke Halaman Awal"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:text-white"
            >
              <Home className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                NUSANTARA TYCOON: KOTA ERA TANPA BATAS
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{TEAM_IDENTITY.groupName}</span>
                <span aria-hidden="true">·</span>
                <span>Kelas {TEAM_IDENTITY.className}</span>
                <span aria-hidden="true">·</span>
                <span>{TEAM_IDENTITY.subject}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300">
              <Award className="h-4 w-4" />
              <span className="font-mono-num">{exp} EXP</span>
            </div>
            <button
              type="button"
              onClick={onOpenPanduan}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white whitespace-nowrap shrink-0"
            >
              <HelpCircle className="h-4 w-4 text-amber-400" />
              Panduan
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-amber-400/50"
            >
              {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* Hero Banner + Progress Summary */}
        <section className="grid items-stretch gap-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-7">
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Pusat Kendali Wali Kota
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Pilih Mode Petualangan Sosiologi
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Pahami konsep Perubahan Sosial dan Globalisasi di Mode Belajar, bangun Kota Nusantara
                melintasi tiga zaman di Mode Bermain, lalu uji nalar analisismu pada 10 studi kasus HOTS
                di Mode Berlatih.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800 pt-5">
              <div>
                <div className="text-xs text-slate-400">Materi Tuntas</div>
                <div className="font-mono-num mt-1 text-2xl font-bold text-sky-300">
                  {completedTopicsCount}/6
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Rekor Kota</div>
                <div className="font-mono-num mt-1 text-2xl font-bold text-amber-300">
                  {bestCityScore} · Stg {highestCityStage}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Nilai HOTS</div>
                <div className="font-mono-num mt-1 text-2xl font-bold text-emerald-300">
                  {bestHotsScore !== null ? `${bestHotsScore}/100` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-5">
            <img
              src="/assets/aistudio/Tambahkan_judul_c31d145c.png"
              alt="Panorama Kota Nusantara Isometrik"
              referrerPolicy="no-referrer"
              className="h-full min-h-[220px] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-5">
              <p className="text-sm font-semibold text-white">
                "Menjadi kota yang mendunia bukan berarti harus kehilangan jati diri."
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Ekonomi Global · IPTEK · Kearifan Lokal
              </p>
            </div>
          </div>
        </section>

        {/* 3 Main Modes Cards */}
        <section aria-label="Menu Utama Mode Permainan" className="grid gap-6 md:grid-cols-3">
          {/* Mode Belajar */}
          <div className="flex flex-col justify-between rounded-2xl border border-sky-500/30 bg-slate-900 p-6 transition-transform hover:-translate-y-0.5">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-sky-300">Proses 1 · Ensiklopedia Interaktif</div>
              <h3 className="mt-1 text-xl font-bold text-white">1. Mode Belajar</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                6 submateri lengkap: Pengertian & Ahli, Ciri-ciri, Bentuk-bentuk, Teori Held & McGrew,
                World System Theory Wallerstein, Timeline Sejarah, dan Dampak Globalisasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('belajar')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-400"
            >
              <BookOpen className="h-4 w-4" />
              Buka Mode Belajar
            </button>
          </div>

          {/* Mode Bermain */}
          <div className="flex flex-col justify-between rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-lg shadow-amber-500/5 transition-transform hover:-translate-y-0.5">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-amber-300">Proses 2 · City Strategy & Simulation</div>
              <h3 className="mt-1 text-xl font-bold text-white">2. Mode Bermain</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Jelajahi dunia terbuka 3D di Stage 1 (Kota Perdagangan) dan berlayar ke Stage 2 (Kota
                Industri Global) dengan lini produksi, rantai pasok, serta fitur Multiplayer opsional.
                Stage 3 menunggu pembaruan berikutnya!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('bermain')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
            >
              <Building2 className="h-4 w-4" />
              Mainkan Nusantara Tycoon
            </button>
          </div>

          {/* Mode Berlatih */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 transition-transform hover:-translate-y-0.5">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-emerald-300">Proses 3 · Evaluasi HOTS</div>
              <h3 className="mt-1 text-xl font-bold text-white">3. Mode Berlatih</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                10 soal studi kasus Sosiologi Kelas XII berbasis HOTS dengan umpan balik instan,
                pembahasan mendalam, dan Rapor Evaluasi Akhir beserta Gelar Sosiolog Muda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('berlatih')}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              <ClipboardCheck className="h-4 w-4" />
              Mulai Kuis HOTS (10 Soal)
            </button>
          </div>
        </section>

        {/* Character Advisors Strip */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-white">
              Dewan Penasihat Kota Nusantara (3 Perspektif Teori Globalisasi)
            </h3>
            <span className="text-xs text-slate-400">
              David Held & Anthony McGrew
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CHARACTER_LIST.map((char) => (
              <div
                key={char.id}
                className="flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <img
                  src={char.avatarSrc}
                  alt={char.name}
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 shrink-0 rounded-xl border border-slate-700 object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{char.name}</span>
                    <span className="text-xs text-slate-400">· {char.theory}</span>
                  </div>
                  <p className={`text-xs font-medium ${char.textAccentClass}`}>{char.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{char.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
