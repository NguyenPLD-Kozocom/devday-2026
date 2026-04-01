class AudioController {
  private _isMuted = false;

  get isMuted() {
    return this._isMuted;
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (this._isMuted) return;
    try {
      const AudioContextC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextC) return;
      
      const ctx = new AudioContextC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }

  playClick() {
    this.playTone(400, 'sine', 0.1, 0.1);
  }

  playGift() {
    this.playTone(600, 'triangle', 0.2, 0.15);
    setTimeout(() => this.playTone(800, 'triangle', 0.4, 0.15), 100);
  }

  playBoom() {
    this.playTone(100, 'sawtooth', 0.5, 0.2);
    setTimeout(() => this.playTone(50, 'square', 0.8, 0.3), 50);
  }

  playWin() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.1), i * 150);
    });
  }
}

export const audio = new AudioController();
