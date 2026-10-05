/**
 * Tactile Web Audio Engine for Aether Space
 * Synthesizes organic, claymorphic click sounds, soothing ambient soundscapes,
 * spatial audio panning, and resonant tactile meditation chimes.
 */

class TactileAudioEngine {
  private ctx: AudioContext | null = null;
  private isSoundscapePlaying = false;
  private currentTrackId: string | null = null;
  private masterGain: GainNode | null = null;
  private spatialPanner: StereoPannerNode | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private ambientTimer: number | null = null;
  private binauralBeatActive = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      if (this.ctx.createStereoPanner) {
        this.spatialPanner = this.ctx.createStereoPanner();
        this.masterGain.connect(this.spatialPanner);
        this.spatialPanner.connect(this.ctx.destination);
      } else {
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft tactile clay click / pop
  public playHapticClick(frequency = 320, duration = 0.04) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Play toggle soft click
  public playToggle(on: boolean) {
    this.playHapticClick(on ? 440 : 280, 0.05);
  }

  // Play harmonic chime (Tibetan singing bowl / tactile chime)
  public playChime(freq = 432, duration = 1.8) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // Warm slight harmonic detune
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.502, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, now);
      filter.Q.setValueAtTime(2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  // Set spatial pan (-1.0 to 1.0)
  public setSpatialPan(panValue: number) {
    if (this.spatialPanner && this.ctx) {
      const clamped = Math.max(-1, Math.min(1, panValue));
      this.spatialPanner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  // Set Master Volume (0.0 to 1.0)
  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  // Stop active soundscape
  public stopSoundscape() {
    this.activeNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Already stopped
      }
    });
    this.activeNodes = [];
    if (this.ambientTimer) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.isSoundscapePlaying = false;
    this.currentTrackId = null;
  }

  // Start soundscape based on track configuration
  public playSoundscape(trackId: string, binauralFreq = 6) {
    this.stopSoundscape();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isSoundscapePlaying = true;
    this.currentTrackId = trackId;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    if (trackId === 'deep-orbit') {
      // Warm 432Hz ambient chord pad + gentle sub bass
      const baseFreq = 108; // A2 / 4
      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2, 432];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + idx * 80, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        this.activeNodes.push({
          stop: () => {
            gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
            osc.stop(ctx.currentTime + 1);
          },
        });
      });
    } else if (trackId === 'binaural-theta') {
      // Real binaural beat (Left: 216Hz, Right: 216 + binauralFreq Hz)
      const baseCarrier = 216;
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();

      const leftGain = ctx.createGain();
      const rightGain = ctx.createGain();

      const merger = ctx.createChannelMerger(2);

      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(baseCarrier, now);

      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(baseCarrier + binauralFreq, now);

      leftGain.gain.setValueAtTime(0.001, now);
      leftGain.gain.linearRampToValueAtTime(0.12, now + 2);

      rightGain.gain.setValueAtTime(0.001, now);
      rightGain.gain.linearRampToValueAtTime(0.12, now + 2);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);

      // Route left to channel 0, right to channel 1
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);

      merger.connect(this.masterGain);

      leftOsc.start(now);
      rightOsc.start(now);

      this.activeNodes.push({
        stop: () => {
          leftGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          rightGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          leftOsc.stop(ctx.currentTime + 1);
          rightOsc.stop(ctx.currentTime + 1);
        },
      });
    } else if (trackId === 'gentle-rain') {
      // Synthesized pink noise rain with soft lowpass sweeping
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(650, now);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.001, now);
      rainGain.gain.linearRampToValueAtTime(0.18, now + 2);

      whiteNoise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(this.masterGain);

      whiteNoise.start(now);

      this.activeNodes.push({
        stop: () => {
          rainGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          whiteNoise.stop(ctx.currentTime + 1);
        },
      });
    } else {
      // "Forest Whispers" - peaceful harmonic drones & soft wind
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(144, now); // D3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);

      this.activeNodes.push({
        stop: () => {
          gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          osc.stop(ctx.currentTime + 1);
        },
      });

      // Add gentle random chimes every few seconds
      const chimeNotes = [440, 528, 660, 880];
      this.ambientTimer = window.setInterval(() => {
        if (!this.isSoundscapePlaying) return;
        const randomNote = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        this.playChime(randomNote, 2.5);
      }, 4500);
    }
  }

  public getIsPlaying() {
    return this.isSoundscapePlaying;
  }

  public getCurrentTrack() {
    return this.currentTrackId;
  }
}

export const audioEngine = new TactileAudioEngine();
