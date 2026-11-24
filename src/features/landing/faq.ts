/* The homepage FAQ. One list feeds both the page and its FAQPage structured
   data, so what search engines and AI tools quote is exactly what students
   read. `lead` is shown in bold before the answer, `tail` in bold after it.
   Date-bound answers say "As of" so a stale one is obvious. */

export type LandingFaqItem = {
  question: string;
  answer: string;
  lead?: string;
  tail?: string;
};

export const LANDING_FAQ: LandingFaqItem[] = [
  {
    question: "Are these real past questions?",
    answer:
      "Yes. JAMB questions come from real UTME papers, and UI questions from UI's own screening exams. We check every answer ourselves and explain each one step by step.",
  },
  {
    question: "Will I ever get JAMB questions in my UI Post-UTME practice?",
    lead: "Never.",
    answer:
      "Each exam keeps its own questions, timing and league. If you're writing both, you switch exams the way you'd switch accounts.",
  },
  {
    question: "What is a duel?",
    answer:
      "A live practice race between you and another student: the same questions on the same clock. You can see which question they're on, and whoever gets more marks wins. Free accounts play taster duels of one subject and 15 questions.",
  },
  {
    question: "Can I start for free?",
    answer:
      "Yes. Sign up and you get one full paper for your exam with up to 3 tries, plus the daily challenge, taster duels, your streak and the weekly league. No card needed.",
  },
  {
    question: "Which JAMB subjects can I practise?",
    answer:
      "Use of English, Physics, Chemistry, Biology, Mathematics, Government, Christian Religious Studies and Economics. We keep adding more.",
  },
  {
    question: "Is there a StudyBond app?",
    answer:
      "It's coming, Android first, and it's built to work offline. The app keeps timed exams of real past questions saved on your phone for you, so you can sit them with no network, and your results sync when you're back online. Free students get their free paper offline too, and premium keeps more ready. Until then, StudyBond works in the browser on any phone or laptop, and your account, streak and progress move straight into the app.",
  },
  {
    question: "What if my network goes off during a paper?",
    answer:
      "Keep going. Your answers stay saved on your phone. When you're back online you can send the paper, and we show how long you have left to send it.",
  },
  {
    question: "When is the 2027 UTME?",
    answer:
      "JAMB hasn't announced the dates yet. A timetable the government proposed in October 2026 puts the UTME between 15 and 25 March 2027, earlier than usual.",
    tail: "As of November 2026.",
  },
];

/** Plain text for structured data: lead, answer and tail in one string. */
export function faqPlainText(item: LandingFaqItem): string {
  return [item.lead, item.answer, item.tail].filter(Boolean).join(" ");
}
