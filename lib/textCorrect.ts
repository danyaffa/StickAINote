// FILE: lib/textCorrect.ts
//
// WHY: One shared, offline, FREE correction engine used by both the
// while-typing auto-correct and the inline "blue underline" writing
// suggestions. Keeping a single dictionary here removes the previous
// duplicate/contradicting auto-correct logic that lived in two files.
//
// This file never calls a network API, so it cannot fail with
// "AI request failed" and works with no API key.

/* ─── Misspelling / contraction dictionary (lowercase key → fix) ─── */
export const AUTO_CORRECT_MAP: Record<string, string> = {
  // Common typos
  teh: "the", hte: "the", thee: "the", thhe: "the", tehn: "then",
  thier: "their", adn: "and", nad: "and", anbd: "and",
  hwo: "who", waht: "what", taht: "that", wiht: "with", wich: "which",
  becuase: "because", becasue: "because", beacuse: "because",
  recieve: "receive", reciept: "receipt", recieved: "received",
  seperate: "separate", occured: "occurred", occurence: "occurrence",
  definately: "definitely", definetly: "definitely", defintely: "definitely",
  accomodate: "accommodate", acommodate: "accommodate",
  apparantly: "apparently", apparantely: "apparently",
  calender: "calendar", catagory: "category", cemetary: "cemetery",
  changable: "changeable", collegue: "colleague", comming: "coming",
  commited: "committed", commitee: "committee",
  comparision: "comparison", concious: "conscious", copywrite: "copyright",
  desireable: "desirable", developement: "development",
  diffrent: "different", dissapear: "disappear", dissapoint: "disappoint",
  embarass: "embarrass", enviroment: "environment", exagerate: "exaggerate",
  excercise: "exercise", existance: "existence", experiance: "experience",
  familar: "familiar", finaly: "finally", foriegn: "foreign",
  fourty: "forty", freind: "friend", goverment: "government",
  gaurd: "guard", happend: "happened", harrass: "harass",
  immediatly: "immediately", independant: "independent",
  intresting: "interesting", knowlege: "knowledge", libary: "library",
  lisence: "licence", maintainance: "maintenance", millenium: "millennium",
  neccessary: "necessary", noticable: "noticeable",
  occassion: "occasion", occassionally: "occasionally",
  paralel: "parallel", parliment: "parliament", persistant: "persistent",
  posession: "possession", prefered: "preferred", priveledge: "privilege",
  profesional: "professional", publically: "publicly",
  realy: "really", refered: "referred", relavant: "relevant",
  religous: "religious", rember: "remember", remeber: "remember",
  repitition: "repetition", resistence: "resistance", shedule: "schedule",
  sieze: "seize", sence: "sense", sentance: "sentence",
  succesful: "successful", suprise: "surprise", temperture: "temperature",
  therefor: "therefore", tommorow: "tomorrow", tomorro: "tomorrow",
  tounge: "tongue", truely: "truly", untill: "until",
  usally: "usually", vaccum: "vacuum", vegatable: "vegetable",
  wether: "whether",
  // Typos from the user's own test sentence
  amm: "am", amn: "am",
  wrritting: "writing", writting: "writing", writeing: "writing", writing: "writing",
  spellling: "spelling", speling: "spelling", spelin: "spelling",
  doen: "does", doent: "doesn't", "doen't": "doesn't",

  // Contractions (apostrophe expansion)
  dont: "don't", doesnt: "doesn't", didnt: "didn't",
  cant: "can't", wont: "won't", wouldnt: "wouldn't",
  shouldnt: "shouldn't", couldnt: "couldn't", isnt: "isn't",
  arent: "aren't", wasnt: "wasn't", werent: "weren't",
  hasnt: "hasn't", havent: "haven't", hadnt: "hadn't",
  im: "I'm", ive: "I've", ill: "I'll", iam: "I am", id: "I'd",
  youre: "you're", youve: "you've", youll: "you'll",
  theyre: "they're", theyve: "they've", theyll: "they'll",
  weve: "we've", wel: "we'll",
  hes: "he's", shes: "she's",
  thats: "that's", whats: "what's", whos: "who's",
  wheres: "where's", heres: "here's", theres: "there's",
  lets: "let's",
  // Lone "i" → "I"
  i: "I",
};

/* Words that should auto-hyphenate when written as two words near "auto". */
const PHRASE_FIXES: { re: RegExp; fix: string }[] = [
  { re: /\bauto correct\b/gi, fix: "auto-correct" },
];

export function preserveCase(original: string, replacement: string): string {
  if (!original) return replacement;
  // Never up/down-case the special "I" forms.
  if (/^I('|$)/.test(replacement)) return replacement;
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase() && replacement.length > 1) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/** Return the corrected form of a single word, or null if no change. */
export function correctWord(word: string): string | null {
  const fix = AUTO_CORRECT_MAP[word.toLowerCase()];
  if (!fix) return null;
  const cased = preserveCase(word, fix);
  return cased === word ? null : cased;
}

export type TextIssue = {
  index: number; // start offset within the supplied string
  length: number; // length of the original slice
  original: string;
  suggestion: string;
  type: "spelling" | "duplicate" | "capitalize" | "spacing" | "phrase";
};

/**
 * Scan a single plain-text string and return the writing issues found,
 * with the suggested replacement for each. Offsets are relative to `text`.
 * Used to draw the blue underlines and to apply per-word fixes.
 */
export function findIssues(text: string): TextIssue[] {
  const issues: TextIssue[] = [];
  if (!text) return issues;

  // 1) Misspellings / contractions, word by word.
  const wordRe = /[A-Za-z][A-Za-z']*/g;
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(text)) !== null) {
    const word = m[0];
    const fix = correctWord(word);
    if (fix) {
      issues.push({
        index: m.index,
        length: word.length,
        original: word,
        suggestion: fix,
        type: "spelling",
      });
    }
  }

  // 2) Duplicate words ("thee thee", "the the").
  const dupRe = /\b([A-Za-z']+)(\s+)(\1)\b/gi;
  while ((m = dupRe.exec(text)) !== null) {
    // Only flag when both words are identical (case-insensitive).
    if (m[1].toLowerCase() === m[3].toLowerCase()) {
      issues.push({
        index: m.index,
        length: m[0].length,
        original: m[0],
        suggestion: m[1],
        type: "duplicate",
      });
    }
  }

  // 3) Sentence-start capitalization (letter after . ! ? or string start).
  const sentRe = /(^|[.!?]\s+)([a-z])/g;
  while ((m = sentRe.exec(text)) !== null) {
    const lead = m[1];
    const ch = m[2];
    const at = m.index + lead.length;
    // Skip if this position is already covered by a spelling fix.
    issues.push({
      index: at,
      length: 1,
      original: ch,
      suggestion: ch.toUpperCase(),
      type: "capitalize",
    });
  }

  // 4) Space before punctuation ("word ." → "word.").
  const spaceRe = /\s+([,.;:!?])/g;
  while ((m = spaceRe.exec(text)) !== null) {
    issues.push({
      index: m.index,
      length: m[0].length,
      original: m[0],
      suggestion: m[1],
      type: "spacing",
    });
  }

  // 5) Common two-word phrases that should be hyphenated.
  for (const { re, fix } of PHRASE_FIXES) {
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      issues.push({
        index: m.index,
        length: m[0].length,
        original: m[0],
        suggestion: preserveCase(m[0][0], fix) === fix ? fix : fix,
        type: "phrase",
      });
    }
  }

  // De-duplicate overlapping issues: keep the earliest, longest at each start.
  issues.sort((a, b) => (a.index - b.index) || (b.length - a.length));
  const out: TextIssue[] = [];
  let lastEnd = -1;
  for (const it of issues) {
    if (it.index >= lastEnd) {
      out.push(it);
      lastEnd = it.index + it.length;
    }
  }
  return out;
}

/**
 * Apply every detected fix to a plain-text string and return the improved
 * text. This is the FREE offline fallback for "Fix Spelling & Grammar"
 * when no AI key is configured.
 */
export function improveText(text: string): string {
  const issues = findIssues(text);
  if (issues.length === 0) return text;
  let result = "";
  let cursor = 0;
  // issues are already non-overlapping and sorted by index
  for (const it of issues) {
    result += text.slice(cursor, it.index) + it.suggestion;
    cursor = it.index + it.length;
  }
  result += text.slice(cursor);
  return result;
}

/** Count of issues in a string (used to show "Fix N issues"). */
export function countIssues(text: string): number {
  return findIssues(text).length;
}
