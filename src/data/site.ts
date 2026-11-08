// SPDX-License-Identifier: BSD-3-Clause
// The site's single source of truth. Versions match the repository; update
// them together with the package manifests, not by guessing.

export const libraryVersion = '0.2.1';
export const androidVersion = '0.2.1';
export const xrVersion = '0.1.0';
export const license = 'BSD-3-Clause';
export const repository = 'https://github.com/modplayjs/modplayjs';

export interface Pkg {
  /** npm name */
  name: string;
  version: string;
  /** One sentence, in the site's voice. */
  role: string;
  /** Optional qualifier shown as a tag. */
  tag?: 'deprecated' | 'shim' | 'decoder';
}

export interface Snippet {
  title: string;
  code: string;
  note?: string;
}

export interface Category {
  slug: string;
  /** Two-digit order in the API index. */
  order: string;
  title: string;
  /** Shown on the index and as the page lead. */
  blurb: string;
  packages: Pkg[];
  /** The contract this category is built around, when there is one. */
  snippet?: Snippet;
}

export const categories: Category[] = [
  {
    slug: 'core',
    order: '01',
    title: 'Core & timing',
    blurb:
      'The player itself, plus the clock a UI needs to draw the row that is actually audible. Everything else plugs into these two.',
    packages: [
      {
        name: '@modplayjs/core',
        version: libraryVersion,
        role: 'Module lifecycle, sequencer, effect dispatch, pattern scanner and virtual channels. The frame loop and timing model are libxmp\'s player.c, ported to TypeScript.',
      },
      {
        name: '@modplayjs/playhead',
        version: libraryVersion,
        role: 'Maps the audio sink\'s consumed frames to the song position, so a pattern view follows the row you hear instead of the row the renderer is ahead on.',
      },
    ],
    snippet: {
      title: 'Player + mixer + output',
      code: `import { CorePlayer } from '@modplayjs/core';
import { plugin as modPlugin } from '@modplayjs/fmt-mod';
import { createSoftMixerPlugin } from '@modplayjs/dsp-softmixer';
import { WebAudioOutput } from '@modplayjs/out-webaudio';

const core = new CorePlayer();
core.registries.registerFormat(modPlugin);
core.registries.registerDsp(createSoftMixerPlugin());

await core.loadModule(bytes);          // Uint8Array
core.setDsp('softmixer');
core.setSampleRate(deviceSampleRate);
core.startPlayer();

const out = new WebAudioOutput();
await out.start(core, workletUrl);     // one user gesture`,
      note: 'The player owns timing and state. The output only decides when to pull.',
    },
  },
  {
    slug: 'formats',
    order: '02',
    title: 'Format loaders',
    blurb:
      'One package per format family. A loader parses the file into the core\'s data model and reads pattern events during playback; the core owns timing and mixing.',
    snippet: {
      title: 'FormatPlugin',
      code: `interface FormatPlugin {
  readonly name: string;
  test(bytes: Uint8Array): boolean;
  load(bytes: Uint8Array, ctx: LoadCtx): ModuleData;
  readEvent(core: Core, chn: number, row: number): void;
}

core.registries.registerFormat(plugin);`,
      note: 'test() is a cheap signature check; load() runs once; readEvent() runs per channel per row.',
    },
    packages: [
      {
        name: '@modplayjs/fmt-mod',
        version: libraryVersion,
        role: 'ProTracker and the 15-instrument family: 19 tracker variants, auto-detected and mapped to their quirk sets.',
      },
      { name: '@modplayjs/fmt-s3m', version: libraryVersion, role: 'Scream Tracker 3.' },
      {
        name: '@modplayjs/fmt-xm',
        version: libraryVersion,
        role: 'FastTracker II, including ADPCM samples and Ogg-compressed patterns.',
      },
      {
        name: '@modplayjs/fmt-it',
        version: libraryVersion,
        role: 'Impulse Tracker: IT215 decompression, MIDI macros, note delay, NNA/DCA/DCT.',
      },
      { name: '@modplayjs/fmt-mtm', version: libraryVersion, role: 'Multitracker.' },
      { name: '@modplayjs/fmt-stm', version: libraryVersion, role: 'Scream Tracker 2.' },
      { name: '@modplayjs/fmt-669', version: libraryVersion, role: 'Composer 669 / UNIS 669.' },
      { name: '@modplayjs/fmt-sfx', version: libraryVersion, role: 'SoundFX 1.3 and 2.0.' },
      { name: '@modplayjs/fmt-digi', version: libraryVersion, role: 'DIGI Booster.' },
      { name: '@modplayjs/fmt-asylum', version: libraryVersion, role: 'Asylum Music Format 1.0.' },
      {
        name: '@modplayjs/fmt-ice',
        version: libraryVersion,
        role: 'Soundtracker 2.6 / Ice Tracker (MTN, IT10).',
      },
      {
        name: '@modplayjs/fmt-med',
        version: libraryVersion,
        role: 'MED and OctaMED: MMD0 through MMD3, plus the MED2/3/4 instrument banks.',
      },
      {
        name: '@modplayjs/fmt-st',
        version: libraryVersion,
        role: 'Ultimate Soundtracker, the 15-instrument ST/UST root of the MOD family.',
      },
      {
        name: '@modplayjs/fmt-fc',
        version: libraryVersion,
        role: 'Future Composer 1.0–1.4, including the InstrumentSynth engine port.',
      },
      {
        name: '@modplayjs/fmt-mo3',
        version: libraryVersion,
        role: 'Un4seen MO3 container; the inner XM/IT/S3M/MOD/MTM stream is decoded, not guessed.',
        tag: 'decoder',
      },
      {
        name: '@modplayjs/fmt-prowizard',
        version: libraryVersion,
        role: 'ProWizard packed-MOD depackers: 30 packers, from PowerPacker and XPK to Starpack.',
        tag: 'decoder',
      },
      {
        name: '@modplayjs/fmt-sid',
        version: libraryVersion,
        role: 'Commodore 64 SID (PSID/RSID): a 1:1 port of libcRSID 1.58, with the 6510, the SID chip and CIA/VIC timing.',
      },
    ],
  },
  {
    slug: 'mixers',
    order: '03',
    title: 'Mixers & effects',
    blurb:
      'A DSP turns channel state into samples. Exactly one is active at a time, chosen after loading and before playback starts.',
    snippet: {
      title: 'DspPlugin',
      code: `interface DspPlugin {
  readonly name: string;
  readonly channels: number;
  renderFrame(core: Core, out: Float32Array, ticks: number): void;
  onRow?(core: Core, chn: number, ev: Event): void;
  reset(): void;
}

core.registries.registerDsp(createSoftMixerPlugin());
core.setDsp('softmixer');   // only while the player is stopped`,
      note: 'renderFrame fills ticks × ticksize × 2 interleaved floats; the core clamps to ±1.',
    },
    packages: [
      {
        name: '@modplayjs/dsp-softmixer',
        version: libraryVersion,
        role: 'The libxmp-parity software mixer in its exact integer domain, with a Paula BLEP mode (mode: "paula"), L/R layouts and XMP_PLAYER_AMPLIFY.',
      },
      {
        name: '@modplayjs/dsp-paula',
        version: libraryVersion,
        role: 'The first Amiga Paula simulator. Superseded by the soft mixer\'s Paula mode.',
        tag: 'deprecated',
      },
      {
        name: '@modplayjs/effects-shared',
        version: libraryVersion,
        role: 'Compatibility shim that re-exports the effect processor from @modplayjs/core.',
        tag: 'shim',
      },
    ],
  },
  {
    slug: 'outputs',
    order: '04',
    title: 'Outputs',
    blurb:
      'Outputs pull audio: they call playBuffer() and decide when to do it — a worklet callback, a timer, or a file writer. The core never pushes.',
    snippet: {
      title: 'OutputPlugin',
      code: `interface OutputPlugin {
  readonly name: string;
  start(core: Core): void;
  stop(): void;
}

// The output decides when to ask:
core.playBuffer(out, size, loop?);  // interleaved floats, or -1 at end`,
      note: 'WebAudioOutput extends this at runtime with pause/resume and an onEnded callback.',
    },
    packages: [
      {
        name: '@modplayjs/out-webaudio',
        version: libraryVersion,
        role: 'AudioWorklet output with a SharedArrayBuffer ring (COOP/COEP) and an automatic copy-mode fallback, plus pause/resume that keeps the song position.',
      },
      {
        name: '@modplayjs/out-pcm',
        version: libraryVersion,
        role: 'Offline render to interleaved PCM or a RIFF/WAVE file. No device, no clock.',
      },
      {
        name: '@modplayjs/out-android',
        version: libraryVersion,
        role: 'Headless player session for the Android shell: settings, transport, capabilities and the command surface the native layer calls into.',
      },
    ],
  },
  {
    slug: 'streamed',
    order: '05',
    title: 'Streamed audio',
    blurb:
      'Not every file is a tracker module. These decoders feed the same output path so a playlist can hold modules and ordinary audio side by side.',
    snippet: {
      title: 'StreamedSource',
      code: `import { createStreamedSource, detectStreamedFormat } from '@modplayjs/stream-audio';

const format = detectStreamedFormat(bytes, name); // 'wav' | 'mp3' | 'ogg'
const source = createStreamedSource(bytes, format, sampleRate);
source.playBuffer(out, framesNeeded);            // same pull model`,
      note: 'Decoding happens on demand; nothing is pre-rendered into memory.',
    },
    packages: [
      {
        name: '@modplayjs/stream-audio',
        version: libraryVersion,
        role: 'WAV (PCM and IMA ADPCM), MP3 (minimp3) and Ogg Vorbis (stb_vorbis) decode into the same stereo float stream.',
        tag: 'decoder',
      },
      {
        name: '@modplayjs/stb-vorbis',
        version: libraryVersion,
        role: 'The Ogg Vorbis decoder on its own: a port of stb_vorbis.c from OpenMPT, bit-exact against the C reference.',
        tag: 'decoder',
      },
    ],
  },
];

export interface FormatRow {
  family: string;
  format: string;
  extensions: string;
  loader: string;
  note: string;
}

/** Loader coverage as the build ships it. Extensions come from the module map. */
export const formatRows: FormatRow[] = [
  {
    family: 'Tracker',
    format: 'ProTracker / ST family',
    extensions: 'mod, hmn, flt',
    loader: 'fmt-mod',
    note: '19 variants, from Ultimate Soundtracker to OpenMPT-converted MOD.',
  },
  {
    family: 'Tracker',
    format: 'Scream Tracker 3',
    extensions: 's3m',
    loader: 'fmt-s3m',
    note: 'Including AdLib and packed-pattern handling.',
  },
  {
    family: 'Tracker',
    format: 'FastTracker II',
    extensions: 'xm',
    loader: 'fmt-xm',
    note: 'ADPCM samples, Ogg-compressed patterns, FT2 quirks.',
  },
  {
    family: 'Tracker',
    format: 'Impulse Tracker',
    extensions: 'it',
    loader: 'fmt-it',
    note: 'IT215 decompression, MIDI macros, note delay.',
  },
  {
    family: 'Tracker',
    format: 'Multitracker',
    extensions: 'mtm',
    loader: 'fmt-mtm',
    note: '8-channel module format from the MOD era.',
  },
  {
    family: 'Tracker',
    format: 'Scream Tracker 2',
    extensions: 'stm',
    loader: 'fmt-stm',
    note: 'Pre-S3M Scream Tracker.',
  },
  {
    family: 'Tracker',
    format: 'Composer 669 / UNIS 669',
    extensions: '669',
    loader: 'fmt-669',
    note: 'Fixed 8-channel layout, its own effect set.',
  },
  {
    family: 'Tracker',
    format: 'SoundFX',
    extensions: 'sfx',
    loader: 'fmt-sfx',
    note: 'SoundFX 1.3 and 2.0.',
  },
  {
    family: 'Tracker',
    format: 'DIGI Booster',
    extensions: 'digi',
    loader: 'fmt-digi',
    note: 'Amiga tracker with its own sample packing.',
  },
  {
    family: 'Tracker',
    format: 'Asylum Music Format',
    extensions: 'amf',
    loader: 'fmt-asylum',
    note: 'Asylum 1.0; not the later DSMI AMF.',
  },
  {
    family: 'Tracker',
    format: 'Soundtracker 2.6 / Ice Tracker',
    extensions: 'ice',
    loader: 'fmt-ice',
    note: 'MTN and IT10 variants.',
  },
  {
    family: 'Tracker',
    format: 'MED / OctaMED',
    extensions: 'med, mmd, mmd0–mmd3, mmdc',
    loader: 'fmt-med',
    note: 'MMD0–MMD3 plus MED2/3/4 instruments.',
  },
  {
    family: 'Tracker',
    format: 'Ultimate Soundtracker',
    extensions: 'st',
    loader: 'fmt-st',
    note: 'The 15-instrument ST/UST root of the MOD family.',
  },
  {
    family: 'Tracker',
    format: 'Future Composer',
    extensions: 'fc13, fc14',
    loader: 'fmt-fc',
    note: 'Loader 1:1 with Load_fc.cpp; InstrumentSynth engine port.',
  },
  {
    family: 'Packed',
    format: 'ProWizard depackers',
    extensions: 'pow, pp, xpk, pack, p61, utz',
    loader: 'fmt-prowizard',
    note: '30 packers unpacked before the MOD loader sees the file.',
  },
  {
    family: 'Container',
    format: 'Un4seen MO3',
    extensions: 'mo3',
    loader: 'fmt-mo3',
    note: 'MO3 container with an XM/IT/S3M/MOD/MTM inner module.',
  },
  {
    family: 'Chiptune',
    format: 'Commodore 64 SID',
    extensions: 'sid',
    loader: 'fmt-sid',
    note: 'PSID/RSID; sample-exact against a cRSID oracle build.',
  },
  {
    family: 'Streamed',
    format: 'WAV / MP3 / Ogg Vorbis',
    extensions: 'wav, mp3, ogg',
    loader: 'stream-audio',
    note: 'Decoded to stereo float and played through the same output.',
  },
];

/** Verification numbers that appear on the landing page. */
export const figures = [
  { value: '4,863', label: 'reference-parsed files, 0 load failures' },
  { value: '110 / 0', label: 'mixer-state frames passed / failed' },
  { value: '1.0000', label: 'render correlation on in-tune fixtures' },
  { value: '48 / 48', label: 'SID tunes sample-exact vs cRSID' },
];
