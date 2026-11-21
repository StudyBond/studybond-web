/**
 * Word, Idiom and Phrasal verb of the Day: what the backend sends
 * (studybond-backend src/modules/words/words.schema.ts). Written by hand:
 * the generated OpenAPI file predates these routes, and syncing it would
 * pull in other unfinished backend work.
 */

export type WordKind = "WORD" | "IDIOM" | "PHRASAL_VERB";
export type OptionLetter = "A" | "B" | "C" | "D" | "E";

export type CameOut = {
  /** Short board name, e.g. JAMB. */
  board: string | null;
  /** Every year a linked question came out, oldest first. Two or more = "came out twice". */
  years: number[];
};

export type PublicQuestion = {
  board: string | null;
  year: number | null;
  subject: string;
  /** "Choose the option nearest in meaning ..." */
  instruction: string | null;
  /** The tested sentence. The tested word sits in <u>...</u>; nothing else is HTML. */
  sentence: string;
  /** Options stay behind sign-up on the public page; this is how many bubbles to draw. */
  optionCount: number;
};

export type WordCardView = {
  id: number;
  kind: WordKind;
  slug: string;
  headword: string;
  partOfSpeech: string | null;
  /** Stressed part in capitals, "in-SOL-vent". On /me it is null until the stress tap is done. */
  sayAs: string | null;
  ipa: string | null;
  meaning: string;
  examples: string[];
  builtFrom: string | null;
  comesFrom: string | null;
  opposite: string | null;
  closeTo: string | null;
  watchOut: string | null;
  cameOut: CameOut;
  question: PublicQuestion | null;
};

export type WordDay = {
  date: string;
  word: WordCardView | null;
  idiom: WordCardView | null;
  /** Missing from a backend older than 2026-11-20. */
  phrasalVerb?: WordCardView | null;
  previousDate: string | null;
  nextDate: string | null;
};

export type ArchiveItem = {
  id: number;
  slug: string;
  headword: string;
  partOfSpeech: string | null;
  meaning: string;
  cameOut: CameOut;
};

export type WordArchive = {
  days: Array<{ date: string; word: ArchiveItem | null; idiom: ArchiveItem | null; phrasalVerb?: ArchiveItem | null }>;
  /** Pass as ?before= for older days. Null when there are none. */
  nextBefore: string | null;
};

export type WordPage = {
  card: WordCardView;
  /** Days this card had its day, newest first. Never a future day. */
  shownOn: string[];
  previousDate: string | null;
  nextDate: string | null;
};

export type WordSitemap = { cards: Array<{ slug: string; lastShown: string }> };

/* ── Signed in ── */

export type MyQuestion = {
  questionId: number;
  /** In JAMB's printed order; never shuffled here. */
  options: Array<{ letter: OptionLetter; text: string }>;
  picked: OptionLetter | null;
  isCorrect: boolean | null;
  /** Null until the student answers. */
  correctOption: OptionLetter | null;
  answerNote: string | null;
  /** The card's "watch out" line, when the student picked JAMB's trap option. */
  trapNote: string | null;
  /** After answering. markedText keeps {{B}} markers. */
  explanation: { text: string; markedText: string } | null;
  /** After answering. correctPercent is null until 30 students have answered. */
  stat: { answered: number; correctPercent: number | null } | null;
};

export type StressTap = {
  syllables: string[];
  pick: number | null;
  /** Null until the student taps. */
  stressIndex: number | null;
  correct: boolean | null;
};

export type MyCard = {
  date: string;
  card: WordCardView;
  /** Words with syllables only. */
  stressTap: StressTap | null;
  knewIt: boolean | null;
  question: MyQuestion | null;
  inWordBook: boolean;
  /** True on the reply that just put the word in the word book. */
  addedToWordBook: boolean;
};

export type MyWordDay = {
  date: string;
  word: MyCard | null;
  idiom: MyCard | null;
  phrasalVerb?: MyCard | null;
  /** Words due for review today. */
  wordBookDue: number;
};

export type AttemptBody = {
  date: string;
  kind: WordKind;
  stressPick?: number;
  knewIt?: boolean;
  pickedOption?: OptionLetter;
};

export type BookRow = {
  cardId: number;
  kind: WordKind;
  slug: string;
  headword: string;
  partOfSpeech: string | null;
  source: "DAILY" | "PRACTICE";
  nextCheck: number | null;
  /** Always 4. */
  checks: number;
  dueOn: string | null;
  learntAt: string | null;
  savedFrom: { board: string | null; year: number | null } | null;
};

export type DueWord = {
  cardId: number;
  kind: WordKind;
  headword: string;
  partOfSpeech: string | null;
  check: number;
  /** Pick by id. The right one has id = cardId. */
  choices: Array<{ id: number; text: string }>;
};

export type WordBook = {
  today: string;
  due: DueWord[];
  /** Not learnt yet, due today first. */
  learning: BookRow[];
  learnt: BookRow[];
  /** Saved from practice (premium). Also listed in learning or learnt. */
  saved: BookRow[];
};

export type ReviewResult = {
  cardId: number;
  correct: boolean;
  meaning: string;
  nextCheck: number | null;
  dueOn: string | null;
  learnt: boolean;
};
