/**
 * Accent palettes used for subject cards and language badges.
 * Each entry provides four tokens so a card only needs
 * `style={{ '--accent': ..., ... }}` to be fully themed.
 */
export const ACCENTS = {
  indigo: {
    base: '#4f46e5',
    soft: '#eef1ff',
    border: '#d7dbfb',
    text: '#3730a3',
  },
  emerald: {
    base: '#059669',
    soft: '#ecfdf5',
    border: '#c0ead9',
    text: '#065f46',
  },
  sky: {
    base: '#0284c7',
    soft: '#eff8ff',
    border: '#c4e2f7',
    text: '#075985',
  },
  amber: {
    base: '#b45309',
    soft: '#fffbeb',
    border: '#f3dfb2',
    text: '#92400e',
  },
  rose: {
    base: '#e11d48',
    soft: '#fff1f4',
    border: '#fbcfda',
    text: '#9f1239',
  },
  violet: {
    base: '#7c3aed',
    soft: '#f5f1ff',
    border: '#dccffb',
    text: '#5b21b6',
  },
};

/** Resolve a subject's `accent` key to its palette (indigo by default). */
export function accentStyle(accentKey) {
  const accent = ACCENTS[accentKey] || ACCENTS.indigo;
  return {
    '--accent': accent.base,
    '--accent-soft': accent.soft,
    '--accent-border': accent.border,
    '--accent-text': accent.text,
  };
}
