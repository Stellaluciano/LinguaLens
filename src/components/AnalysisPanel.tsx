import { highlightSentence } from '../lib/highlight';
import type { AnalyzeResponse } from '../lib/types';
import { WordChips } from './WordChips';

interface AnalysisPanelProps {
  selectedSentence: string;
  loading: boolean;
  error: string;
  analysis: AnalyzeResponse | null;
}

const Skeleton = () => (
  <div className="space-y-3">
    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
  </div>
);

export const AnalysisPanel = ({ selectedSentence, loading, error, analysis }: AnalysisPanelProps) => {
  const highlighted = analysis ? highlightSentence(selectedSentence, analysis.words) : [];

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl border border-nordic-border bg-nordic-panel p-6 shadow-panel">
      <div className="rounded-xl border border-nordic-border bg-[#fbfcfb] p-4">
        <h2 className="text-lg font-semibold text-nordic-text">Sentence Analysis</h2>
        <div className="mt-3 min-h-14 text-xl leading-9 text-nordic-text">
          {selectedSentence ? (
            highlighted.length > 0 ? (
              highlighted.map((part, idx) => (
                <span key={`${part.token}-${idx}`} className={part.className}>
                  {part.token}
                </span>
              ))
            ) : (
              selectedSentence
            )
          ) : (
            <p className="text-base italic text-nordic-muted">Select a sentence to analyze.</p>
          )}
        </div>
      </div>

      {loading ? <Skeleton /> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {analysis ? (
        <>
          <div className="rounded-xl border border-nordic-border bg-white p-4">
            <h3 className="text-base font-semibold text-nordic-text">Translation</h3>
            <p className="mt-2 text-nordic-text">{analysis.translation}</p>
          </div>

          <div className="rounded-xl border border-nordic-border bg-white p-4">
            <h3 className="text-base font-semibold text-nordic-text">Word Breakdown</h3>
            <div className="mt-3">
              <WordChips words={analysis.words} />
            </div>
          </div>

          <div className="rounded-xl border border-nordic-border bg-white p-4">
            <h3 className="text-base font-semibold text-nordic-text">Grammar Insight</h3>
            <dl className="mt-3 space-y-2 text-sm text-nordic-text">
              <div><dt className="font-medium">Tense:</dt><dd>{analysis.grammar.tense}</dd></div>
              <div><dt className="font-medium">Structure:</dt><dd>{analysis.grammar.structure}</dd></div>
              <div><dt className="font-medium">Subject:</dt><dd>{analysis.grammar.subject}</dd></div>
              <div><dt className="font-medium">Verb:</dt><dd>{analysis.grammar.verb}</dd></div>
              <div><dt className="font-medium">Object:</dt><dd>{analysis.grammar.object}</dd></div>
            </dl>
            <p className="mt-3 text-sm text-nordic-muted">{analysis.grammar.explanation}</p>
          </div>
        </>
      ) : null}
    </section>
  );
};
