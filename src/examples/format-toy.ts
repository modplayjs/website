import {
  type Envelope,
  type Event,
  type FormatPlugin,
  type Instrument,
  type ModuleData,
  type SubInstrument,
  type Track,
  C4_PAL_RATE,
  FLOW_MODE_GENERIC,
  PeriodType,
  ReadEventType,
} from '@modplayjs/core';
import { readEventMod } from '@modplayjs/fmt-mod';

const MAGIC = [0x54, 0x4f, 0x59, 0x31]; // "TOY1"

const emptyEnv = (): Envelope => ({
  flags: 0, npt: 0, scl: 0, sus: 0, sue: 0, lps: 0, lpe: 0, x: [], y: [],
});

const sub = (sid: number): SubInstrument => ({
  vol: 64, gvl: 0, pan: -1, xpo: 0, fin: 0, vwf: 0, vde: 0, vra: 0, vsw: 0,
  sid, nna: 0, dct: 0, dca: 0, ifc: 0, ifr: 0, rvv: 0,
});

const instrument = (name: string, sid: number): Instrument => ({
  name, volume: 64, nsm: 1, rls: 0,
  map: Array(121).fill(0),
  mapXpo: Array(121).fill(0),
  sub: Array.from({ length: 121 }, () => sub(sid)),
  aei: emptyEnv(), fei: emptyEnv(), pei: emptyEnv(),
});

export const toy: FormatPlugin = {
  name: 'toy',

  test(bytes) {
    return bytes.length >= 10 && MAGIC.every((b, i) => bytes[i] === b);
  },

  load(bytes, ctx) {
    let o = 4;
    const chn = bytes[o++] ?? 4;
    const rows = bytes[o++] || 64;
    const sampleLen = (bytes[o] ?? 0) | ((bytes[o + 1] ?? 0) << 8);
    o += 2;
    const pcm = bytes.subarray(o, o + sampleLen);
    o += sampleLen;

    // Positional id: the store assigns 0, 1, 2, …
    const sid = ctx.addSample({
      name: 'toy', data: pcm, length: pcm.length,
      loopStart: 0, loopEnd: 0, sustainStart: 0, sustainEnd: 0,
      finetune: 0, volume: 64, flags: 0,
    });

    const tracks: Track[] = [];
    for (let ch = 0; ch < chn; ch++) {
      const event: Event[] = [];
      for (let row = 0; row < rows; row++) {
        const note = bytes[o++] ?? 0;
        const ins = bytes[o++] ?? 0;
        const vol = bytes[o++] ?? 0;
        const fxt = bytes[o++] ?? 0;
        const fxp = bytes[o++] ?? 0;
        event.push({ note, ins, vol, fxt, fxp, f2t: 0, f2p: 0 });
      }
      tracks.push({ rows, event });
    }

    return {
      title: 'toy',
      format: 'toy',                 // must equal the plugin name
      comment: '',
      chn, pat: 1, ins: 1, len: 1, restart: 0,
      xxo: [0],
      channels: Array.from({ length: chn }, (_, i) => ({
        pan: i % 2 === 0 ? 0x30 : 0xd0, vol: 0x40, flg: 0,
      })),
      patterns: [{ rows, tracks }],
      instruments: [instrument('toy', sid)],
      samples: [],                   // addSample already registered it
      num_sequences: 1, sequences: [],
      speed: 6, bpm: 125, volbase: 64, gvolbase: 128, gvol: 64,
      quirks: 0, flowMode: FLOW_MODE_GENERIC,
      readEventType: ReadEventType.MOD,
      periodType: PeriodType.AMIGA,
      defpan: 0x80, time_factor: 10, rrate: 250, c4rate: C4_PAL_RATE,
      tracker: 'toy',
    } satisfies ModuleData;
  },

  readEvent(core, chn, row) {
    const mod = core.module!;
    const e =
      core.readEventScratch(chn) ??
      core.readEventAt(mod.xxo[core.ctx.p.ord] ?? 0, chn, row);
    readEventMod(core, e, chn);
  },
};
