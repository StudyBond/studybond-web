"use client";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Surface tone="danger" className="max-w-md p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(248,113,113)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white/90">{title}</h2>
      <p className="mt-2 text-sm text-white/50">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" type="button" onClick={onAction} variant="secondary" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </Surface>
  );
}
