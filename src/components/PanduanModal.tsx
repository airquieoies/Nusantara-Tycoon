import React from 'react';
import { BookOpen, Building2, CheckCircle2, HelpCircle, ShieldCheck, X } from 'lucide-react';
import { CHARACTER_LIST, TEAM_IDENTITY } from '../game/data/characters';

interface PanduanModalProps {
  open: boolean;
  onClose: () => void;
}

export const PanduanModal: React.FC<PanduanModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panduan-title"
    >
      <div className="animate-pop-in relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            <h2 id="panduan-title" className="text-xl font-bold text-white">
              Panduan Permainan & Profil Proyek
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6">
          {/* Core Mission */}
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <h3 className="mb-2 text-base font-semibold text-amber-300">
              Tujuan Utama Wali Kota Nusantara
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Kembangkan Kota Nusantara melalui tiga era sejarah: <strong className="text-white">Stage 1 (Kota Perdagangan)</strong>,{' '}
              <strong className="text-white">Stage 2 (Kota Industri Global)</strong>, dan{' '}
              <strong className="text-white">Stage 3 (Kota Digital Tanpa Batas)</strong>.
              Seimbangkan tiga pilar kota: <strong className="text-sky-300">Ekonomi Global</strong>,{' '}
              <strong className="text-cyan-300">IPTEK</strong>, dan{' '}
              <strong className="text-emerald-300">Kearifan Lokal</strong> sambil menjaga{' '}
              <strong className="text-rose-300">HP Kota</strong> agar tidak habis.
            </p>
          </section>

          {/* 3 Modes */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-sky-300">
                <BookOpen className="h-4 w-4" />
                <h4 className="font-semibold">1. Mode Belajar</h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Pelajari 6 materi inti Sosiologi Kelas XII melalui kartu flashcard interaktif,
                diagram World System Theory Wallerstein, dan timeline sejarah globalisasi untuk mengumpulkan EXP.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-300">
                <Building2 className="h-4 w-4" />
                <h4 className="font-semibold">2. Mode Bermain</h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Pilih bangunan dari menu Pembangunan lalu klik petak kosong pada peta isometrik.
                Selesaikan studi kasus sosiologi di setiap stage dan raih Skor minimal 70 untuk menang.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <h4 className="font-semibold">3. Mode Berlatih</h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Uji kemampuan berpikir tingkat tinggi (HOTS) melalui 10 soal studi kasus nyata beserta
                pembahasan sosiologis dan Rapor Evaluasi Akhir.
              </p>
            </div>
          </div>

          {/* 3 Main Characters */}
          <section>
            <h3 className="mb-3 text-base font-semibold text-white">
              Tiga Penasihat Utama Kota Nusantara
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {CHARACTER_LIST.map((char) => (
                <div
                  key={char.id}
                  className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={char.avatarSrc}
                      alt={`Avatar ${char.name}`}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-white">{char.name}</h4>
                      <p className={`text-xs font-medium ${char.textAccentClass}`}>{char.title}</p>
                      <p className="text-xs text-slate-400">Teori: {char.theory}</p>
                    </div>
                  </div>
                  <p className="mb-2 text-xs text-slate-300">{char.focus}</p>
                  <p className="mt-auto text-xs italic text-slate-400">"{char.signatureQuote}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* Official Design Reference Gallery */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-17_at_11.34.54_AM_677eaaec.jpeg"
                alt="Desain Karakter Resmi Aditya, Laras, dan Naya"
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover object-top"
              />
              <div className="p-3">
                <p className="text-xs font-medium text-slate-200">
                  Lembar Desain Karakter Resmi: Aditya, Laras, dan Naya
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
              <img
                src="/assets/aistudio/Tambahkan_judul_c31d145c.png"
                alt="Referensi Tata Kota Isometrik Nusantara"
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover"
              />
              <div className="p-3">
                <p className="text-xs font-medium text-slate-200">
                  Referensi Desain Tata Kota Isometrik Mode Bermain
                </p>
              </div>
            </div>
          </section>

          {/* Group Identity */}
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                {TEAM_IDENTITY.groupName} · Kelas {TEAM_IDENTITY.className} · {TEAM_IDENTITY.subject}
              </span>
            </div>
            <div className="grid gap-1 text-xs text-slate-300 sm:grid-cols-2 md:grid-cols-3">
              {TEAM_IDENTITY.members.map((member) => (
                <div key={member}>{member}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
