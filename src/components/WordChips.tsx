import { getPosClass } from '../lib/highlight';
import type { WordBreakdown } from '../lib/types';

interface WordChipsProps {
  words: WordBreakdown[];
}

export const WordChips = ({ words }: WordChipsProps) => {
  return (
    <ul className="space-y-3">
      {words.map((item, index) => (
        <li key={`${item.word}-${index}`} className="rounded-lg border border-nordic-border bg-white px-3 py-2 transition duration-200 hover:border-nordic-accent/60">
          <div className="flex flex-wrap items-center gap-2 text-sm text-nordic-text">
            <span className={`rounded px-2 py-1 text-sm font-semibold ${getPosClass(item.pos)}`}>{item.word}</span>
            <span className="font-medium uppercase tracking-wide text-nordic-muted">{item.pos}</span>
            <span className="text-nordic-text">{item.translation}</span>
          </div>
          <div className="mt-1 text-xs text-nordic-muted">lemma: {item.lemma}{item.notes ? ` · ${item.notes}` : ''}</div>
        </li>
      ))}
    </ul>
  );
};
