import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCcw,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { audioEngine } from '../game/audio';
import { HOTS_QUESTIONS } from '../game/data/berlatihData';
import { CHARACTERS, CHARACTER_LIST } from '../game/data/characters';
import { computeHotsEvaluation } from '../game/rules';

interface ModeBerlatihProps {
  onBackDashboard: () => void;
  onSaveScore: (score: number) => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const ModeBerlatih: React.FC<ModeBerlatihProps> = ({
  onBackDashboard,
  onSaveScore,
  muted,
  onToggleMute,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedLabel, setSelectedLabel] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [finished, setFinished] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  const currentQ = HOTS_QUESTIONS[currentIndex];
  const speaker = CHARACTERS[currentQ.speaker];
  const isAnswered = selectedLabel !== null;
  const isCorrect = selectedLabel === currentQ.correctLabel;

  const correctCount = Object.entries(answers).reduce((acc, [qId, ans]) => {
    const q = HOTS_QUESTIONS.find((item) => item.id === Number(qId));
    return q && q.correctLabel === ans ? acc + 1 : acc;
  }, 0);

  const handleSelectOption = (label: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    audioEngine.unlockOnGesture();
    setSelectedLabel(label);
    const updated = { ...answers, [currentQ.id]: label };
    setAnswers(updated);

    if (label === currentQ.correctLabel) {
      audioEngine.playCorrect();
    } else {
      audioEngine.playError();
      setShake(true);
      window.setTimeout(() => setShake(false), 380);
    }
  };

  const handleNext = () => {
    audioEngine.playClick();
    if (currentIndex + 1 < HOTS_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedLabel(null);
    } else {
      const evalRes = computeHotsEvaluation(correctCount, HOTS_QUESTIONS.length);
      onSaveScore(evalRes.score);
      audioEngine.playLevelUp();
      setFinished(true);
    }
  };

  const handleRetry = () => {
    audioEngine.playClick();
    setCurrentIndex(0);
    setSelectedLabel(null);
    setAnswers({});
    setFinished(false);
  };

  const evaluation = computeHotsEvaluation(correctCount, HOTS_QUESTIONS.length);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${shake ? 'animate-screen-shake' : ''}`}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioEngine.playClick();
                onBackDashboard();
              }}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-slate-200 hover:text-white whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Mode Berlatih · Simulasi Kuis HOTS</h1>
              <p className="text-xs text-slate-400">
                10 Studi Kasus Sosiologi Globalisasi Kelas XII
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Aktifkan Audio' : 'Bisukan Audio'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200"
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
        {!finished ? (
          <div className="space-y-4">
            {/* Progress & Live Score */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
              <div>
                <div className="text-[11px] text-slate-400">Progres Soal</div>
                <div className="font-mono-num text-base font-bold text-white">
                  Soal {currentIndex + 1} / {HOTS_QUESTIONS.length}
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / HOTS_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Skor Sementara</div>
                <div className="font-mono-num text-base font-bold text-emerald-300">
                  {correctCount * 10} Poin
                </div>
              </div>
            </div>

            {/* Question Card with Character Speaker */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
                <img
                  src={speaker.avatarSrc}
                  alt={speaker.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-700 object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-white">{speaker.name}</span>
                    <span className={speaker.textAccentClass}>{speaker.title}</span>
                    <span className="text-slate-400">· {currentQ.topicTag}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Analisis kasus berikut secara kritis sebelum memilih jawaban terbaik.
                  </p>
                </div>
              </div>

              {/* Case Scenario */}
              <div className="mt-3.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-sm leading-relaxed text-slate-200">
                {currentQ.scenario}
              </div>

              <h2 className="mt-3.5 text-base font-bold leading-snug text-white">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="mt-3 space-y-2">
                {currentQ.options.map((opt) => {
                  const isPicked = selectedLabel === opt.label;
                  const isRightOpt = opt.label === currentQ.correctLabel;
                  let style =
                    'border-slate-700 bg-slate-800/60 text-slate-100 hover:border-sky-400/60 hover:bg-slate-800';
                  if (isAnswered) {
                    if (isRightOpt) {
                      style = 'border-emerald-500 bg-emerald-500/15 text-emerald-100';
                    } else if (isPicked && !isRightOpt) {
                      style = 'border-rose-500 bg-rose-500/15 text-rose-100';
                    } else {
                      style = 'border-slate-800 bg-slate-900/50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt.label)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${style}`}
                    >
                      <span className="font-mono-num font-bold text-amber-300">{opt.label}.</span>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Sociological Feedback */}
              {isAnswered && (
                <div className="animate-pop-in mt-4 space-y-2 rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-300">
                            Benar! Analisis Sosiologismu Tepat
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-rose-400" />
                          <span className="text-sm font-bold text-rose-300">
                            Kurang Tepat — Jawaban Benar: {currentQ.correctLabel}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-bold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
                    >
                      {currentIndex + 1 < HOTS_QUESTIONS.length
                        ? 'Soal Berikutnya'
                        : 'Lihat Rapor Evaluasi Akhir'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200">{currentQ.explanation}</p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    <strong className="text-slate-300">Catatan opsi lain: </strong>
                    {currentQ.distractorNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Rapor Evaluasi Akhir */
          <div className="animate-pop-in space-y-6 rounded-2xl border border-emerald-500/30 bg-slate-900 p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                <Award className="h-8 w-8" />
              </div>
              <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
                Rapor Evaluasi Akhir Mode Berlatih
              </div>
              <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                {evaluation.badgeTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
                {evaluation.summaryMessage}
              </p>
            </div>

            {/* 4 Metrics */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-xs text-slate-400">Nilai Akhir</div>
                <div className="font-mono-num mt-1 text-3xl font-extrabold text-amber-300">
                  {evaluation.score}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Jawaban Benar</div>
                <div className="font-mono-num mt-1 text-3xl font-extrabold text-emerald-300">
                  {correctCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Jawaban Salah</div>
                <div className="font-mono-num mt-1 text-3xl font-extrabold text-rose-300">
                  {HOTS_QUESTIONS.length - correctCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Persentase</div>
                <div className="font-mono-num mt-1 text-3xl font-extrabold text-sky-300">
                  {evaluation.percentage}%
                </div>
              </div>
            </div>

            {/* Feedback from Aditya, Laras, and Naya */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">
                Pesan Evaluasi Dewan Penasihat Kota Nusantara
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {CHARACTER_LIST.map((char) => {
                  const message =
                    char.id === 'aditya'
                      ? evaluation.score >= 70
                        ? 'Hebat! Pemahamanmu tentang inovasi global dan rantai ekonomi siap membawa Nusantara mendunia!'
                        : 'Terus asah analisis peran IPTEK dan struktur ekonomi global agar pembangunan kota makin tepat sasaran.'
                      : char.id === 'laras'
                        ? evaluation.score >= 70
                          ? 'Analisis kritismu terhadap kesenjangan sosial dan dampak budaya sangat matang!'
                          : 'Ingat, selalu pertimbangkan risiko ketimpangan, cultural lag, dan konsumerisme dalam setiap studi kasus.'
                        : evaluation.score >= 70
                          ? 'Keren! Kamu berhasil memadukan kemajuan global dan kearifan lokal lewat konsep glokalisasi!'
                          : 'Yuk tinjau ulang materi glokalisasi agar UMKM dan budaya lokal selalu berdaya di era digital.';

                  return (
                    <div
                      key={char.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2.5">
                        <img
                          src={char.avatarSrc}
                          alt={char.name}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{char.name}</div>
                          <div className={`text-[11px] ${char.textAccentClass}`}>{char.theory}</div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300">"{message}"</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleRetry}
                className="flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                <RotateCcw className="h-4 w-4" />
                Main Lagi
              </button>
              <button
                type="button"
                onClick={onBackDashboard}
                className="flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
