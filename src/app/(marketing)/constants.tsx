import { Clock, Flame, Trophy, BookOpen, Target, Swords } from "lucide-react";

export const leaderboardUsers = [
  { name: "Adebowale D.", sp: "15,420", seed: "Felix", tag: "Medicine" },
  { name: "Chioma O.", sp: "14,850", seed: "Aneka", tag: "Law" },
  { name: "Ibrahim S.", sp: "14,200", seed: "John", tag: "Engineering" },
  { name: "Amara E.", sp: "13,900", seed: "Sarah", tag: "Pharmacy" },
  { name: "Tunde B.", sp: "13,550", seed: "Tunde", tag: "Medicine" },
];

export const streakDays = [
  { day: "Mon", active: true }, { day: "Tue", active: true }, { day: "Wed", active: true },
  { day: "Thu", active: true }, { day: "Fri", active: true }, { day: "Sat", active: false }, { day: "Sun", active: false },
];

export const features = [
  { icon: <Clock className="h-5 w-5" />, title: "Timed Practice", description: "Real exam conditions — 100 questions, 90 minutes." },
  { icon: <Flame className="h-5 w-5" />, title: "Daily Streaks", description: "Build habits. Earn rewards at 3, 7, 14, and 30-day milestones." },
  { icon: <Trophy className="h-5 w-5" />, title: "Leaderboard", description: "Top 50 students ranked weekly. Resets every Sunday." },
  { icon: <BookOpen className="h-5 w-5" />, title: "Real Past Questions", description: "Actual UI Post-UTME questions, not generic content." },
  { icon: <Target className="h-5 w-5" />, title: "Score Analytics", description: "Track SP, scores, and subject strengths over time." },
  { icon: <Swords className="h-5 w-5" />, title: "1v1 Duels", description: "Challenge students in real-time head-to-head battles." },
];

export const faq = [
  { question: "Is the UI Post-UTME 2026 form officially out?", answer: "Yes! The University of Ibadan (UI) Post-UTME 2026/2027 form is officially out. Registration opens on Monday, June 22, 2026, and closes on Sunday, July 19, 2026. The CBT exams run from Monday, July 27 to Wednesday, July 29, 2026. Read our full [UI Post-UTME 2026 registration guide](/blog/ui-post-utme-registration) for details." },
  { question: "What is StudyBond?", answer: "StudyBond is Nigeria's #1 exam preparation platform for students preparing for Post-UTME exams. Practice with [real UI Post-UTME past questions](/ui-post-utme) in a timed CBT simulation to score high." },
  { question: "Is it really free to start?", answer: "Yes. Every student gets a free full UI Post-UTME exam. No credit card, no trial period. [Create a free account](/signup) to take your first full exam today. Premium unlocks subject practice, more exams, and duels." },
  { question: "Does it simulate real exam conditions?", answer: "Absolutely — 100 questions, 90 minutes, just like the real exam. [Try our timed CBT exam simulation](/signup) now to practice under time pressure." },
  { question: "What subjects are covered?", answer: "All four UI Post-UTME subjects: English Language, Chemistry, Physics, and Biology. [Select your subject combination](/signup) to start practicing." },
  { question: "Will you support other universities?", answer: "Yes! OAU, UNILAG, and others are coming soon — each with their own question banks. Sign up to [start practicing UI past questions](/signup) in the meantime." },
];

export const pricingFree = [
  "1 full UI Post-UTME exam",
  "Up to 3 attempts",
  "Leaderboard access",
  "Streak tracking",
  "Basic score report",
];

export const pricingPremium = [
  "Unlimited full exams",
  "Subject-specific practice",
  "1v1 Duel battles",
  "Detailed analytics & insights",
  "Priority question bank updates",
  "Streak freezers",
  "All future features",
];

export const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "For schools/tutorials", href: "#" },
  ],
  learn: [
    { label: "Blog", href: "/ui-post-utme#guides" },
    { label: "Resources", href: "/ui-post-utme" },
    { label: "Guides", href: "/ui-post-utme#guides" },
    { label: "FAQ", href: "/#faq" },
  ],
  company: [
    { label: "About us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "#" },
  ],
  legal: [
    { label: "Terms of service", href: "#" },
    { label: "Privacy policy", href: "#" },
    { label: "Cookie policy", href: "#" },
  ],
};

export const socialLinks = [
  { name: "X", href: "#", key: "x" },
  { name: "Instagram", href: "#", key: "instagram" },
  { name: "LinkedIn", href: "#", key: "linkedin" },
  { name: "TikTok", href: "#", key: "tiktok" },
];
