import type { WordPos, WordBreakdown } from './types';

const POS_CLASSES: Record<WordPos, string> = {
  noun: 'bg-sky-100 text-sky-700',
  verb: 'bg-emerald-100 text-emerald-700',
  adj: 'bg-orange-100 text-orange-700',
  adv: 'bg-violet-100 text-violet-700',
  prep: 'bg-slate-200 text-slate-700',
  pron: 'bg-cyan-100 text-cyan-700',
  det: 'bg-indigo-100 text-indigo-700',
  conj: 'bg-rose-100 text-rose-700',
  num: 'bg-amber-100 text-amber-700',
  other: 'bg-zinc-100 text-zinc-700'
};

const normalizeToken = (token: string) => token.toLowerCase().replace(/[.,!?;:()"“”'’]/g, '');

export const getPosClass = (pos: WordPos): string => POS_CLASSES[pos] ?? POS_CLASSES.other;

export const highlightSentence = (sentence: string, words: WordBreakdown[]): Array<{ token: string; className: string }> => {
  const map = new Map<string, WordPos>();

  words.forEach((item) => {
    const normalized = normalizeToken(item.word);
    if (normalized) {
      map.set(normalized, item.pos);
    }
  });

  return sentence.split(/(\s+)/).map((token) => {
    if (/^\s+$/.test(token)) {
      return { token, className: '' };
    }

    const normalized = normalizeToken(token);
    const pos = map.get(normalized);
    return {
      token,
      className: pos ? `${getPosClass(pos)} rounded px-1 transition-colors duration-200` : ''
    };
  });
};
