import bgMusicSrc from "../assets/background-music.mp3";
import boomSoundSrc from "../assets/boom-sound.mp3";

class AudioController {
  private _isMuted = false;
  private bgMusic: HTMLAudioElement | null = null;
  private boomSound: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.bgMusic = new Audio(bgMusicSrc);
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.15;

      this.boomSound = new Audio(boomSoundSrc);
      this.boomSound.volume = 0.8;

      // Global interaction listener to start music as early as possible
      const startOnInteraction = () => {
        this.playBgMusic();
        window.removeEventListener('click', startOnInteraction);
        window.removeEventListener('touchstart', startOnInteraction);
        window.removeEventListener('mousedown', startOnInteraction);
        window.removeEventListener('keydown', startOnInteraction);
      };

      window.addEventListener('click', startOnInteraction);
      window.addEventListener('touchstart', startOnInteraction);
      window.addEventListener('mousedown', startOnInteraction);
      window.addEventListener('keydown', startOnInteraction);
    }
  }

  get isMuted() {
    return this._isMuted;
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
    if (this.bgMusic) {
      this.bgMusic.muted = muted;
    }
    if (this.boomSound) {
      this.boomSound.muted = muted;
    }
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
    this.playTone(400, 'sine', 0.1, 0.7);
  }

  playGift() {
    this.playTone(600, 'triangle', 0.2, 0.7);
    setTimeout(() => this.playTone(800, 'triangle', 0.4, 0.7), 100);
  }

  playBoom() {
    if (this.boomSound) {
      this.boomSound.currentTime = 0.35;
      this.boomSound.play().catch(e => console.error("Boom sound play failed", e));
    }
  }

  playWin() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.7), i * 150);
    });
  }

  playBgMusic() {
    if (this.bgMusic && this.bgMusic.paused) {
      this.bgMusic.play().catch(e => console.error("BG music play failed", e));
    }
  }

  stopBgMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }
}

export const audio = new AudioController();

