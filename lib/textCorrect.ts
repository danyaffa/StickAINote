// FILE: lib/textCorrect.ts
//
// WHY: One shared, offline, FREE correction engine used by both the
// while-typing auto-correct and the inline "blue underline" writing
// suggestions. Single dictionary here removes the previous
// duplicate/contradicting auto-correct logic that lived in two files.
// Never calls a network API, so it cannot fail with "AI request failed".

export const AUTO_CORRECT_MAP: Record<string, string> = {
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
  amm: "am", amn: "am",
  wrritting: "writing", writting: "writing", writeing: "writing", writing: "writing",
  spellling: "spelling", speling: "spelling", spelin: "spelling",
  doen: "does", doent: "doesn't", "doen't": "doesn't",
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
  i: "I",
};

const PHRASE_FIXES: { re: RegExp; fix: string }[] = [
  { re: /\bauto correct\b/gi, fix: "auto-correct" },
];

export function preserveCase(original: string, replacement: string): string {
  if (!original) return replacement;
  if (/^I('|$)/.test(replacement)) return replacement;
  if (original.length > 1 && original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase() && replacement.length > 1) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function correctWord(word: string): string | null {
  const fix = AUTO_CORRECT_MAP[word.toLowerCase()];
  if (!fix) return null;
  const cased = preserveCase(word, fix);
  return cased === word ? null : cased;
}

export type TextIssue = {
  index: number;
  length: number;
  original: string;
  suggestion: string;
  type: "spelling" | "duplicate" | "capitalize" | "spacing" | "phrase";
};

export function findIssues(text: string): TextIssue[] {
  const issues: TextIssue[] = [];
  if (!text) return issues;

  const wordRe = /[A-Za-z][A-Za-z']*/g;
  let m: RegExpExecArray | null;
  while ((m = wordRe.exec(text)) !== null) {
    const word = m[0];
    const fix = correctWord(word);
    if (fix) {
      issues.push({ index: m.index, length: word.length, original: word, suggestion: fix, type: "spelling" });
    }
  }

  const dupRe = /\b([A-Za-z']+)(\s+)(\1)\b/gi;
  while ((m = dupRe.exec(text)) !== null) {
    if (m[1].toLowerCase() === m[3].toLowerCase()) {
      issues.push({ index: m.index, length: m[0].length, original: m[0], suggestion: m[1], type: "duplicate" });
    }
  }

  const sentRe = /(^|[.!?]\s+)([a-z])/g;
  while ((m = sentRe.exec(text)) !== null) {
    const at = m.index + m[1].length;
    issues.push({ index: at, length: 1, original: m[2], suggestion: m[2].toUpperCase(), type: "capitalize" });
  }

  const spaceRe = /\s+([,.;:!?])/g;
  while ((m = spaceRe.exec(text)) !== null) {
    issues.push({ index: m.index, length: m[0].length, original: m[0], suggestion: m[1], type: "spacing" });
  }

  for (const { re, fix } of PHRASE_FIXES) {
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      issues.push({ index: m.index, length: m[0].length, original: m[0], suggestion: fix, type: "phrase" });
    }
  }

  issues.sort((a, b) => (a.index - b.index) || (b.length - a.length));
  const out: TextIssue[] = [];
  let lastEnd = -1;
  for (const it of issues) {
    if (it.index >= lastEnd) { out.push(it); lastEnd = it.index + it.length; }
  }
  return out;
}

export function improveText(text: string): string {
  const issues = findIssues(text);
  if (issues.length === 0) return text;
  let result = "";
  let cursor = 0;
  for (const it of issues) {
    result += text.slice(cursor, it.index) + it.suggestion;
    cursor = it.index + it.length;
  }
  result += text.slice(cursor);
  return result;
}

export function countIssues(text: string): number {
  return findIssues(text).length;
}
