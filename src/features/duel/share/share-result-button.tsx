"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ShareSheet } from "./share-sheet";

/**
 * "Share result" on the normal exam results page: opens the share sheet
 * (mockup 11a) with the exam card. Replaces the old canvas share card.
 * Not shown for study sessions (the page leaves it out).
 */
export function ShareResultButton({ examId }: { examId: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setOpen(true)}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share result
      </Button>
      <ShareSheet examId={examId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
