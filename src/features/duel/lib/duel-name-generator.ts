/**
 * Smart Duel Room Name Generator
 *
 * Generates creative, contextual room names based on the selected subjects.
 * Names are designed to feel competitive and arena-themed.
 */

const BATTLE_ADJECTIVES = [
  "Epic", "Savage", "Intense", "Ruthless", "Relentless", "Fierce",
  "Blazing", "Legendary", "Critical", "Supreme", "Final", "Decisive",
  "Brutal", "Merciless", "Ultimate", "Iron", "Steel", "Rapid",
];

const BATTLE_NOUNS = [
  "Showdown", "Clash", "Face-off", "Duel", "Bout", "Arena",
  "Battle", "Challenge", "Throwdown", "Standoff", "Contest", "War",
];

const TIME_LABELS: Record<string, string[]> = {
  morning: ["Dawn", "Morning", "Sunrise", "AM"],
  afternoon: ["Afternoon", "Midday", "Daytime"],
  evening: ["Evening", "Night", "Midnight", "Late Night", "PM"],
};

const SUBJECT_FLAVORS: Record<string, string[]> = {
  English: ["Grammar", "Prose", "Literary", "Syntax", "Rhetoric"],
  Mathematics: ["Calculus", "Numbers", "Equation", "Formula", "π"],
  Physics: ["Quantum", "Gravity", "Newton's", "Force", "Energy"],
  Chemistry: ["Atomic", "Molecular", "Element", "Reaction", "Lab"],
  Biology: ["Cell", "Genome", "Darwin's", "Organism", "Bio"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getDayLabel(): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[new Date().getDay()];
}

/**
 * Generates a smart, contextual duel room name.
 * Takes selected subjects to create subject-aware names.
 */
export function generateDuelName(subjects: string[]): string {
  const patterns = [
    // Pattern 1: "The [Adjective] [Subject] [Noun]"
    () => {
      const subjectFlavor = subjects.length > 0
        ? pick(SUBJECT_FLAVORS[subjects[0]] || [subjects[0]])
        : pick(BATTLE_ADJECTIVES);
      return `The ${pick(BATTLE_ADJECTIVES)} ${subjectFlavor} ${pick(BATTLE_NOUNS)}`;
    },

    // Pattern 2: "[Day] [Noun]: [Subject] Edition"
    () => {
      const subjectLabel = subjects.length === 1
        ? subjects[0]
        : subjects.length > 1
          ? `${subjects[0]} & ${subjects[1]}`
          : "General";
      return `${getDayLabel()} ${pick(BATTLE_NOUNS)}: ${subjectLabel}`;
    },

    // Pattern 3: "[TimeOfDay] [Subject] [Noun]"
    () => {
      const time = pick(TIME_LABELS[getTimeOfDay()]);
      const subject = subjects.length > 0 ? subjects[0] : "Academic";
      return `${time} ${subject} ${pick(BATTLE_NOUNS)}`;
    },

    // Pattern 4: "[Adjective] [Noun] — [Subject(s)]"
    () => {
      const subjectLabel = subjects.join(" × ") || "All Subjects";
      return `${pick(BATTLE_ADJECTIVES)} ${pick(BATTLE_NOUNS)} — ${subjectLabel}`;
    },

    // Pattern 5: "Operation [Subject] [Noun]"
    () => {
      const subject = subjects.length > 0
        ? pick(SUBJECT_FLAVORS[subjects[0]] || [subjects[0]])
        : pick(BATTLE_ADJECTIVES);
      return `Operation ${subject} ${pick(BATTLE_NOUNS)}`;
    },
  ];

  return pick(patterns)();
}
