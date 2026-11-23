"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useStudentBoards } from "@/features/institution/hooks/use-student-boards";
import { cn } from "@/lib/utils/cn";

import { switchBoard } from "./api";
import { TickIcon } from "./icons";
import s from "./home.module.css";

/**
 * Pick the board to study for. Switching works like signing into another
 * account: papers, report card, race and free subjects all follow the board,
 * so the page reloads on the new board. Coming-soon boards show but can't
 * be picked.
 */
export function BoardSheet({ currentCode, onClose }: { currentCode: string | null; onClose: () => void }) {
  const boards = useStudentBoards();
  const change = useMutation({
    mutationFn: (code: string) => switchBoard(code),
    onSuccess: () => window.location.assign("/dashboard"),
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={cn("sb-ui", s.scrim)} onClick={onClose}>
      <div className={s.sheet} role="dialog" aria-modal="true" aria-labelledby="board-sheet-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="board-sheet-title">Your boards</h2>
        <p>Each board keeps its own report card, race and free subjects. Switch whenever you like.</p>
        {boards.isLoading ? <p>Loading your boards...</p> : null}
        {boards.isError ? <p>We couldn&apos;t load the boards. Check your connection and try again.</p> : null}
        {(boards.data ?? []).map((board) => {
          const current = board.code === currentCode;
          const soon = board.status === "COMING_SOON";
          return (
            <button
              key={board.code}
              type="button"
              className={cn(s.bOpt, current && s.bOptOn)}
              disabled={soon || current || change.isPending}
              onClick={() => change.mutate(board.code)}
            >
              <span>
                {board.name}
                <small>{soon ? "Coming soon" : current ? "You're on this board" : board.examName ?? ""}</small>
              </span>
              {current ? <TickIcon className={s.chev} /> : null}
            </button>
          );
        })}
        {change.isError ? <p className={s.err} role="alert">We couldn&apos;t switch boards. Check your connection and try again.</p> : null}
        <button type="button" className={s.sheetClose} onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  );
}
