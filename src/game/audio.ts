// Web Audio API procedural synthesizer — no external audio files needed.

class NusantaraAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private bgmEnabled: boolean = false;
  private bgmTimer: number | null = null;
  private stepIndex: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockOnGesture(): void {
    const ctx = this.ensureContext();
    if (ctx && this.bgmEnabled && this.bgmTimer === null) {
      this.startAmbientLoop();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (mute) {
      this.stopAmbientLoop();
    } else if (this.bgmEnabled) {
      this.startAmbientLoop();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (enabled && !this.muted) {
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.12,
    delay: number = 0,
    slideTo?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(540, 0.06, 'triangle', 0.08, 0, 660);
  }

  public playBuild(): void {
    this.playTone(180, 0.11, 'triangle', 0.16, 0, 110);
    this.playTone(392, 0.12, 'sine', 0.1, 0.06);
    this.playTone(523.25, 0.16, 'sine', 0.1, 0.13);
  }

  public playCoin(): void {
    this.playTone(987.77, 0.08, 'sine', 0.07, 0);
    this.playTone(1318.51, 0.14, 'sine', 0.08, 0.06);
  }

  public playCorrect(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.13, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.13, 0.09);
    this.playTone(783.99, 0.2, 'triangle', 0.14, 0.18);
  }

  public playError(): void {
    this.playTone(210, 0.16, 'sawtooth', 0.1, 0, 165);
    this.playTone(165, 0.22, 'sawtooth', 0.1, 0.13, 130);
  }

  public playMissionComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'triangle', 0.12, idx * 0.08);
    });
  }

  public playLevelUp(): void {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'sine', 0.13, idx * 0.085);
    });
  }

  public playWarning(): void {
    this.playTone(330, 0.14, 'square', 0.06, 0);
    this.playTone(293.66, 0.18, 'square', 0.06, 0.16);
  }

  public playTimerOut(): void {
    this.playTone(392, 0.18, 'sawtooth', 0.09, 0);
    this.playTone(311.13, 0.2, 'sawtooth', 0.09, 0.2);
    this.playTone(261.63, 0.35, 'sawtooth', 0.1, 0.42);
  }

  public startAmbientLoop(): void {
    if (this.muted || !this.bgmEnabled || typeof window === 'undefined') return;
    if (this.bgmTimer !== null) return;

    // Gentle Nusantara Slendro/Pelog inspired pentatonic progression (C4, D4, E4, G4, A4, C5)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63];

    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.bgmEnabled) return;
      const freq = scale[this.stepIndex % scale.length];
      this.playTone(freq, 0.55, 'sine', 0.025);
      if (this.stepIndex % 4 === 0) {
        this.playTone(freq / 2, 0.9, 'triangle', 0.02);
      }
      this.stepIndex += 1;
    }, 700);
  }

  public stopAmbientLoop(): void {
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audioEngine = new NusantaraAudioEngine();
