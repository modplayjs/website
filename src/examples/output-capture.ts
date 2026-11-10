import type { OutputPlugin } from '@modplayjs/core';

export function createCaptureOutput() {
  const chunks: Float32Array[] = [];
  const output: OutputPlugin & { pcm(): Float32Array } = {
    name: 'capture',
    start(core) {
      const scratch = new Float32Array(core.ticksize * 2 * 4);
      for (;;) {
        const n = core.playBuffer(scratch, scratch.length, 1);
        if (n < 0) break;                 // already ended, nothing written
        if (n === 0) {                    // ended during this buffer
          chunks.push(scratch.slice());   // valid audio + zero tail
          break;
        }
        chunks.push(scratch.slice(0, n));
      }
    },
    stop() {},
    pcm() {
      const total = chunks.reduce((n, c) => n + c.length, 0);
      const out = new Float32Array(total);
      let o = 0;
      for (const c of chunks) { out.set(c, o); o += c.length; }
      return out;
    },
  };
  return output;
}
