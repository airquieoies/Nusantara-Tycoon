import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Hand, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  visible: boolean;
  onAction: (action: 'jump' | 'interact' | 'vehicle') => void;
  onMoveInput: (key: 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD', pressed: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  visible,
  onAction,
  onMoveInput,
}) => {
  if (!visible) return null;

  const holdBtn = (key: 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD', icon: React.ReactNode, label: string) => (
    <button
      type="button"
      aria-label={label}
      onPointerDown={() => onMoveInput(key, true)}
      onPointerUp={() => onMoveInput(key, false)}
      onPointerLeave={() => onMoveInput(key, false)}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-slate-950/80 text-white active:bg-amber-500 active:text-slate-950"
    >
      {icon}
    </button>
  );

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-20 flex items-end justify-between md:hidden">
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5">
        <div />
        {holdBtn('KeyW', <ArrowUp className="h-5 w-5" />, 'Maju')}
        <div />
        {holdBtn('KeyA', <ArrowLeft className="h-5 w-5" />, 'Kiri')}
        {holdBtn('KeyS', <ArrowDown className="h-5 w-5" />, 'Mundur')}
        {holdBtn('KeyD', <ArrowRight className="h-5 w-5" />, 'Kanan')}
      </div>

      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onAction('interact')}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-500 px-3.5 text-xs font-extrabold text-slate-950"
        >
          <Hand className="h-4 w-4" /> Interaksi [E]
        </button>
        <button
          type="button"
          onClick={() => onAction('jump')}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-slate-950/85 px-3.5 text-xs font-bold text-white"
        >
          <Sparkles className="h-4 w-4" /> Lompat
        </button>
      </div>
    </div>
  );
};
