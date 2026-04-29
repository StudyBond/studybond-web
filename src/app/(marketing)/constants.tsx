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
  { question: "What is StudyBond?", answer: "StudyBond is a focused exam preparation platform for Nigerian students preparing for Post-UTME exams. We start with UI and expanding soon." },
  { question: "Is it really free to start?", answer: "Yes. Every student gets a free full UI Post-UTME exam. No credit card, no trial period. Premium unlocks subject practice, more exams, and duels." },
  { question: "Does it simulate real exam conditions?", answer: "Absolutely — 100 questions, 90 minutes, just like the real thing. Sprint sessions also available." },
  { question: "What subjects are covered?", answer: "All four UI Post-UTME subjects. Practice together or focus on individual subjects (premium)." },
  { question: "Will you support other universities?", answer: "Yes! OAU, UNILAG, and others are coming soon — each with their own question banks." },
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
    { label: "Features", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "How it works", href: "#" },
    { label: "For schools/tutorials", href: "#" },
  ],
  learn: [
    { label: "Blog", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Guides", href: "#" },
    { label: "FAQ", href: "#" },
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
