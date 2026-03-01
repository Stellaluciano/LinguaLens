import { useCallback, useMemo, useState } from 'react';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Editor } from './components/Editor';
import { getSelectedText } from './lib/selection';
import type { AnalyzeResponse } from './lib/types';

const initialText = `La inteligencia artificial está transformando el mundo rápidamente.\n\nEs fascinante ver cómo la tecnología avanza.`;

const App = () => {
  const [text, setText] = useState(initialText);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canAnalyze = useMemo(() => selectedSentence.length >= 2, [selectedSentence]);

  const analyzeSentence = useCallback(async (sentence: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence, sourceLang: 'auto', targetLang: 'zh' })
      });

      if (!response.ok) {
        throw new Error('Unable to analyze sentence right now.');
      }

      const data = (await response.json()) as AnalyzeResponse;
      setAnalysis(data);
    } catch {
      setAnalysis(null);
      setError('Analysis failed. Please try selecting the sentence again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelection = useCallback(() => {
    const selected = getSelectedText();
    if (selected.length < 2 || selected === selectedSentence) {
      return;
    }

    setSelectedSentence(selected);
    void analyzeSentence(selected);
  }, [analyzeSentence, selectedSentence]);

  return (
    <main className="min-h-screen bg-nordic-bg px-8 py-10 font-sans text-nordic-text">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-nordic-border bg-nordic-panel px-6 py-4 shadow-panel">
          <h1 className="text-3xl font-semibold tracking-tight text-nordic-text">LinguaLens</h1>
          <span className="rounded-lg border border-nordic-border px-3 py-2 text-sm text-nordic-muted">Nordic Minimal Reading Assistant</span>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Editor value={text} onChange={setText} onMouseUp={handleSelection} />
          </div>
          <div className="lg:col-span-2">
            <AnalysisPanel selectedSentence={selectedSentence} loading={loading && canAnalyze} error={error} analysis={analysis} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
