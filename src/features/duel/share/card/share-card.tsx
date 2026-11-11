import type { CSSProperties, ReactNode } from "react";

import type { ShareCardView, ShareRow, SharePerson } from "../types";
import { AvatarArt } from "./avatar-art";

/* The share card (mockup 11b-11f): the result printed as a slip on the desk.

   Written ONCE for two painters: the browser (the share sheet's preview) and
   next/og (the real 1080x1920 / 1080x1080 images). next/og only understands
   flexbox and inline styles, so: no grid, no classes, and every box with
   more than one child says display:flex. Sizes are the mockup's (a 360 wide
   card) times `u`, so u=3 gives the full-size image. */

export type CardFonts = { head: string; body: string };

export const DESK = "#09090b";
const LOCKUP_RATIO = 350 / 712;

type Palette = {
  paper: string;
  ink: string;
  ink2: string;
  rule: string;
  rule2: string;
  stamp: string;
  accent: string;
  tick: string;
  tickOff: string;
  word: string;
  paperLine: string;
};

export function paletteFor(look: ShareCardView["look"]): Palette {
  return look === "MIDNIGHT"
    ? {
        paper: "#17171b",
        ink: "#fafafa",
        ink2: "#a1a1aa",
        rule: "rgba(255,255,255,0.12)",
        rule2: "rgba(255,255,255,0.07)",
        stamp: "#e09040",
        accent: "#f5c890",
        tick: "#e09040",
        tickOff: "rgba(255,255,255,0.1)",
        word: "#e09040",
        paperLine: "rgba(255,255,255,0.08)",
      }
    : {
        paper: "#f5c890",
        ink: "#1c1305",
        ink2: "#6b4f22",
        rule: "rgba(28,19,5,0.18)",
        rule2: "rgba(28,19,5,0.1)",
        stamp: "#1c1305",
        accent: "#1c1305",
        tick: "#1c1305",
        tickOff: "rgba(28,19,5,0.13)",
        word: "#c26a12",
        paperLine: "rgba(0,0,0,0)",
      };
}

const row = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "row", ...extra });
const col = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "column", ...extra });

function LinkIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function LinkPill({ text, u, fonts, height = 34, fontSize = 13 }: { text: string; u: number; fonts: CardFonts; height?: number; fontSize?: number }) {
  return (
    <div
      style={row({
        alignItems: "center",
        gap: 7 * u,
        height: height * u,
        padding: `0 ${14 * u}px`,
        borderRadius: 999 * u,
        border: `${1 * u}px solid rgba(224,144,64,0.45)`,
        color: "#f5c890",
        fontFamily: fonts.body,
        fontSize: fontSize * u,
        fontWeight: 600,
      })}
    >
      <LinkIcon size={fontSize * 1.05 * u} color="#f5c890" />
      <span>{text}</span>
    </div>
  );
}

function Anon({ size, p, fonts }: { size: number; p: Palette; fonts: CardFonts }) {
  return (
    <div
      style={row({
        width: size,
        height: size,
        borderRadius: size,
        background: p.rule,
        color: p.ink2,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.head,
        fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
      })}
    >
      ?
    </div>
  );
}

function Player({ person, name, course, size, u, p, fonts }: { person: SharePerson | null; name: string; course: string | null; size: number; u: number; p: Palette; fonts: CardFonts }) {
  return (
    <div style={col({ flex: 1, alignItems: "center", gap: 4 * u, minWidth: 0 })}>
      {person ? <AvatarArt look={person.avatar} size={size} ringOn={p.paper} /> : <Anon size={size} p={p} fonts={fonts} />}
      <span style={{ fontSize: 14 * u, fontWeight: 700, lineHeight: 1.15, textAlign: "center" }}>{name}</span>
      {course ? <span style={{ fontSize: 10.5 * u, color: p.ink2, lineHeight: 1.2, textAlign: "center" }}>{course}</span> : null}
    </div>
  );
}

/** The dashed tear line with a notch cut on each side. */
function Tear({ u, p, top = 12 }: { u: number; p: Palette; top?: number }) {
  return (
    <div style={row({ position: "relative", height: 0, marginTop: top * u, marginLeft: -18 * u, marginRight: -18 * u, borderTop: `${2 * u}px dashed ${p.rule}` })}>
      <div style={{ position: "absolute", top: -11 * u, left: -10 * u, width: 20 * u, height: 20 * u, borderRadius: 20 * u, background: DESK }} />
      <div style={{ position: "absolute", top: -11 * u, right: -10 * u, width: 20 * u, height: 20 * u, borderRadius: 20 * u, background: DESK }} />
    </div>
  );
}

function Ticks({ marks, u, p, ghost = false }: { marks: boolean[]; u: number; p: Palette; ghost?: boolean }) {
  return (
    <div style={row({ flex: 1, height: 12 * u, gap: marks.length > 40 ? 1 * u : 1.5 * u })}>
      {marks.map((right, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 1.5 * u,
            background: right ? (ghost ? "rgba(0,0,0,0)" : p.tick) : ghost ? "rgba(0,0,0,0)" : p.tickOff,
            ...(ghost ? { border: `${1.5 * u}px solid ${right ? p.ink2 : p.tickOff}` } : {}),
          }}
        />
      ))}
    </div>
  );
}

function Stamp({ text, u, p, fonts, size }: { text: string; u: number; p: Palette; fonts: CardFonts; size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -12 * u,
        right: -6 * u,
        display: "flex",
        padding: `${3 * u}px ${10 * u}px ${2 * u}px`,
        border: `${2.5 * u}px solid ${p.stamp}`,
        borderRadius: 7 * u,
        color: p.stamp,
        fontFamily: fonts.head,
        fontWeight: 800,
        fontSize: size * u,
        letterSpacing: "0.12em",
        lineHeight: 1.1,
        transform: "rotate(-11deg)",
        opacity: 0.9,
      }}
    >
      {text}
    </div>
  );
}

function TableHead({ cells, u, p }: { cells: string[]; u: number; p: Palette }) {
  return (
    <div style={row({ marginTop: 12 * u, paddingBottom: 4 * u, fontSize: 10.5 * u, fontWeight: 700, color: p.ink2 })}>
      <span style={{ flex: 1 }}>{cells[0]}</span>
      {cells.length === 2 ? (
        <span style={{ width: 92 * u, textAlign: "right" }}>{cells[1]}</span>
      ) : (
        <>
          <span style={{ width: 46 * u, textAlign: "right" }}>{cells[1]}</span>
          <span style={{ width: 46 * u, textAlign: "right" }}>{cells[2]}</span>
        </>
      )}
    </div>
  );
}

function DuelTable({ card, u, p }: { card: ShareCardView; u: number; p: Palette }) {
  const duel = card.duel!;
  if (card.showScore) {
    return (
      <div style={col()}>
        <TableHead cells={["Subject", card.me.firstName, duel.rivalShort]} u={u} p={p} />
        {duel.rows.map((r) => (
          <div key={r.subject} style={row({ alignItems: "baseline", padding: `${4.5 * u}px 0`, borderTop: `${1 * u}px solid ${p.rule2}`, fontSize: 13 * u })}>
            <span style={{ flex: 1 }}>{r.subject}</span>
            <span style={{ width: 46 * u, textAlign: "right", fontWeight: r.took === "ME" ? 800 : 400, color: r.took === "ME" ? p.ink : p.ink2 }}>{r.mine}</span>
            <span style={{ width: 46 * u, textAlign: "right", fontWeight: r.took === "THEM" ? 800 : 400, color: r.took === "THEM" ? p.ink : p.ink2 }}>{r.theirs}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={col()}>
      <TableHead cells={["Subject", "Took it"]} u={u} p={p} />
      {duel.rows.map((r) => (
        <div key={r.subject} style={row({ alignItems: "baseline", padding: `${4.5 * u}px 0`, borderTop: `${1 * u}px solid ${p.rule2}`, fontSize: 13 * u })}>
          <span style={{ flex: 1 }}>{r.subject}</span>
          <span style={{ width: 92 * u, textAlign: "right", fontWeight: 700 }}>
            {r.took === "ME" ? card.me.firstName : r.took === "THEM" ? duel.rivalShort : "Level"}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExamRow({ label, r, marks, u, p, ghost }: { label: string; r: ShareRow | null; marks: boolean[] | null; u: number; p: Palette; ghost?: boolean }) {
  const right = marks ? marks.filter(Boolean).length : null;
  return (
    <div style={row({ alignItems: "center", gap: 8 * u, padding: `${4.5 * u}px 0`, borderTop: `${1 * u}px solid ${p.rule2}`, fontSize: 12.5 * u })}>
      <span style={{ width: 76 * u, fontWeight: 600 }}>{label}</span>
      {marks ? <Ticks marks={marks} u={u} p={p} ghost={ghost} /> : <span style={{ flex: 1, color: p.ink2 }}>Done</span>}
      <span style={{ width: 44 * u, textAlign: "right", fontWeight: 700 }}>
        {right !== null ? `${right}/${(r?.total ?? marks!.length)}` : ""}
      </span>
    </div>
  );
}

function Foot({ card, u, p, fonts }: { card: ShareCardView; u: number; p: Palette; fonts: CardFonts }) {
  return (
    <div style={row({ justifyContent: "space-between", gap: 10 * u, marginTop: 10 * u, fontSize: 10.5 * u, color: p.ink2 })}>
      <span>{card.footLeft}</span>
      <span style={row({ gap: 4 * u })}>
        Result <span style={{ color: p.ink, fontWeight: 700, fontFamily: fonts.head }}>{card.printedNumber}</span>
      </span>
    </div>
  );
}

function Headline({ card, u, p, fonts, story }: { card: ShareCardView; u: number; p: Palette; fonts: CardFonts; story: boolean }) {
  return (
    <div style={col({ marginTop: 12 * u, alignItems: "center", textAlign: "center" })}>
      {card.headline ? <span style={{ fontFamily: fonts.head, fontSize: 17 * u, fontWeight: 700, letterSpacing: "-0.01em", color: p.accent }}>{card.headline}</span> : null}
      {story && card.story ? <span style={{ marginTop: 3 * u, fontSize: 12 * u, color: p.ink2 }}>{card.story}</span> : null}
    </div>
  );
}

function BigLine({ text, u, fonts, size = 30 }: { text: string; u: number; fonts: CardFonts; size?: number }) {
  return (
    <div style={row({ justifyContent: "center", marginTop: 12 * u, textAlign: "center", fontFamily: fonts.head, fontSize: size * u, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 })}>
      {text}
    </div>
  );
}

function SlipBody({ card, square, u, p, fonts }: { card: ShareCardView; square: boolean; u: number; p: Palette; fonts: CardFonts }) {
  const avSize = (square ? 40 : 52) * u;
  if (card.duel) {
    const duel = card.duel;
    const scoreSize = (square ? 64 : 72) * u;
    const iWin = (duel.myScore ?? 0) >= (duel.rivalScore ?? 0);
    const theyWin = (duel.rivalScore ?? 0) >= (duel.myScore ?? 0);
    return (
      <div style={col()}>
        <div style={row({ alignItems: "flex-start", marginTop: 14 * u })}>
          <Player person={card.me} name={card.me.shortName} course={square ? null : card.me.course} size={avSize} u={u} p={p} fonts={fonts} />
          <span style={{ width: 28 * u, alignSelf: "center", marginTop: -14 * u, textAlign: "center", fontFamily: fonts.head, fontSize: 18 * u, fontWeight: 600, color: p.ink2 }}>v.</span>
          <Player person={duel.rival} name={duel.rivalName} course={square || !duel.rival ? null : duel.rival.course} size={avSize} u={u} p={p} fonts={fonts} />
        </div>
        {card.showScore ? (
          <div style={row({ alignItems: "flex-end", marginTop: 6 * u, fontFamily: fonts.head })}>
            <div style={row({ flex: 1, justifyContent: "center" })}><span style={{ fontSize: scoreSize, fontWeight: iWin ? 700 : 600, color: iWin ? p.ink : p.ink2, letterSpacing: "-0.045em", lineHeight: 0.9 }}>{duel.myScore}</span></div>
            <span style={{ width: 28 * u, textAlign: "center", fontSize: (square ? 28 : 34) * u, color: p.ink2, paddingBottom: 10 * u }}>–</span>
            <div style={row({ flex: 1, justifyContent: "center" })}><span style={{ fontSize: scoreSize, fontWeight: theyWin ? 700 : 600, color: theyWin ? p.ink : p.ink2, letterSpacing: "-0.045em", lineHeight: 0.9 }}>{duel.rivalScore}</span></div>
          </div>
        ) : (
          <BigLine text={card.bigLine ?? ""} u={u} fonts={fonts} size={square ? 26 : 30} />
        )}
        <Headline card={card} u={u} p={p} fonts={fonts} story={!square} />
        {square ? null : (
          <div style={col()}>
            <Tear u={u} p={p} />
            <DuelTable card={card} u={u} p={p} />
            <Foot card={card} u={u} p={p} fonts={fonts} />
          </div>
        )}
      </div>
    );
  }

  const exam = card.exam!;
  return (
    <div style={col()}>
      <div style={row({ alignItems: "center", justifyContent: "center", gap: 10 * u, marginTop: 14 * u })}>
        <AvatarArt look={card.me.avatar} size={44 * u} ringOn={p.paper} />
        <div style={col()}>
          <span style={{ fontSize: 14 * u, fontWeight: 700 }}>{card.me.shortName}</span>
          {card.me.course ? <span style={{ fontSize: 11 * u, color: p.ink2 }}>{card.me.course}</span> : null}
        </div>
      </div>
      {card.showScore ? (
        <div style={row({ alignItems: "baseline", justifyContent: "center", gap: 6 * u, marginTop: 10 * u, fontFamily: fonts.head })}>
          <span style={{ fontSize: (square ? 80 : 96) * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.85 }}>{exam.score}</span>
          <span style={{ fontSize: 22 * u, fontWeight: 600, color: p.ink2 }}>/ {exam.total}</span>
        </div>
      ) : (
        <BigLine text={card.bigLine ?? ""} u={u} fonts={fonts} size={26} />
      )}
      <Headline card={card} u={u} p={p} fonts={fonts} story={!square} />
      {square ? null : (
        <div style={col()}>
          <Tear u={u} p={p} />
          <div style={col({ marginTop: 12 * u })}>
            {card.ghost ? (
              <div style={col()}>
                <ExamRow label={card.me.firstName} r={exam.rows[0] ?? null} marks={exam.rows[0]?.marks ?? null} u={u} p={p} />
                <ExamRow label={`${card.ghost.levelLabel} ghost`} r={exam.rows[0] ?? null} marks={card.ghost.ghostMarks} u={u} p={p} ghost />
              </div>
            ) : (
              exam.rows.map((r) => <ExamRow key={r.subject} label={r.subject} r={r} marks={r.marks} u={u} p={p} />)
            )}
          </div>
          <Foot card={card} u={u} p={p} fonts={fonts} />
        </div>
      )}
    </div>
  );
}

export function ShareSlipArt({ card, square, u, fonts, children }: { card: ShareCardView; square: boolean; u: number; fonts: CardFonts; children?: ReactNode }) {
  const p = paletteFor(card.look);
  return (
    <div
      style={col({
        position: "relative",
        width: 312 * u,
        padding: `${16 * u}px ${18 * u}px`,
        lineHeight: 1.2,
        borderRadius: 6 * u,
        background: p.paper,
        color: p.ink,
        fontFamily: fonts.body,
        boxShadow: `inset 0 0 0 ${1 * u}px ${p.paperLine}, 0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.55), 0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.4)`,
      })}
    >
      <div style={row({ fontFamily: fonts.head, fontSize: 15 * u, fontWeight: 700, letterSpacing: "-0.02em" })}>
        <span>Study</span>
        <span style={{ color: p.word }}>Bond</span>
      </div>
      <div style={row({ marginTop: 6 * u, fontSize: 10.8 * u, lineHeight: 1.3, color: p.ink2, whiteSpace: "nowrap", overflow: "hidden" })}>
        <span style={{ fontWeight: 700 }}>{card.kindLabel}</span>
        <span>{` · ${card.boardLine}`}</span>
      </div>
      <div style={{ height: 1 * u, marginTop: 12 * u, marginLeft: -18 * u, marginRight: -18 * u, background: p.rule }} />
      {card.stamp ? <Stamp text={card.stamp} u={u} p={p} fonts={fonts} size={square ? 16 : 19} /> : null}
      <SlipBody card={card} square={square} u={u} p={p} fonts={fonts} />
      {children}
    </div>
  );
}

/**
 * The whole image. `origin` makes the lockup's address absolute (next/og
 * fetches it); in the browser it can be "".
 */
export function ShareCardArt({ card, shape, u, fonts, origin, link }: {
  card: ShareCardView;
  shape: "status" | "square";
  u: number;
  fonts: CardFonts;
  origin: string;
  /** The printed link, e.g. studybond.app/c/adaeze. */
  link: string;
}) {
  const square = shape === "square";
  const lockup = `${origin}/studybond-lockup.png`;
  return (
    <div
      style={col({
        width: 360 * u,
        height: (square ? 360 : 640) * u,
        alignItems: "center",
        padding: square ? `${20 * u}px ${24 * u}px` : `${18 * u}px ${24 * u}px ${20 * u}px`,
        background: DESK,
        color: "#fafafa",
        fontFamily: fonts.body,
        // Pinned so the page (1.45) and next/og (1.2) draw the same height.
        lineHeight: 1.2,
        overflow: "hidden",
      })}
    >
      {square ? null : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={lockup} alt="StudyBond" width={126 * u} height={126 * LOCKUP_RATIO * u} style={{ marginTop: -14 * u, marginBottom: -12 * u }} />
      )}
      <ShareSlipArt card={card} square={square} u={u} fonts={fonts} />
      {square ? (
        <div style={row({ alignItems: "center", justifyContent: "space-between", width: 312 * u, marginTop: 12 * u })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lockup} alt="StudyBond" width={92 * u} height={92 * LOCKUP_RATIO * u} style={{ marginLeft: -8 * u, marginTop: -12 * u, marginBottom: -12 * u }} />
          <LinkPill text={link} u={u} fonts={fonts} height={28} fontSize={11.5} />
        </div>
      ) : (
        // One real box, not a fragment: next/og lost the centring on a fragment's children.
        <div style={col({ flex: 1, width: 312 * u, alignItems: "center" })}>
          <div style={col({ alignItems: "center", gap: 8 * u, marginTop: 18 * u })}>
            <span style={{ fontFamily: fonts.head, fontSize: 19 * u, fontWeight: 600, letterSpacing: "-0.01em" }}>{card.cta}</span>
            <LinkPill text={link} u={u} fonts={fonts} />
          </div>
          <div style={row({ marginTop: "auto", justifyContent: "center", fontSize: 10.5 * u, color: "#848486" })}>
            Real past questions. Every score is checked by StudyBond.
          </div>
        </div>
      )}
    </div>
  );
}
