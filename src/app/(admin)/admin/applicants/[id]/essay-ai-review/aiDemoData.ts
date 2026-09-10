export const PLACEHOLDER_ESSAY_TEXT = `I have always been fascinated by the human body and how it heals itself. Growing up, I watched my grandmother struggle with chronic back pain until she found relief through chiropractic care. This experience sparked my interest in natural, non-invasive approaches to health. During high school, I volunteered at a local health clinic where I observed practitioners working closely with patients. I learned the importance of listening carefully to each person's story. I believe chiropractic care offers a holistic path to wellness that empowers patients rather than simply treating symptoms. I am committed to the rigorous academic demands of this five-year programme. My goal is to become a chiropractor who serves rural communities where access to care is limited.`;

export interface SentimentNote {
  sentenceIndex: number;
  tone: "positive" | "neutral" | "concern";
  note: string;
}

const NOTE_POOL: Omit<SentimentNote, "sentenceIndex">[] = [
  { tone: "positive", note: "Strong personal motivation clearly expressed — genuine voice comes through." },
  { tone: "neutral", note: "Factual statement. Consider adding a specific example here to strengthen impact." },
  { tone: "positive", note: "Good use of concrete detail — this grounds the statement well." },
  { tone: "concern", note: "This claim is fairly general. A specific anecdote would make it more persuasive." },
  { tone: "positive", note: "Reflects well on self-awareness and readiness for the programme." },
  { tone: "neutral", note: "Transition point — clear but could connect more explicitly to the next idea." },
];

export function generateDemoAnnotations(text: string): {
  sentences: string[];
  notes: SentimentNote[];
  strengths: string[];
  weaknesses: string[];
  overallSentiment: "positive" | "neutral" | "mixed";
} {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return { sentences: [], notes: [], strengths: [], weaknesses: [], overallSentiment: "neutral" };
  }

  // Deterministically pick up to 4 sentence indices to annotate: first, ~1/3, ~2/3, last.
  const pickCount = Math.min(4, sentences.length);
  const indices = Array.from(new Set(
    Array.from({ length: pickCount }, (_, i) =>
      Math.round((i * (sentences.length - 1)) / Math.max(pickCount - 1, 1))
    )
  ));

  const notes: SentimentNote[] = indices.map((idx, i) => ({
    sentenceIndex: idx,
    ...NOTE_POOL[i % NOTE_POOL.length],
  }));

  return {
    sentences,
    notes,
    strengths: [
      "Clear articulation of personal motivation for studying chiropractic.",
      "Demonstrates self-reflection and awareness of the demands of the programme.",
      "Statement is well-structured with a logical flow from motivation to goals.",
    ],
    weaknesses: [
      "Could include more specific, concrete examples or experiences to support claims.",
      "Some statements are general and would benefit from personalisation.",
      "Consider strengthening the conclusion with a clearer forward-looking statement.",
    ],
    overallSentiment: "positive",
  };
}
