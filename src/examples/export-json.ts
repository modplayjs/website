import type { ExportPlugin, ModuleData } from '@modplayjs/core';

export const jsonExport: ExportPlugin = {
  name: 'json',
  label: 'Normalized module (JSON)',
  extension: 'json',

  supports() {
    return true;
  },

  write(mod: ModuleData) {
    const text = JSON.stringify(
      mod,
      (_key, value) => (value instanceof Uint8Array ? Array.from(value) : value),
      2,
    );
    return new TextEncoder().encode(text);
  },
};
