/**
 * CiteReady — Procedural Audio Engine
 * 100% synthesized with the Web Audio API. No files, no network, no latency.
 *
 * Signal graph:
 *   sources ─┬─▶ master ─▶ analyser ─▶ destination
 *            └─▶ reverbSend (feedback delay) ─▶ master
 */

const MASTER_VOLUME = 0.5;
const PREF_KEY = "cite-ready-sfx";
const isLowPower = () => {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth < 768 ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
    (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true
  );
};

type ScanHandle = { stop: (fade?: number) => void };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private reverbSend: GainNode | null = null;

  private ambientBus: GainNode | null = null;
  private ambientParts: Array<{ stop: () => void }> = [];
  private scanHandle: ScanHandle | null = null;

  private lastHover = 0;
  enabled = true;
  unlocked = false;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(PREF_KEY);
      if (saved !== null) this.enabled = saved === "1";
    } catch {
      /* ignore */
    }
  }

  private persist() {
    try {
      window.localStorage.setItem(PREF_KEY, this.enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      try {
        this.ctx = new AC();
      } catch {
        return null;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? MASTER_VOLUME : 0;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.72;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // feedback-delay reverb — cheap, lush, no impulse asset needed
      const delay = this.ctx.createDelay(1.0);
      delay.delayTime.value = 0.19;
      const fb = this.ctx.createGain();
      fb.gain.value = 0.36;
      const tone = this.ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 2600;
      const wet = this.ctx.createGain();
      wet.gain.value = 0.3;
      delay.connect(tone);
      tone.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(this.master);
      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.value = 1;
      this.reverbSend.connect(delay);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.unlocked = this.ctx.state === "running";
    return this.unlocked ? this.ctx : null;
  }

  unlock(announce = false) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled) return false;
    if (announce) this.ding();
    return true;
  }

  setEnabled(next: boolean): boolean {
    this.enabled = next;
    this.persist();
    const ctx = this.ensure();
    if (!ctx || !this.master) return this.enabled;
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(next ? MASTER_VOLUME : 0, t, 0.08);
    if (next) {
      this.startAmbient();
      this.blip(880, 0.05, "sine", 0.05, undefined, 0, true);
    } else {
      this.stopScan(0.1);
      this.stopAmbient(0.2);
    }
    return this.enabled;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser && this.unlocked ? this.analyser : null;
  }

  private noise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const len = Math.floor(ctx.sampleRate * 2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    return this.noiseBuffer;
  }

  /* ------------------------------------------------ ambient */

  startAmbient() {
    // Keep idle oscillator/noise layers off on phones and low-power devices.
    if (isLowPower()) return;
    const ctx = this.ensure();
    if (!ctx || !this.enabled || this.ambientBus) return;

    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(this.master!);
    bus.gain.setTargetAtTime(1, ctx.currentTime, 1.6);
    this.ambientBus = bus;

    const parts: Array<{ stop: () => void }> = [];

    [
      { f: 46, g: 0.05, type: "sine" as OscillatorType },
      { f: 69.3, g: 0.026, type: "sine" as OscillatorType },
      { f: 92.5, g: 0.012, type: "triangle" as OscillatorType },
    ].forEach(({ f, g, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.value = g;
      osc.connect(gain).connect(bus);
      osc.start();
      parts.push({
        stop: () => {
          try {
            osc.stop();
            osc.disconnect();
            gain.disconnect();
          } catch {
            /* noop */
          }
        },
      });
    });

    const air = ctx.createBufferSource();
    air.buffer = this.noise(ctx);
    air.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 780;
    bp.Q.value = 0.9;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.012;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(bp.frequency);
    air.connect(bp).connect(airGain).connect(bus);
    air.start();
    lfo.start();
    parts.push({
      stop: () => {
        try {
          air.stop();
          lfo.stop();
          air.disconnect();
          bp.disconnect();
          airGain.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
        } catch {
          /* noop */
        }
      },
    });

    this.ambientParts = parts;
  }

  stopAmbient(fade = 1.2) {
    const ctx = this.ctx;
    const bus = this.ambientBus;
    if (!ctx || !bus) return;
    const parts = this.ambientParts;
    this.ambientBus = null;
    this.ambientParts = [];
    bus.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
    window.setTimeout(() => {
      parts.forEach((p) => p.stop());
      try {
        bus.disconnect();
      } catch {
        /* noop */
      }
    }, fade * 1000 + 250);
  }

  /* ------------------------------------------------ scan bed */

  startScan(durationMs = 4600): ScanHandle | null {
    const ctx = this.ensure();
    if (!ctx || !this.enabled) return null;
    this.stopScan(0.15);

    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(this.master!);

    const t0 = ctx.currentTime;
    const dur = durationMs / 1000;

    // resonant main sweep
    const saw = ctx.createOscillator();
    saw.type = "sawtooth";
    saw.frequency.setValueAtTime(74, t0);
    saw.frequency.linearRampToValueAtTime(112, t0 + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 7;
    lp.frequency.setValueAtTime(200, t0);
    lp.frequency.exponentialRampToValueAtTime(3200, t0 + dur);
    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.05;
    saw.connect(lp).connect(sawGain).connect(bus);

    // shimmer octave — airy high texture
    const shim = ctx.createOscillator();
    shim.type = "triangle";
    shim.frequency.setValueAtTime(148, t0);
    shim.frequency.linearRampToValueAtTime(224, t0 + dur);
    const shimFilt = ctx.createBiquadFilter();
    shimFilt.type = "bandpass";
    shimFilt.frequency.setValueAtTime(1800, t0);
    shimFilt.frequency.exponentialRampToValueAtTime(6400, t0 + dur);
    shimFilt.Q.value = 3;
    const shimGain = ctx.createGain();
    shimGain.gain.value = 0.014;
    shim.connect(shimFilt).connect(shimGain).connect(this.reverbSend!);

    // radar tremolo pulse
    const pulse = ctx.createOscillator();
    pulse.type = "sine";
    pulse.frequency.value = 2.6;
    const pulseDepth = ctx.createGain();
    pulseDepth.gain.value = 0.5;
    pulse.connect(pulseDepth).connect(bus.gain);

    saw.start();
    shim.start();
    pulse.start();
    bus.gain.setValueAtTime(0, t0);
    bus.gain.linearRampToValueAtTime(1, t0 + 0.4);

    const handle: ScanHandle = {
      stop: (fade = 0.35) => {
        const now = ctx.currentTime;
        bus.gain.cancelScheduledValues(now);
        bus.gain.setValueAtTime(bus.gain.value, now);
        bus.gain.linearRampToValueAtTime(0, now + fade);
        window.setTimeout(() => {
          try {
            saw.stop();
            shim.stop();
            pulse.stop();
            saw.disconnect();
            lp.disconnect();
            sawGain.disconnect();
            shim.disconnect();
            shimFilt.disconnect();
            shimGain.disconnect();
            pulse.disconnect();
            pulseDepth.disconnect();
            bus.disconnect();
          } catch {
            /* noop */
          }
        }, fade * 1000 + 120);
      },
    };
    this.scanHandle = handle;
    return handle;
  }

  stopScan(fade = 0.35) {
    this.scanHandle?.stop(fade);
    this.scanHandle = null;
  }

  /* ------------------------------------------------ voices */

  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    sweepTo?: number,
    delay = 0,
    reverb = false,
    detune = 0
  ) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled || !this.master) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    if (reverb && this.reverbSend) g.connect(this.reverbSend);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  private burst(freq: number, dur: number, gain: number, q = 1.2, delay = 0, sweepTo?: number) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled || !this.master) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noise(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = q;
    bp.frequency.setValueAtTime(freq, t);
    if (sweepTo) bp.frequency.exponentialRampToValueAtTime(Math.max(60, sweepTo), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.master);
    if (this.reverbSend) g.connect(this.reverbSend);
    src.start(t);
    src.stop(t + dur + 0.03);
  }

  hover() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastHover < 75) return;
    this.lastHover = now;
    this.blip(2100 + Math.random() * 500, 0.025, "sine", 0.02);
  }

  tick() {
    if (!this.enabled) return;
    this.blip(1500 + Math.random() * 380, 0.03, "triangle", 0.03, 900);
  }

  click() {
    if (!this.enabled) return;
    this.blip(340, 0.055, "triangle", 0.07, 96);
    this.burst(2600, 0.04, 0.03, 1.1);
  }

  whoosh() {
    if (!this.enabled) return;
    this.burst(420, 0.34, 0.05, 0.8, 0, 3400);
  }

  ping(step = 0) {
    if (!this.enabled) return;
    const base = 660 * Math.pow(1.0595, Math.min(step, 12) * 2);
    this.blip(base, 0.26, "sine", 0.05, base * 1.5, 0, true);
    this.blip(base * 2, 0.14, "sine", 0.018, undefined, 0.02, true);
  }

  rise(step: number) {
    if (!this.enabled) return;
    const f = 420 * Math.pow(1.122, Math.max(0, Math.min(step, 6)));
    this.blip(f, 0.16, "square", 0.03, f * 1.6);
    this.burst(1800, 0.1, 0.018, 1.6);
  }

  fall() {
    if (!this.enabled) return;
    this.blip(300, 0.14, "sine", 0.03, 150);
  }

  ding() {
    if (!this.enabled) return;
    this.blip(1318.5, 0.18, "sine", 0.05, undefined, 0, true);
    this.blip(1975.5, 0.22, "sine", 0.03, undefined, 0.06, true);
  }

  thud() {
    if (!this.enabled) return;
    this.blip(120, 0.3, "sawtooth", 0.05, 58);
    this.burst(220, 0.18, 0.035, 0.7);
  }

  chime() {
    if (!this.enabled) return;
    // ascending major add9 arpeggio with reverb tail
    const notes = [392, 493.88, 587.33, 783.99, 1175.5];
    notes.forEach((f, i) => {
      this.blip(f, 0.7, "sine", 0.045, undefined, i * 0.085, true);
      this.blip(f * 2, 0.32, "sine", 0.012, undefined, i * 0.085 + 0.02, true);
    });
    this.burst(3200, 0.5, 0.02, 0.6, 0.05, 900);
  }

  boot() {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    // sub rumble
    const sub = ctx.createOscillator();
    const subG = ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(42, t);
    sub.frequency.linearRampToValueAtTime(58, t + 1.4);
    subG.gain.setValueAtTime(0.0001, t);
    subG.gain.exponentialRampToValueAtTime(0.08, t + 0.3);
    subG.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    sub.connect(subG).connect(this.master);
    // bright swell
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(300, t);
    lp.frequency.exponentialRampToValueAtTime(5200, t + 1.4);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(58, t);
    osc.frequency.exponentialRampToValueAtTime(233, t + 1.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    osc.connect(lp).connect(g).connect(this.master);
    if (this.reverbSend) g.connect(this.reverbSend);
    sub.start(t);
    osc.start(t);
    sub.stop(t + 1.6);
    osc.stop(t + 1.7);
  }
}

export const sound = new SoundEngine();

export function installAudioUnlock(onUnlocked?: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    const ok = sound.unlock(false);
    if (ok) {
      sound.startAmbient();
      sound.ding();
      onUnlocked?.();
    }
  };
  window.addEventListener("pointerdown", handler, { once: true });
  window.addEventListener("keydown", handler, { once: true });
  return () => {
    window.removeEventListener("pointerdown", handler);
    window.removeEventListener("keydown", handler);
  };
}
