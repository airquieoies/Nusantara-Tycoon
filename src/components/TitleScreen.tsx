import React from 'react';
import { BookOpen, HelpCircle, Play, Volume2, VolumeX } from 'lucide-react';
import { CHARACTER_LIST, TEAM_IDENTITY } from '../game/data/characters';

interface TitleScreenProps {
  onStartHub: () => void;
  onQuickPlay: () => void;
  onOpenPanduan: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartHub,
  onQuickPlay,
  onOpenPanduan,
  muted,
  onToggleMute,
}) => {
  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-950 text-slate-100">
      {/* Illustrated Key-Art Backdrop from attached City Reference */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/assets/aistudio/Tambahkan_judul_c31d145c.png"
          alt="Ilustrasi Kota Nusantara"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-slate-950/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80" />
      </div>

      {/* Top Bar: Identity + Audio & Guide */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300">
          <span className="font-semibold text-amber-300">{TEAM_IDENTITY.groupName}</span>
          <span aria-hidden="true">·</span>
          <span>Kelas {TEAM_IDENTITY.className}</span>
          <span aria-hidden="true">·</span>
          <span>{TEAM_IDENTITY.subject}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPanduan}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white whitespace-nowrap shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-amber-400" />
            Panduan
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/90 text-slate-200 transition-colors hover:border-amber-400/50 hover:text-white"
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Split Showcase */}
      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-8 lg:grid-cols-12 lg:px-12">
        {/* Left: Custom SVG Emblem + Title + Primary CTA */}
        <div className="space-y-6 lg:col-span-6">
          {/* Custom inline SVG Nusantara Crest Emblem */}
          <div className="inline-flex items-center gap-3">
            <svg
              viewBox="0 0 48 48"
              className="h-12 w-12 shrink-0"
              aria-hidden="true"
            >
              <polygon
                points="24,3 44,14 44,34 24,45 4,34 4,14"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2.5"
              />
              <path
                d="M15 32V20l9-7 9 7v12h-5v-7h-8v7h-5z"
                fill="#F59E0B"
              />
              <circle cx="24" cy="18" r="2.2" fill="#0F172A" />
            </svg>
            <div className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
              Perubahan Sosial & Globalisasi
            </div>
          </div>

          <h1 className="max-w-xl text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            NUSANTARA TYCOON
            <span className="mt-2 block text-2xl font-bold text-amber-400 sm:text-3xl">
              Kota Era Tanpa Batas
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-slate-300">
            Menjadi kota yang mendunia bukan berarti kehilangan jati diri. Pimpin Kota Nusantara
            dari pelabuhan rempah kuno hingga kota digital modern dengan menyeimbangkan Ekonomi Global,
            IPTEK, dan Kearifan Lokal.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              data-start="true"
              onClick={onStartHub}
              className="flex h-12 items-center gap-2.5 rounded-xl bg-amber-500 px-7 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.99] whitespace-nowrap shrink-0"
            >
              <Play className="h-4 w-4 fill-current" />
              Mulai Dashboard Game
            </button>

            <button
              type="button"
              onClick={onQuickPlay}
              className="flex h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 text-sm font-semibold text-white transition-colors hover:border-sky-400/60 hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4 text-sky-400" />
              Langsung Bangun Kota
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Tekan Enter untuk masuk · 3 Mode Terintegrasi: Belajar · Bermain · Berlatih HOTS
          </p>
        </div>

        {/* Right: Character Trio + 3 Stage Preview Cards */}
        <div className="space-y-5 lg:col-span-6">
          <div className="grid grid-cols-3 gap-3">
            {CHARACTER_LIST.map((char, idx) => (
              <div
                key={char.id}
                style={{ animationDelay: `${idx * 0.35}s` }}
                className="animate-float-slow overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-xl"
              >
                <div className="aspect-[4/4.3] overflow-hidden bg-slate-800">
                  <img
                    src={char.avatarSrc}
                    alt={`${char.name} - ${char.title}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-white">{char.name}</div>
                  <div className={`text-xs font-medium ${char.textAccentClass}`}>{char.theory}</div>
                  <div className="mt-1 text-xs leading-snug text-slate-400">{char.profession}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 3 Stages Strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Stage 1 · Perdagangan Kuno',
                img: '/assets/aistudio/Tambahkan_judul__1__5ad5298b.png',
              },
              {
                label: 'Stage 2 · Industri Global',
                img: '/assets/aistudio/Tambahkan_judul__2__81566d0d.png',
              },
              {
                label: 'Stage 3 · Kota Digital Hijau',
                img: '/assets/aistudio/Tambahkan_judul__3__9ee52f2a.png',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900"
              >
                <div className="h-20 w-full overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.label}
                    referrerPolicy="no-referrer"
                    className="h-full w-full scale-110 object-cover object-left-bottom opacity-90"
                  />
                </div>
                <div className="bg-slate-950/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 truncate">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Safe Margin Credits */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/70 px-6 py-4 text-xs text-slate-400 lg:px-12">
        <span>
          Disusun oleh {TEAM_IDENTITY.groupName} ({TEAM_IDENTITY.className}): {TEAM_IDENTITY.members.join(' · ')}
        </span>
      </footer>
    </main>
  );
};
