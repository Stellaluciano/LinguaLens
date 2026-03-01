export type WordPos = 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'pron' | 'det' | 'conj' | 'num' | 'other';

export interface WordBreakdown {
  word: string;
  pos: WordPos;
  translation: string;
  lemma: string;
  notes?: string;
}

export interface GrammarInsight {
  tense: string;
  structure: string;
  subject: string;
  verb: string;
  object: string;
  explanation: string;
}

export interface AnalyzeResponse {
  translation: string;
  words: WordBreakdown[];
  grammar: GrammarInsight;
}
