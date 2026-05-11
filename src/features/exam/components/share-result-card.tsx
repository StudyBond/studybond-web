"use client";

import Image from "next/image";
import { useRef, useState, useCallback, useMemo, useEffect, cloneElement } from "react";
import { createPortal } from "react-dom";
import { Share2, Download, X, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { ExamResult } from "@/lib/api/types";

// ─── Smart Messages Based on Score ───

type ScoreTier = "legendary" | "excellent" | "solid" | "average" | "needs_work";

function getScoreTier(percentage: number): ScoreTier {
  if (percentage >= 90) return "legendary";
  if (percentage >= 75) return "excellent";
  if (percentage >= 60) return "solid";
  if (percentage >= 40) return "average";
  return "needs_work";
}

const SHARE_HEADLINES: Record<ScoreTier, string[]> = {
  legendary: [
    "Absolutely Crushed It",
    "Built Different",
    "Nothing Short of Legendary",
    "This Is What Mastery Looks Like",
  ],
  excellent: [
    "Strong Performance",
    "On Fire Today",
    "That's How It's Done",
    "Levels to This",
  ],
  solid: [
    "Putting in the Work",
    "Steady Progress",
    "Building Momentum",
    "Getting Closer Every Day",
  ],
  average: [
    "The Grind Continues",
    "Every Rep Counts",
    "Growth in Progress",
    "Learning From Every Question",
  ],
  needs_work: [
    "The Comeback Starts Now",
    "Champions Are Built Here",
    "Failure Is Just Data",
    "Watch This Space",
  ],
};

const SHARE_SUBTITLES: Record<ScoreTier, string[]> = {
  legendary: [
    "When preparation meets execution.",
    "StudyBond does things differently.",
    "Not luck — it's preparation.",
  ],
  excellent: [
    "Consistency is the real superpower.",
    "Hard work speaks for itself.",
    "This is what focused studying looks like.",
  ],
  solid: [
    "Progress over perfection, always.",
    "Every session is an investment.",
    "The results are speaking.",
  ],
  average: [
    "The journey matters more than the score.",
    "Still showing up, still growing.",
    "Watch the progress, not the number.",
  ],
  needs_work: [
    "Today's score is tomorrow's fuel.",
    "Growth starts at the edge of comfort.",
    "The best are made, not born.",
  ],
};

// Premium tier metadata for visual design
const TIER_METADATA: Record<ScoreTier, { emoji: string; accentColor: string; bgGradient: [string, string]; glowColor: string }> = {
  legendary: {
    emoji: "🏆",
    accentColor: "#FFD700",
    bgGradient: ["#0f0a05", "#1a0f08"],
    glowColor: "rgba(255, 215, 0, 0.2)",
  },
  excellent: {
    emoji: "🔥",
    accentColor: "#FF6B35",
    bgGradient: ["#0a0a0f", "#0f0805"],
    glowColor: "rgba(255, 107, 53, 0.15)",
  },
  solid: {
    emoji: "📊",
    accentColor: "#c17a28",
    bgGradient: ["#0a0a0f", "#0d0d14"],
    glowColor: "rgba(193, 122, 40, 0.12)",
  },
  average: {
    emoji: "💪",
    accentColor: "#64B5F6",
    bgGradient: ["#0a0a0f", "#0a0d14"],
    glowColor: "rgba(100, 181, 246, 0.1)",
  },
  needs_work: {
    emoji: "🚀",
    accentColor: "#9C27B0",
    bgGradient: ["#0a0a0f", "#0d0a14"],
    glowColor: "rgba(156, 39, 176, 0.1)",
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Canvas Rendering - PREMIUM REDESIGN ───

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;
const TRANSPARENT = "rgba(0, 0, 0, 0)";

async function renderShareCard(
  result: ExamResult,
  headline: string,
  subtitle: string,
  metadataOverride?: typeof TIER_METADATA[keyof typeof TIER_METADATA] & { isDuel?: boolean }
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas 2D context not available");

  const tier = getScoreTier(result.percentage);
  const metadata = metadataOverride || TIER_METADATA[tier];
  const headerLabel = metadataOverride?.isDuel ? "DUEL ARENA" : tier.toUpperCase().replace(/_/g, " ");

  // ═══════════════════════════════════════════════════════════════════
  // ─── BACKGROUND WITH PREMIUM GRADIENT SYSTEM ───
  // ═══════════════════════════════════════════════════════════════════
  
  // Ultra-premium layered background
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  bgGrad.addColorStop(0, metadata.bgGradient[0]);
  bgGrad.addColorStop(0.5, "#0a0a0f");
  bgGrad.addColorStop(1, metadata.bgGradient[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ─── Premium geometric pattern overlay (subtle) ───
  ctx.save();
  ctx.globalAlpha = 0.02;
  for (let i = 0; i < 20; i++) {
    const size = 100 + i * 50;
    ctx.strokeStyle = metadata.accentColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(CARD_WIDTH / 2, CARD_HEIGHT / 2, size, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // ─── Premium ambient glows (multiple layers for depth) ───
  const glowIntensity = 0.08;

  // Top-right premium glow
  const glow1 = ctx.createRadialGradient(880, 200, 0, 880, 200, 550);
  glow1.addColorStop(0, metadata.glowColor.replace("0.", "0.15"));
  glow1.addColorStop(0.6, metadata.glowColor.replace("0.", "0.04"));
  glow1.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Bottom-left glow
  const glow2 = ctx.createRadialGradient(200, 1700, 0, 200, 1700, 500);
  glow2.addColorStop(0, metadata.glowColor.replace("0.", "0.08"));
  glow2.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Center accent glow
  const glow3 = ctx.createRadialGradient(CARD_WIDTH / 2, 800, 0, CARD_WIDTH / 2, 800, 600);
  glow3.addColorStop(0, metadata.glowColor.replace("0.", "0.03"));
  glow3.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = glow3;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM ACCENT LINES & BORDERS ───
  // ═══════════════════════════════════════════════════════════════════

  // Top premium bar
  const topGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
  topGrad.addColorStop(0, TRANSPARENT);
  topGrad.addColorStop(0.2, metadata.accentColor + "40");
  topGrad.addColorStop(0.5, metadata.accentColor + "80");
  topGrad.addColorStop(0.8, metadata.accentColor + "40");
  topGrad.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, 6);

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM HEADER WITH TIER BADGE ───
  // ═══════════════════════════════════════════════════════════════════

  // Tier badge emoji (large and prominent)
  ctx.save();
  ctx.font = "120px Arial";
  ctx.textAlign = "center";
  ctx.fillText(metadata.emoji, CARD_WIDTH / 2, 140);
  ctx.restore();

  // StudyBond branding (premium styling)
  ctx.save();
  ctx.font = "bold 42px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.textAlign = "center";
  ctx.fillText("STUDYBOND", CARD_WIDTH / 2, 220);
  ctx.restore();

  // Tier label
  ctx.save();
  ctx.font = "600 24px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = metadata.accentColor;
  ctx.textAlign = "center";
  ctx.fillText(headerLabel, CARD_WIDTH / 2, 260);
  ctx.restore();

  // ═══════════════════════════════════════════════════════════════════
  // ─── HEADLINE & SUBTITLE (Premium Typography) ───
  // ═══════════════════════════════════════════════════════════════════

  ctx.save();
  ctx.font = "bold 72px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  const headlineLines = wrapText(ctx, headline, CARD_WIDTH - 160);
  let headlineY = 350;
  headlineLines.forEach((line) => {
    ctx.fillText(line, CARD_WIDTH / 2, headlineY);
    headlineY += 90;
  });
  ctx.restore();

  // Subtitle with premium styling
  ctx.save();
  ctx.font = "400 32px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "center";
  ctx.fillText(subtitle, CARD_WIDTH / 2, headlineY + 40);
  ctx.restore();

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM SCORE DISPLAY (Redesigned) ───
  // ═══════════════════════════════════════════════════════════════════

  const scoreSectionY = headlineY + 140;
  
  // Large score percentage
  ctx.save();
  ctx.font = "bold 140px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = metadata.accentColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(result.percentage)}%`, CARD_WIDTH / 2, scoreSectionY);
  ctx.restore();

  // Score label
  ctx.save();
  ctx.font = "600 32px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("SCORE", CARD_WIDTH / 2, scoreSectionY + 80);
  ctx.restore();

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM STATS GRID (3-column layout) ───
  // ═══════════════════════════════════════════════════════════════════

  const statsY = scoreSectionY + 180;
  const statsData = [
    { label: "CORRECT", value: `${result.score}/${result.totalQuestions}`, icon: "✓" },
    { label: "TIME", value: formatTime(result.timeTakenSeconds), icon: "⏱" },
    { label: "SP EARNED", value: `+${result.spEarned}`, icon: "⚡" },
  ];

  const statBoxWidth = 300;
  const statBoxHeight = 140;
  const statGap = 30;
  const gridWidth = (statBoxWidth + statGap) * 3 - statGap;
  const gridStartX = (CARD_WIDTH - gridWidth) / 2;

  statsData.forEach((stat, i) => {
    const x = gridStartX + i * (statBoxWidth + statGap);
    const y = statsY;

    // Premium stat box with glass effect
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = metadata.accentColor;
    roundRect(ctx, x - 20, y - 20, statBoxWidth + 40, statBoxHeight + 40, 30);
    ctx.fill();
    ctx.restore();

    // Box border with gradient
    const boxGrad = ctx.createLinearGradient(x, y, x, y + statBoxHeight);
    boxGrad.addColorStop(0, metadata.accentColor + "40");
    boxGrad.addColorStop(1, metadata.accentColor + "10");
    ctx.strokeStyle = boxGrad;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, statBoxWidth, statBoxHeight, 20);
    ctx.stroke();

    // Icon
    ctx.save();
    ctx.font = "50px Arial";
    ctx.fillStyle = metadata.accentColor;
    ctx.textAlign = "center";
    ctx.fillText(stat.icon, x + statBoxWidth / 2, y + 30);
    ctx.restore();

    // Label
    ctx.save();
    ctx.font = "600 18px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.textAlign = "center";
    ctx.fillText(stat.label, x + statBoxWidth / 2, y + 75);
    ctx.restore();

    // Value
    ctx.save();
    ctx.font = "bold 40px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.textAlign = "center";
    ctx.fillText(stat.value, x + statBoxWidth / 2, y + 120);
    ctx.restore();
  });

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM SUBJECT BREAKDOWN ───
  // ═══════════════════════════════════════════════════════════════════

  const barsY = statsY + statBoxHeight + 100;
  const barMaxWidth = CARD_WIDTH - 200;
  const barHeight = 48;
  const barGap = 60;

  const subjectStats = buildSubjectStats(result);

  subjectStats.forEach((stat, i) => {
    const y = barsY + i * (barHeight + barGap);

    // Subject label with premium styling
    ctx.save();
    ctx.font = "700 26px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "left";
    ctx.fillText(stat.subject, 100, y - 12);

    ctx.font = "600 22px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.textAlign = "right";
    ctx.fillText(`${stat.correct}/${stat.total}`, CARD_WIDTH - 100, y - 12);
    ctx.restore();

    // Premium progress bar track
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = metadata.accentColor;
    roundRect(ctx, 100, y, barMaxWidth, barHeight, barHeight / 2);
    ctx.fill();
    ctx.restore();

    // Progress bar with gradient
    const pct = stat.total > 0 ? stat.correct / stat.total : 0;
    const fillWidth = Math.max(barHeight, barMaxWidth * pct);
    
    const barGrad = ctx.createLinearGradient(100, y, 100 + fillWidth, y);
    barGrad.addColorStop(0, metadata.accentColor + "FF");
    barGrad.addColorStop(1, metadata.accentColor + "80");
    
    ctx.fillStyle = barGrad;
    roundRect(ctx, 100, y, fillWidth, barHeight, barHeight / 2);
    ctx.fill();

    // Glow effect on progress
    ctx.save();
    ctx.shadowColor = metadata.accentColor;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = metadata.accentColor;
    roundRect(ctx, 100, y, fillWidth, barHeight, barHeight / 2);
    ctx.fill();
    ctx.restore();
  });

  // ═══════════════════════════════════════════════════════════════════
  // ─── EXAM INFO & MOTIVATION ───
  // ═══════════════════════════════════════════════════════════════════

  const infoY = barsY + subjectStats.length * (barHeight + barGap) + 60;
  
  ctx.save();
  ctx.font = "600 28px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.textAlign = "center";
  ctx.fillText(result.displayNameLong, CARD_WIDTH / 2, infoY);
  ctx.restore();

  // Motivational quote based on performance
  let motivation = "";
  if (metadataOverride?.isDuel) {
    if (headline === "DUEL VICTORY") motivation = "Champion of the Arena";
    else if (headline === "VALIANT EFFORT") motivation = "Iron Sharpens Iron";
    else motivation = "A Clash of Equals";
  } else {
    const motivations: Record<ScoreTier, string> = {
      legendary: "Peak Performance Achieved",
      excellent: "Exceptional Results",
      solid: "Strong Effort",
      average: "Keep Pushing",
      needs_work: "Room to Grow",
    };
    motivation = motivations[tier];
  }

  ctx.save();
  ctx.font = "500 24px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = metadata.accentColor;
  ctx.textAlign = "center";
  ctx.fillText(motivation, CARD_WIDTH / 2, infoY + 60);
  ctx.restore();

  // ═══════════════════════════════════════════════════════════════════
  // ─── PREMIUM FOOTER & CTA ───
  // ═══════════════════════════════════════════════════════════════════

  const ctaY = CARD_HEIGHT - 200;

  // Separator line (premium gradient)
  const sepGrad = ctx.createLinearGradient(150, ctaY - 60, CARD_WIDTH - 150, ctaY - 60);
  sepGrad.addColorStop(0, TRANSPARENT);
  sepGrad.addColorStop(0.25, metadata.accentColor + "30");
  sepGrad.addColorStop(0.75, metadata.accentColor + "30");
  sepGrad.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = sepGrad;
  ctx.fillRect(150, ctaY - 60, CARD_WIDTH - 300, 2);

  // Main CTA
  ctx.save();
  ctx.font = "bold 42px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = metadata.accentColor;
  ctx.textAlign = "center";
  ctx.fillText("studybond.app", CARD_WIDTH / 2, ctaY + 20);
  ctx.restore();

  // Tagline
  ctx.save();
  ctx.font = "400 26px 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("Study Smarter • Score Higher • Stand Out", CARD_WIDTH / 2, ctaY + 75);
  ctx.restore();

  // Bottom premium accent bar
  const botGrad = ctx.createLinearGradient(0, CARD_HEIGHT - 6, CARD_WIDTH, CARD_HEIGHT - 6);
  botGrad.addColorStop(0, TRANSPARENT);
  botGrad.addColorStop(0.2, metadata.accentColor + "40");
  botGrad.addColorStop(0.5, metadata.accentColor + "80");
  botGrad.addColorStop(0.8, metadata.accentColor + "40");
  botGrad.addColorStop(1, TRANSPARENT);
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, CARD_HEIGHT - 6, CARD_WIDTH, 6);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate share image"));
      },
      "image/png",
      1.0
    );
  });
}

// ─── Helpers ───

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function buildSubjectStats(result: ExamResult) {
  const map = new Map<string, { total: number; correct: number }>();
  result.subjects.forEach((s) => map.set(s, { total: 0, correct: 0 }));
  result.questions.forEach((q) => {
    const cur = map.get(q.subject) || { total: 0, correct: 0 };
    cur.total++;
    if (q.isCorrect) cur.correct++;
    map.set(q.subject, cur);
  });
  const stats: { subject: string; total: number; correct: number }[] = [];
  map.forEach((data, subject) => {
    if (data.total > 0) stats.push({ subject, ...data });
  });
  return stats;
}

// ─── Share Text for WhatsApp etc ───

function getShareText(
  result: ExamResult, 
  headline: string,
  metadataOverride?: typeof TIER_METADATA[keyof typeof TIER_METADATA] & { isDuel?: boolean },
  duelOutcome?: "VICTORY" | "DEFEAT" | "DRAW"
): string {
  const tier = getScoreTier(result.percentage);
  const metadata = metadataOverride || TIER_METADATA[tier];
  const subjectText = result.subjects.join(", ");

  const baseText = `${metadata.emoji} ${headline}\n\n📊 Score: ${result.score}/${result.totalQuestions} (${Math.round(result.percentage)}%)\n📚 ${subjectText}\n⚡ +${result.spEarned} SP earned`;

  let ctaLine = "";
  if (duelOutcome) {
    if (duelOutcome === "VICTORY") ctaLine = "\n\n👑 Prove yourself in the arena.\nstudybond.app";
    else if (duelOutcome === "DEFEAT") ctaLine = "\n\n⚔️ Champions are made from setbacks.\nstudybond.app";
    else ctaLine = "\n\n⚖️ Iron sharpens iron.\nstudybond.app";
  } else {
    const ctaLines: Record<ScoreTier, string> = {
      legendary: "\n\n🏆 Preparation, precision, perfection.\nstudybond.app",
      excellent: "\n\n🔥 Where serious students prepare.\nstudybond.app",
      solid: "\n\n📈 Building results with every session.\nstudybond.app",
      average: "\n\n💪 Every score is progress.\nstudybond.app",
      needs_work: "\n\n🚀 Better is coming.\nstudybond.app",
    };
    ctaLine = ctaLines[tier];
  }

  return baseText + ctaLine;
}

// ─── Component ───

type ShareResultCardProps = {
  result: ExamResult;
  customTrigger?: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  duelOutcome?: "VICTORY" | "DEFEAT" | "DRAW";
  opponentName?: string;
};

export function ShareResultCard({ result, customTrigger, duelOutcome, opponentName }: ShareResultCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  const blobRef = useRef<Blob | null>(null);

  const tier = getScoreTier(result.percentage);
  
  const finalMetadata = useMemo(() => {
    if (duelOutcome === "VICTORY") return { ...TIER_METADATA.legendary, isDuel: true };
    if (duelOutcome === "DEFEAT") return { ...TIER_METADATA.solid, emoji: "⚔️", isDuel: true };
    if (duelOutcome === "DRAW") return { ...TIER_METADATA.excellent, emoji: "⚖️", isDuel: true };
    return TIER_METADATA[tier];
  }, [tier, duelOutcome]);

  const headline = useMemo(() => {
    if (duelOutcome === "VICTORY") return "DUEL VICTORY";
    if (duelOutcome === "DEFEAT") return "VALIANT EFFORT";
    if (duelOutcome === "DRAW") return "EPIC DRAW";
    return pickRandom(SHARE_HEADLINES[tier]);
  }, [tier, duelOutcome]);

  const subtitle = useMemo(() => {
    if (duelOutcome === "VICTORY") return opponentName ? `Defeated ${opponentName} in the arena.` : "Emerged victorious in the arena.";
    if (duelOutcome === "DEFEAT") return opponentName ? `A tough duel against ${opponentName}.` : "Fell in battle, but growing stronger.";
    if (duelOutcome === "DRAW") return opponentName ? `A perfectly matched clash with ${opponentName}.` : "A clash of equals.";
    return pickRandom(SHARE_SUBTITLES[tier]);
  }, [tier, duelOutcome, opponentName]);

  const generateImage = useCallback(async () => {
    if (generatedUrl) return;
    setIsGenerating(true);
    try {
      const blob = await renderShareCard(result, headline, subtitle, finalMetadata);
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
    } catch (err) {
      console.error("[ShareCard] Generation failed:", err);
      toast.error("Failed to generate share image.");
    } finally {
      setIsGenerating(false);
    }
  }, [result, headline, subtitle, finalMetadata, generatedUrl]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    generateImage();
  }, [generateImage]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!generatedUrl) return;
    const a = document.createElement("a");
    a.href = generatedUrl;
    a.download = `StudyBond-Result-${Math.round(result.percentage)}pct.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded! Time to share your victory 🚀", { icon: "📸" });
  }, [generatedUrl, result.percentage]);

  const handleShare = useCallback(async () => {
    const shareText = getShareText(result, headline, finalMetadata, duelOutcome);

    // Try native share (mobile)
    if (navigator.share && blobRef.current) {
      try {
        const file = new File(
          [blobRef.current],
          `StudyBond-Result-${Math.round(result.percentage)}pct.png`,
          { type: "image/png" }
        );
        await navigator.share({
          text: shareText,
          files: [file],
        });
        return;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    // Fallback: copy text to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied! Download the image and share everywhere.", {
        icon: "📋",
        duration: 4000,
      });
    } catch {
      toast.error("Couldn't copy to clipboard.");
    }
  }, [result, headline]);

  return (
    <>
      {/* Premium Trigger Button */}
      {customTrigger ? (
        cloneElement(customTrigger, { onClick: handleOpen })
      ) : (
        <button
          id="share-result-btn"
          onClick={handleOpen}
          className={cn(
            "group relative inline-flex items-center gap-2.5 rounded-2xl px-5 py-2.5",
            "bg-linear-to-r from-[#c17a28]/15 to-[#c17a28]/5",
            "border border-[#c17a28]/20 hover:border-[#c17a28]/40",
            "text-[#e8b87a] hover:text-white",
            "transition-all duration-300 ease-out",
            "hover:shadow-[0_0_30px_rgba(193,122,40,0.15)]",
            "active:scale-[0.97]",
            "hover:bg-linear-to-r hover:from-[#c17a28]/25 hover:to-[#c17a28]/10"
          )}
        >
          <Share2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span className="text-sm font-semibold tracking-wide">Share Result</span>
        </button>
      )}

      {/* Premium Fullscreen Modal (Portaled to body) */}
      {isMounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300 p-4 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="relative w-full max-w-4xl max-h-[95vh] flex flex-col md:flex-row items-center md:items-stretch overflow-y-auto md:overflow-visible bg-[#09090b]/80 border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden">
            
            {/* Close button - Premium */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300 group shadow-lg"
            >
              <X className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
            </button>

            {/* Left side: Image Preview */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex items-center justify-center bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/10 relative">
              {/* Decorative background glow behind image */}
              <div 
                className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none transition-all duration-1000" 
                style={{ backgroundColor: finalMetadata.accentColor }} 
              />
              
              <div className="relative w-full max-w-[140px] sm:max-w-[240px] md:max-w-[320px] aspect-[9/16] rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-black/50 group shrink-0">
                {isGenerating ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-black via-black/95 to-black">
                    <div className="flex flex-col items-center gap-2 sm:gap-4">
                      <div className="relative w-8 h-8 sm:w-16 sm:h-16">
                        <div className={cn(
                          "absolute inset-0 rounded-full border-2 border-transparent",
                          "border-t-[2px] sm:border-t-[3px] border-r-[2px] sm:border-r-[3px]",
                          "animate-spin"
                        )} style={{ borderTopColor: finalMetadata.accentColor, borderRightColor: finalMetadata.accentColor }} />
                      </div>
                      <p className="text-[10px] sm:text-sm text-white/50 font-medium">Creating...</p>
                    </div>
                  </div>
                ) : generatedUrl ? (
                  <Image
                    src={generatedUrl}
                    alt="Share card preview"
                    fill
                    className="object-contain transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-black/50 to-black/75">
                    <p className="text-sm text-white/30">Preparing...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 flex flex-col justify-center gap-4 sm:gap-8 relative overflow-hidden">
              {/* Header */}
              <div className="space-y-1 sm:space-y-3 text-center md:text-left relative z-10">
                <div className="hidden sm:inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-2 shadow-inner text-4xl">
                  {finalMetadata.emoji}
                </div>
                <h2 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight">Share Your Success</h2>
                <p className="text-white/50 text-xs sm:text-lg">Inspire others with your achievement</p>
              </div>

              {/* Action Buttons */}
              {generatedUrl && (
                <div className="flex flex-col gap-4 w-full relative z-10">
                  <button
                    onClick={handleShare}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6",
                      "bg-gradient-to-r from-[#c17a28] to-[#d48a34] hover:from-[#d48a34] hover:to-[#e39840]",
                      "text-white font-bold text-base",
                      "hover:shadow-[0_8px_30px_rgba(193,122,40,0.3)] hover:-translate-y-0.5",
                      "transition-all duration-300 group",
                      "active:scale-[0.98]"
                    )}
                  >
                    <Share2 className="h-5 w-5 transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300" />
                    Share Directly
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 rounded-2xl py-4 px-6",
                      "bg-white/5 backdrop-blur-sm border border-white/10",
                      "text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20",
                      "transition-all duration-300",
                      "text-base font-semibold",
                      "group active:scale-[0.98]"
                    )}
                  >
                    <Download className="h-5 w-5 transition-transform group-hover:-translate-y-1 duration-300" />
                    Save Image to Device
                  </button>
                </div>
              )}

              {/* Tips */}
              <div className="w-full text-center md:text-left text-sm text-white/40 space-y-1.5 relative z-10 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-yellow-500/80">💡</span> 
                  <span>Save to device, then upload to any platform.</span>
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-blue-400/80">📱</span> 
                  <span>On mobile? Tap <strong className="text-white/60">Share Directly</strong> to send.</span>
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
