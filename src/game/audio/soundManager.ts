/**
 * Procedural Web Audio Sound Synthesizer for SPARKVERSE
 * Zero 404 dependencies: all sound effects and ambient chords generated via Web Audio API.
 * Uses a harmonic Pentatonic Celestial Scale for combo collection chains.
 */

const PENTATONIC_FREQUENCIES = [
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
  1046.50, // C6
  1174.66, // D6
  1318.51, // E6
  1567.98, // G6
  1760.00, // A6
  2093.00, // C7
];

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isAmbientPlaying = false;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, music: number) {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    this.musicGain.gain.setTargetAtTime(music, now, 0.05);
  }

  public playSparkCollect(combo = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const noteIdx = Math.min(Math.max(0, combo - 1), PENTATONIC_FREQUENCIES.length - 1);
      const noteFreq = PENTATONIC_FREQUENCIES[noteIdx];

      // Primary crystalline tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);
      osc.frequency.exponentialRampToValueAtTime(noteFreq * 1.05, now + 0.1);

      // Warm attack and gentle exponential decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.17);

      // High combo overtone shimmer
      if (combo >= 5) {
        const overtone = this.ctx.createOscillator();
        const overGain = this.ctx.createGain();
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(noteFreq * 2, now);
        overGain.gain.setValueAtTime(0.08, now);
        overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        overtone.connect(overGain);
        overGain.connect(this.sfxGain);
        overtone.start(now);
        overtone.stop(now + 0.19);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playSpecialCollect() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Radiant triple-tone celestial chord
      [784, 1046.5, 1568].forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + i * 0.03 + 0.22);

        gain.gain.setValueAtTime(0.001, now + i * 0.03);
        gain.gain.linearRampToValueAtTime(0.28, now + i * 0.03 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.36);
      });
    } catch {}
  }

  public playGatePass() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Resonant sonic swoosh + victory chime
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.25);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2800, now + 0.25);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);

      // Secondary bell chime
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1318.51, now + 0.05); // E6
      bellGain.gain.setValueAtTime(0.25, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bell.connect(bellGain);
      bellGain.connect(this.sfxGain);
      bell.start(now + 0.05);
      bell.stop(now + 0.36);
    } catch {}
  }

  public playCollision() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Sub-bass thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playGameOver() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [440, 392, 349, 261.63];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);
        gain.gain.setValueAtTime(0.28, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.35);
      });
    } catch {}
  }

  public startAmbient() {
    try {
      this.initContext();
      if (!this.ctx || !this.musicGain || this.isAmbientPlaying || this.isMuted) return;

      const chord = [130.81, 164.81, 196.0, 246.94]; // C major 7th ethereal cosmic chord
      this.ambientOscillators = [];

      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start();
        this.ambientOscillators.push(osc);
      });
      this.isAmbientPlaying = true;
    } catch {}
  }

  public stopAmbient() {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
    this.isAmbientPlaying = false;
  }
}

export const soundManager = new SoundManager();
