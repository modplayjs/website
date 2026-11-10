import { type DspPlugin, Act } from '@modplayjs/core';

/** Amiga PAL clock; valid for modules with PeriodType.AMIGA. */
const PAL_CLOCK = 7093789.2;

export function createSineMixer(): DspPlugin {
  const phase = new Float32Array(64);

  return {
    name: 'sine',
    channels: 64,

    reset() {
      phase.fill(0);
    },

    renderFrame(core, out, ticks) {
      const frames = ticks * core.ticksize;
      out.fill(0, 0, frames * 2);
      const mod = core.module;
      if (!mod) return;

      for (const v of core.voiceStates) {
        if (v.act === Act.NONE || v.smp < 0 || v.period <= 0) continue;
        const hz = PAL_CLOCK / (2 * v.period);
        const inc = (2 * Math.PI * hz) / core.sampleRate;
        const gain = Math.min(1, v.vol / mod.volbase);
        const gl = gain * (1 - v.pan / 255);
        const gr = gain * (v.pan / 255);
        let p = phase[v.chn] ?? 0;
        for (let i = 0; i < frames; i++) {
          const s = Math.sin(p);
          out[i * 2] += s * gl;
          out[i * 2 + 1] += s * gr;
          p += inc;
        }
        phase[v.chn] = p % (2 * Math.PI);
      }
    },
  };
}
