import type { CSSProperties, ReactNode } from "react";

import type { AvatarView } from "@/features/avatar/avatar-look";

import type { ShareCardView } from "../types";
import { AvatarArt } from "./avatar-art";
import { DESK, LinkPill, paletteFor, type CardFonts } from "./share-card";

/* Link previews, 1200x630 (mockups 11g, 11h and C2): a tilted slip on the
   left, the lockup, a title, a line and the link on the right. Same rules as
   share-card.tsx: flexbox and inline styles only, sizes times `u`
   (u=2 gives 1200x630). */

const row = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "row", ...extra });
const col = (extra: CSSProperties = {}): CSSProperties => ({ display: "flex", flexDirection: "column", ...extra });
const LOCKUP_RATIO = 350 / 712;

function Frame({ u, fonts, origin, slip, title, text, link, look }: {
  u: number;
  fonts: CardFonts;
  origin: string;
  slip: ReactNode;
  title: string;
  text: string;
  link: string;
  look: ShareCardView["look"];
}) {
  const p = paletteFor(look);
  return (
    <div style={row({ width: 600 * u, height: 315 * u, alignItems: "center", gap: 30 * u, padding: `${28 * u}px ${32 * u}px ${28 * u}px ${30 * u}px`, background: DESK, color: "#fafafa", fontFamily: fonts.body, lineHeight: 1.2, overflow: "hidden" })}>
      <div
        style={col({
          position: "relative",
          width: 262 * u,
          flexShrink: 0,
          padding: `${14 * u}px ${16 * u}px ${16 * u}px`,
          borderRadius: 6 * u,
          background: p.paper,
          color: p.ink,
          transform: "rotate(-2.5deg)",
          boxShadow: `inset 0 0 0 ${1 * u}px ${p.paperLine}, 0 ${20 * u}px ${50 * u}px rgba(0,0,0,0.6), 0 ${2 * u}px ${6 * u}px rgba(0,0,0,0.4)`,
        })}
      >
        {slip}
      </div>
      <div style={col({ flex: 1, gap: 12 * u, justifyContent: "center" })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${origin}/studybond-lockup.png`} alt="StudyBond" width={150 * u} height={150 * LOCKUP_RATIO * u} style={{ marginTop: -18 * u, marginBottom: -14 * u, marginLeft: -12 * u }} />
        <span style={{ fontFamily: fonts.head, fontSize: 30 * u, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{title}</span>
        <span style={{ fontSize: 14.5 * u, lineHeight: 1.45, color: "#a1a1aa" }}>{text}</span>
        <div style={row()}>
          <LinkPill text={link} u={u} fonts={fonts} height={32} fontSize={12.5} />
        </div>
      </div>
    </div>
  );
}

function SlipHead({ u, fonts, look, label, rest }: { u: number; fonts: CardFonts; look: ShareCardView["look"]; label: string; rest: string }) {
  const p = paletteFor(look);
  return (
    <div style={col()}>
      <div style={row({ fontFamily: fonts.head, fontSize: 14 * u, fontWeight: 700, letterSpacing: "-0.02em" })}>
        <span>Study</span>
        <span style={{ color: p.word }}>Bond</span>
      </div>
      <div style={row({ marginTop: 4 * u, gap: 4 * u, fontSize: 10.5 * u, color: p.ink2 })}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span>{` · ${rest}`}</span>
      </div>
      <div style={{ height: 1 * u, marginTop: 10 * u, marginLeft: -16 * u, marginRight: -16 * u, background: p.rule }} />
    </div>
  );
}

function Tear({ u, look }: { u: number; look: ShareCardView["look"] }) {
  const p = paletteFor(look);
  return (
    <div style={row({ position: "relative", height: 0, marginTop: 12 * u, marginLeft: -16 * u, marginRight: -16 * u, borderTop: `${2 * u}px dashed ${p.rule}` })}>
      <div style={{ position: "absolute", top: -10 * u, left: -9 * u, width: 18 * u, height: 18 * u, borderRadius: 18 * u, background: DESK }} />
      <div style={{ position: "absolute", top: -10 * u, right: -9 * u, width: 18 * u, height: 18 * u, borderRadius: 18 * u, background: DESK }} />
    </div>
  );
}

/** 11g: a shared result. Follows the sharer's switches like the card. */
export function ResultPreviewArt({ card, u, fonts, origin, link }: { card: ShareCardView; u: number; fonts: CardFonts; origin: string; link: string }) {
  const p = paletteFor(card.look);
  const dateless = card.boardLine.split(" · ").filter((part, i, all) => !(i === all.length - 1 && /\d/.test(part) && all.length > 1));
  const slip = (
    <div style={col()}>
      {card.stamp ? (
        <div style={{ position: "absolute", top: -24 * u, right: -24 * u, display: "flex", padding: `${2 * u}px ${9 * u}px ${1 * u}px`, border: `${2.5 * u}px solid ${p.stamp}`, borderRadius: 7 * u, color: p.stamp, fontFamily: fonts.head, fontSize: 15 * u, fontWeight: 800, letterSpacing: "0.12em", transform: "rotate(-11deg)", opacity: 0.9 }}>
          {card.stamp}
        </div>
      ) : null}
      <SlipHead u={u} fonts={fonts} look={card.look} label={card.kindLabel} rest={dateless.join(" · ")} />
      {card.duel ? (
        <div style={col()}>
          <div style={row({ alignItems: "center", marginTop: 12 * u })}>
            <div style={col({ flex: 1, alignItems: "center", gap: 4 * u, fontSize: 12 * u, fontWeight: 700 })}>
              <AvatarArt look={card.me.avatar} size={38 * u} ringOn={p.paper} />
              <span>{card.me.shortName}</span>
            </div>
            <span style={{ width: 22 * u, textAlign: "center", fontFamily: fonts.head, fontSize: 14 * u, fontWeight: 600, color: p.ink2 }}>v.</span>
            <div style={col({ flex: 1, alignItems: "center", gap: 4 * u, fontSize: 12 * u, fontWeight: 700 })}>
              {card.duel.rival ? (
                <AvatarArt look={card.duel.rival.avatar} size={38 * u} ringOn={p.paper} />
              ) : (
                <div style={row({ width: 38 * u, height: 38 * u, borderRadius: 38 * u, background: p.rule, color: p.ink2, alignItems: "center", justifyContent: "center", fontFamily: fonts.head, fontWeight: 700, fontSize: 16 * u })}>?</div>
              )}
              <span>{card.duel.rivalName}</span>
            </div>
          </div>
          {card.showScore ? (
            <div style={row({ alignItems: "flex-end", marginTop: 4 * u, fontFamily: fonts.head })}>
              <div style={row({ flex: 1, justifyContent: "center" })}><span style={{ fontSize: 56 * u, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.9, color: (card.duel.myScore ?? 0) >= (card.duel.rivalScore ?? 0) ? p.ink : p.ink2 }}>{card.duel.myScore}</span></div>
              <span style={{ width: 22 * u, textAlign: "center", fontSize: 24 * u, color: p.ink2, paddingBottom: 6 * u }}>–</span>
              <div style={row({ flex: 1, justifyContent: "center" })}><span style={{ fontSize: 56 * u, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 0.9, color: (card.duel.rivalScore ?? 0) >= (card.duel.myScore ?? 0) ? p.ink : p.ink2 }}>{card.duel.rivalScore}</span></div>
            </div>
          ) : null}
          <span style={{ display: "flex", justifyContent: "center", marginTop: 8 * u, fontFamily: fonts.head, fontSize: 14 * u, fontWeight: 700 }}>
            {card.showScore ? card.headline.replace(`${card.me.firstName} won`, "Won") : card.bigLine}
          </span>
        </div>
      ) : (
        <div style={col()}>
          <div style={row({ alignItems: "center", gap: 10 * u, marginTop: 12 * u })}>
            <AvatarArt look={card.me.avatar} size={38 * u} ringOn={p.paper} />
            <div style={col()}>
              <span style={{ fontSize: 13 * u, fontWeight: 700 }}>{card.me.shortName}</span>
              {card.me.course ? <span style={{ fontSize: 10.5 * u, color: p.ink2 }}>{card.me.course}</span> : null}
            </div>
          </div>
          {card.showScore && card.exam ? (
            <div style={row({ alignItems: "baseline", justifyContent: "center", gap: 5 * u, marginTop: 8 * u, fontFamily: fonts.head })}>
              <span style={{ fontSize: 64 * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.9 }}>{card.exam.score}</span>
              <span style={{ fontSize: 18 * u, fontWeight: 600, color: p.ink2 }}>/ {card.exam.total}</span>
            </div>
          ) : null}
          <span style={{ display: "flex", justifyContent: "center", marginTop: 8 * u, fontFamily: fonts.head, fontSize: 14 * u, fontWeight: 700 }}>
            {card.showScore ? card.headline : card.bigLine}
          </span>
        </div>
      )}
    </div>
  );
  return <Frame u={u} fonts={fonts} origin={origin} slip={slip} title={card.previewTitle} text={card.previewText} link={link} look={card.look} />;
}

/** 11h: a duel slip link (/d/<CODE>). */
export function InvitePreviewArt({ u, fonts, origin, hostName, firstName, board, code, subjects, length, link, isTaster }: {
  u: number;
  fonts: CardFonts;
  origin: string;
  hostName: string;
  firstName: string;
  board: string;
  code: string;
  subjects: string;
  length: string;
  link: string;
  isTaster: boolean;
}) {
  const p = paletteFor("AMBER");
  const slip = (
    <div style={col()}>
      <SlipHead u={u} fonts={fonts} look="AMBER" label={isTaster ? "Taster duel" : "Duel slip"} rest={board} />
      <span style={{ marginTop: 12 * u, fontSize: 10.5 * u, color: p.ink2 }}>Code</span>
      <span style={{ fontFamily: fonts.head, fontSize: 38 * u, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.05 }}>{code}</span>
      <div style={col({ gap: 3 * u, marginTop: 10 * u, fontSize: 11 * u })}>
        {[["From", hostName], ["Subjects", subjects], ["Length", length]].map(([k, v]) => (
          <div key={k} style={row({ gap: 8 * u })}>
            <span style={{ width: 62 * u, color: p.ink2 }}>{k}</span>
            <span style={{ flex: 1, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <Tear u={u} look="AMBER" />
    </div>
  );
  return (
    <Frame
      u={u}
      fonts={fonts}
      origin={origin}
      slip={slip}
      look="AMBER"
      title={`${firstName} challenged you to a duel`}
      text={isTaster ? "Same questions, same clock, live. Your first duel is free." : "Same questions, same clock, live. Tap to accept before the slip expires."}
      link={link}
    />
  );
}

/** C2: a personal challenge link (/c/<name>). */
export function ChallengePreviewArt({ u, fonts, origin, shortName, firstName, course, avatar, board, weeklyRank, link }: {
  u: number;
  fonts: CardFonts;
  origin: string;
  shortName: string;
  firstName: string;
  course: string | null;
  avatar: AvatarView;
  board: string;
  weeklyRank: number | null;
  link: string;
}) {
  const p = paletteFor("AMBER");
  const lines: Array<[string, string]> = [];
  if (weeklyRank) lines.push(["This week", `#${weeklyRank} on ${board}`]);
  lines.push(["Paper", "Your pick of subjects"]);
  const slip = (
    <div style={col()}>
      <SlipHead u={u} fonts={fonts} look="AMBER" label="Open challenge" rest={board} />
      <div style={row({ alignItems: "center", gap: 10 * u, marginTop: 12 * u })}>
        <AvatarArt look={avatar} size={38 * u} ringOn={p.paper} />
        <div style={col()}>
          <span style={{ fontSize: 14 * u, fontWeight: 700 }}>{shortName}</span>
          {course ? <span style={{ fontSize: 10.5 * u, color: p.ink2 }}>{course}</span> : null}
        </div>
      </div>
      <span style={{ marginTop: 12 * u, fontFamily: fonts.head, fontSize: 30 * u, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>Duel me.</span>
      <div style={col({ gap: 3 * u, marginTop: 10 * u, fontSize: 11 * u })}>
        {lines.map(([k, v]) => (
          <div key={k} style={row({ gap: 8 * u })}>
            <span style={{ width: 52 * u, color: p.ink2 }}>{k}</span>
            <span style={{ flex: 1, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <Tear u={u} look="AMBER" />
    </div>
  );
  return (
    <Frame
      u={u}
      fonts={fonts}
      origin={origin}
      slip={slip}
      look="AMBER"
      title={`${firstName} wants a duel`}
      text="Same real past questions, same clock, live. Your first duel is free."
      link={link}
    />
  );
}
