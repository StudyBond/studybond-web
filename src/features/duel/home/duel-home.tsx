"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import {
  useCancelDuelSearchMutation,
  useDuelMatchmaking,
  useFindChallengerMutation,
} from "@/features/duel-matchmaking/hooks/use-duel-matchmaking";
import {
  KEEP_LOOKING_PROMPT_SECONDS,
  formatElapsed,
  secondsSince,
} from "@/features/duel-matchmaking/lib/matchmaking-store";
import {
  duelHomeQueryKey,
  useAnswerChallenge,
  useDuelHome,
  useRematch,
} from "@/features/duel/hooks/use-duel-play";
import {
  dismissTasterRequest,
  getDuelSessionById,
  type DuelHome as DuelHomeData,
  type IncomingChallenge,
  type TasterRequest,
} from "@/lib/api/duel";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import type { UserProfile, UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import h from "./home.module.css";
import {
  DuelAvatar,
  FormGuide,
  SubjectTile,
  apiErrorCode,
  firstName,
  formatLeft,
  headToHeadLine,
  lastDuelLine,
  minutesLabel,
  shortName,
  shortWhen,
  useNow,
} from "../ui/parts";
import { JoinSheet } from "./join-sheet";
import { RematchSheet, type RematchSheetMode } from "./rematch-sheet";

const GATE_EXAMS = 2;

export function DuelHome({
  profile,
  stats,
}: {
  profile: UserProfile;
  stats: UserStats;
}) {
  const home = useDuelHome();
  const [joinOpen, setJoinOpen] = useState(false);

  if (home.isLoading || !home.data) {
    return (
      <div className={cn("sb-ui", s.page)}>
        <div className={s.loading}>
          {home.isError
            ? "Could not load your duels. Pull to refresh."
            : "Loading your duels"}
        </div>
      </div>
    );
  }

  const data = home.data;
  const isPremium = data.freeDuel.isPremium;

  return (
    <div className={cn("sb-ui", s.page, h.home)}>
      {isPremium ? (
        <PremiumHome
          data={data}
          stats={stats}
          onJoin={() => setJoinOpen(true)}
        />
      ) : (
        <FreeHome data={data} onJoin={() => setJoinOpen(true)} />
      )}
      {joinOpen && (
        <JoinSheet
          profile={profile}
          freeDuel={data.freeDuel}
          onClose={() => setJoinOpen(false)}
        />
      )}
    </div>
  );
}

function boardLabel(name: string | undefined, trackName: string | undefined) {
  if (!name) return "your exam";
  return trackName && !name.includes(trackName) ? `${name} ${trackName}` : name;
}

/* ─── Premium ─────────────────────────────────────────────────────────── */

function PremiumHome({
  data,
  stats,
  onJoin,
}: {
  data: DuelHomeData;
  stats: UserStats;
  onJoin: () => void;
}) {
  const { data: examProfile } = useExamProfile();
  const board = boardLabel(
    examProfile?.institution.name ?? data.board.name,
    examProfile?.trackName,
  );
  const gateLeft = Math.max(0, GATE_EXAMS - stats.realExamsCompleted);

  return (
    <div className={h.grid}>
      <div className={h.col}>
        <RecordHero data={data} board={board} />
        {gateLeft > 0 ? (
          <section className={s.card}>
            <h2>Find a challenger</h2>
            <p className={s.sub}>
              Finish {gateLeft} more real exam{gateLeft === 1 ? "" : "s"} to
              unlock full duels. Taster duels are open now.
            </p>
            <Link
              className={cn(s.btn, s.line, s.wide)}
              style={{ marginTop: 14 }}
              href={"/dashboard/practice" as Route}
            >
              Take a real exam
            </Link>
          </section>
        ) : (
          <MatchmakingCard board={board} />
        )}
        <div className={s.ways}>
          <Link className={s.way} href={"/dashboard/duel/new" as Route}>
            <span className={s.wi}>
              <SendIcon />
            </span>
            <b>Challenge a friend</b>
            <span>Make a duel slip and send it on WhatsApp</span>
          </Link>
          <button type="button" className={s.way} onClick={onJoin}>
            <span className={s.wi}>
              <TicketIcon />
            </span>
            <b>Join with a code</b>
            <span>Got a duel slip from a friend? Type the code</span>
          </button>
        </div>
        <IncomingChallenges challenges={data.incomingChallenges} />
        <TasterRequests requests={data.tasterRequests ?? []} />
      </div>
      <div className={h.col}>
        <Rivals data={data} />
        <Recent data={data} />
      </div>
    </div>
  );
}

/** "Tobi wants a taster": a free friend opened your full-paper slip. */
function TasterRequests({ requests }: { requests: TasterRequest[] }) {
  const queryClient = useQueryClient();
  const dismiss = useMutation({
    mutationFn: (requestId: number) => dismissTasterRequest(requestId),
    onSettled: () =>
      void queryClient.invalidateQueries({ queryKey: duelHomeQueryKey }),
  });
  if (requests.length === 0) return null;
  return (
    <section className={s.block}>
      <h2 className={s.h}>Asked for a taster</h2>
      {requests.map((request) => {
        const who = shortName(request.from.fullName);
        const href = `/dashboard/duel/new?to=${request.from.userId}&name=${encodeURIComponent(who)}&taster=1`;
        return (
          <div key={request.requestId} className={s.invite}>
            <DuelAvatar size={44} />
            <div className={s.inviteText}>
              <b>{who} wants a taster</b>
              <span>
                {request.from.course ? `${request.from.course} · ` : ""}On the
                free plan, so they can&apos;t take your full paper. Send a taster:
                one subject, 15 questions.
              </span>
            </div>
            <div className={s.inviteActions}>
              <Link className={cn(s.btn, s.ink, s.sm)} href={href as Route}>
                Send one
              </Link>
              <button
                type="button"
                className={cn(s.btn, s.line, s.sm)}
                disabled={dismiss.isPending}
                onClick={() => dismiss.mutate(request.requestId)}
              >
                Not now
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function RecordHero({ data, board }: { data: DuelHomeData; board: string }) {
  const { won, lost, drawn, currentWinRun } = data.record;
  const pips = Math.min(currentWinRun, 5);
  return (
    <section className={s.hero}>
      <p className={s.ctx}>Your duels on {board}</p>
      <div className={s.record}>
        <div>
          <b>{won}</b>
          <span>won</span>
        </div>
        <div>
          <b>{lost}</b>
          <span>lost</span>
        </div>
        <div>
          <b>{drawn}</b>
          <span>draw{drawn === 1 ? "" : "s"}</span>
        </div>
        {currentWinRun > 0 && (
          <div className={s.streak}>
            <div className={s.pips} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <i key={index} className={index < pips ? undefined : s.off} />
              ))}
            </div>
            <small>
              {currentWinRun === 1 ? "1 win" : `${currentWinRun} wins in a row`}
            </small>
          </div>
        )}
      </div>
      <p className={s.fact}>
        Win a duel on real past questions and every correct answer pays{" "}
        <b>1.5× SP</b>. Lose and you still get normal SP.
      </p>
    </section>
  );
}

function MatchmakingCard({ board }: { board: string }) {
  const router = useRouter();
  const { data: view } = useDuelMatchmaking({ refreshWhileIdle: true });
  const { data: examProfile } = useExamProfile();
  const search = useFindChallengerMutation();
  const cancel = useCancelDuelSearchMutation();
  const subjects = examProfile?.subjects ?? [];
  const [any, setAny] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const now = useNow();

  useEffect(() => {
    if (view && !view.anySubject && view.subjects.length > 0) {
      setAny(false);
      setPicked(view.subjects);
    }
    // Only when the server's choice first arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.state]);

  const state = view?.state ?? "IDLE";
  const searching = state === "SEARCHING";
  const found =
    state === "MATCHED" || state === "STARTING" || state === "STARTED";

  let hint = "";
  let hintWarn = false;
  if (!any) {
    if (picked.length === 0) {
      hint = "Pick at least one subject.";
      hintWarn = true;
    } else if (picked.length === 1)
      hint = `We match you with someone who also picked ${picked[0]}.`;
    else
      hint = `We match you on any of these: ${picked.slice(0, -1).join(", ")} or ${picked[picked.length - 1]}.`;
  }

  async function start() {
    if (!any && picked.length === 0) return;
    try {
      await search.mutateAsync({
        subjects: any ? [] : picked,
        anySubject: any,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start looking.",
      );
    }
  }

  const waited = view?.searchingSince
    ? secondsSince(view.searchingSince, now)
    : 0;

  return (
    <section className={s.card}>
      <h2>Find a challenger</h2>
      <p className={s.sub}>
        We pair you with someone on {board} who is online now.
      </p>

      {!searching && !found && (
        <>
          <button
            type="button"
            className={s.anyrow}
            role="switch"
            aria-checked={any}
            onClick={() => setAny(!any)}
          >
            <span>
              <b>Any subject</b>
              <small>
                {any
                  ? "Fastest way to get a match"
                  : "Choose the subjects below"}
              </small>
            </span>
            <span className={cn(s.switch, any && s.on)} aria-hidden="true">
              <i />
            </span>
          </button>
          {!any && (
            <div
              className={s.slist}
              role="group"
              aria-label="Subjects you're happy to duel in"
            >
              {subjects.map((subject) => {
                const on = picked.includes(subject.name);
                return (
                  <button
                    key={subject.name}
                    type="button"
                    className={cn(s.srow, on && s.on)}
                    aria-pressed={on}
                    onClick={() =>
                      setPicked(
                        on
                          ? picked.filter((name) => name !== subject.name)
                          : [...picked, subject.name],
                      )
                    }
                  >
                    <SubjectTile
                      iconName={subject.iconName}
                      code={subject.code}
                      colorToken={subject.colorToken}
                    />
                    <b>{subject.name}</b>
                    <span className={s.mark} aria-hidden="true">
                      <CheckIcon />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <p className={cn(s.hint, hintWarn && s.warn)}>
            {hint ||
              (view && view.lookingNow > 0
                ? `${view.lookingNow} looking for a duel right now.`
                : "")}
          </p>
          <button
            type="button"
            className={cn(s.btn, s.ink, s.wide)}
            disabled={(!any && picked.length === 0) || search.isPending}
            onClick={start}
          >
            Find a challenger
          </button>
        </>
      )}

      {searching && view && (
        <div className={s.search}>
          <div className={s.scanbar}>
            <i />
          </div>
          <div className={s.searchRow}>
            <span>Looking for a challenger</span>
            <span className="ui-num">{formatElapsed(waited)}</span>
          </div>
          <p className={s.sub}>
            {view.anySubject ? "Any subject" : view.subjects.join(", ")}. You
            don&apos;t have to wait on this page. We&apos;ll call you back the
            moment someone is found.
          </p>
          {waited >= KEEP_LOOKING_PROMPT_SECONDS && (
            <p className={s.sub} style={{ marginTop: 10 }}>
              Nobody yet?{" "}
              <Link
                href={"/dashboard/duel/ghost" as Route}
                style={{ color: "var(--ui-mark-ink)", fontWeight: 700 }}
              >
                Race a ghost
              </Link>{" "}
              while you wait.
            </p>
          )}
          <button
            type="button"
            className={cn(s.btn, s.line, s.wide)}
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
          >
            Stop looking
          </button>
        </div>
      )}

      {found && view?.match && (
        <>
          <div className={s.found}>
            <DuelAvatar size={52} />
            <div>
              <b>{view.match.opponentFirstName} is in</b>
              <span>
                {view.match.subject}
                {view.match.durationSeconds
                  ? ` · ${minutesLabel(view.match.durationSeconds)}`
                  : ""}
              </span>
              <span>
                {view.match.iAmReady
                  ? "You're ready. Waiting for them."
                  : "Tap Ready in the popup to start."}
              </span>
            </div>
          </div>
          {view.sessionCode && state === "STARTED" && (
            <button
              type="button"
              className={cn(s.btn, s.ink, s.wide)}
              onClick={() =>
                router.push(`/dashboard/duel/${view.sessionCode}` as Route)
              }
            >
              Go to the duel
            </button>
          )}
        </>
      )}
    </section>
  );
}

function IncomingChallenges({
  challenges,
}: {
  challenges: IncomingChallenge[];
}) {
  const router = useRouter();
  const { accept, decline } = useAnswerChallenge();
  const now = useNow();
  const live = challenges.filter(
    (challenge) =>
      !challenge.expiresAt || new Date(challenge.expiresAt).getTime() > now,
  );
  if (live.length === 0) return null;

  return (
    <section className={s.block}>
      <h2 className={s.h}>Challenges for you</h2>
      {live.map((challenge) => {
        const who = shortName(challenge.from.fullName);
        const left = challenge.expiresAt
          ? new Date(challenge.expiresAt).getTime() - now
          : null;
        return (
          <div key={challenge.sessionId} className={s.invite}>
            <DuelAvatar size={44} />
            <div className={s.inviteText}>
              <b>
                {challenge.isRematch
                  ? `${who} wants a rematch`
                  : `${who} challenged you`}
              </b>
              <span>
                {challenge.subjects.join(" and ")} · {challenge.totalQuestions}{" "}
                questions
                {challenge.durationSeconds
                  ? ` · ${minutesLabel(challenge.durationSeconds)}`
                  : ""}
                {challenge.isTaster ? " · Taster" : ""}
              </span>
              {left !== null && (
                <span className={cn(s.left, "ui-num")}>
                  Expires in {formatLeft(left)}
                </span>
              )}
            </div>
            <div className={s.inviteActions}>
              <button
                type="button"
                className={cn(s.btn, s.ink, s.sm)}
                disabled={accept.isPending}
                onClick={async () => {
                  try {
                    const snapshot = await accept.mutateAsync(
                      challenge.sessionId,
                    );
                    router.push(
                      `/dashboard/duel/${snapshot.session.code}` as Route,
                    );
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not accept.",
                    );
                  }
                }}
              >
                Accept
              </button>
              <button
                type="button"
                className={cn(s.btn, s.line, s.sm)}
                disabled={decline.isPending}
                onClick={() => decline.mutate(challenge.sessionId)}
              >
                Not now
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

type Rival = DuelHomeData["rivals"][number];

function Rivals({ data }: { data: DuelHomeData }) {
  const router = useRouter();
  const rematch = useRematch();
  const [sent, setSent] = useState<Record<number, boolean>>({});
  const [checking, setChecking] = useState<number | null>(null);
  const [sheet, setSheet] = useState<{ rival: Rival; mode: RematchSheetMode } | null>(null);
  const freeDuel = data.freeDuel;

  async function send(rival: Rival, subject?: string) {
    if (!rival.lastDuel) return;
    const rivalFirst = firstName(rival.opponentName);
    try {
      const snapshot = await rematch.mutateAsync({ sessionId: rival.lastDuel.sessionId, subject });
      setSent((current) => ({ ...current, [rival.opponentId]: true }));
      setSheet(null);
      // Both asked: it's one duel now, so go straight in.
      if (snapshot.session.participants.length === 2) {
        router.push(`/dashboard/duel/${snapshot.session.code}` as Route);
      } else {
        toast.success(`Rematch sent. ${rivalFirst} gets 30 minutes to say yes.`);
      }
    } catch (error) {
      // An older page view could still send a full-paper rematch for a free student.
      if (apiErrorCode(error) === "DUEL_REMATCH_NEEDS_TASTER") {
        void openSheet(rival);
        return;
      }
      toast.error(error instanceof Error ? error.message : "Could not send the rematch.");
    }
  }

  /* Free duels are one-subject tasters (mockup M1): a free student's rematch
     of a full paper opens the sheet; a taster rematch goes straight out. */
  async function openSheet(rival: Rival) {
    if (!rival.lastDuel) return;
    if (freeDuel.available === false) {
      setSheet({ rival, mode: { kind: "used" } });
      return;
    }
    setChecking(rival.opponentId);
    try {
      const old = (await getDuelSessionById(rival.lastDuel.sessionId)).session;
      if (old.isTaster || old.subjects.length <= 1) {
        await send(rival);
      } else {
        setSheet({ rival, mode: { kind: "pick", subjects: old.subjects } });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the rematch.");
    } finally {
      setChecking(null);
    }
  }

  function onRematch(rival: Rival) {
    if (freeDuel.isPremium) return send(rival);
    return openSheet(rival);
  }

  return (
    <section className={s.block}>
      <h2 className={s.h}>
        Your rivals <small>people you&apos;ve duelled more than once</small>
      </h2>
      {data.rivals.length === 0 ? (
        <div className={s.empty}>
          <span className={s.eic} aria-hidden="true">
            <PeopleIcon />
          </span>
          <span>
            <b>Nobody yet</b>Duel the same person twice and they show up here,
            with your record against them.
          </span>
        </div>
      ) : (
        <div>
          {data.rivals.map((rival) => {
            const rivalFirst = firstName(rival.opponentName);
            const isSent = Boolean(sent[rival.opponentId]);
            return (
              <div key={rival.opponentId} className={s.rival}>
                <DuelAvatar size={44} />
                <div className={s.rvText}>
                  <div className={s.rvName}>
                    <span>{shortName(rival.opponentName)}</span>
                    <FormGuide form={rival.form} />
                  </div>
                  <span className={s.h2h}>
                    {headToHeadLine(rival.wins, rival.losses, rivalFirst)}
                  </span>
                  <span className={s.last}>
                    {lastDuelLine(rival.lastDuel, rivalFirst)}
                  </span>
                </div>
                <button
                  type="button"
                  className={cn(s.btn, s.line, s.sm, isSent && s.sent)}
                  disabled={isSent || rematch.isPending || checking !== null || !rival.lastDuel}
                  onClick={() => void onRematch(rival)}
                >
                  {isSent ? "Sent" : checking === rival.opponentId ? "One moment" : "Rematch"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {sheet ? (
        <RematchSheet
          rivalShort={shortName(sheet.rival.opponentName)}
          rivalFirst={firstName(sheet.rival.opponentName)}
          lastLine={lastDuelLine(sheet.rival.lastDuel, firstName(sheet.rival.opponentName))}
          h2hLine={headToHeadLine(sheet.rival.wins, sheet.rival.losses, firstName(sheet.rival.opponentName))}
          lastResult={sheet.rival.lastDuel?.result ?? null}
          mode={sheet.mode}
          freeDuel={freeDuel}
          sending={rematch.isPending}
          onSend={(subject) => void send(sheet.rival, subject)}
          onClose={() => setSheet(null)}
        />
      ) : null}
    </section>
  );
}

function Recent({ data }: { data: DuelHomeData }) {
  const words = { W: "Won", L: "Lost", D: "Draw" } as const;
  const classes = { W: s.w, L: s.l, D: s.d } as const;
  return (
    <section className={s.block}>
      <h2 className={s.h}>Recent duels</h2>
      {data.recent.length === 0 ? (
        <div className={s.empty}>
          <span className={s.eic} aria-hidden="true">
            <ClockIcon />
          </span>
          <span>
            <b>No duels yet</b>Results and reviews land here after each duel.
          </span>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {data.recent.map((duel) => (
            <div key={duel.sessionId} className={s.recent}>
              <span className={cn(s.res, classes[duel.result])}>
                {words[duel.result]}
              </span>
              <span>{shortName(duel.opponentName)}</span>
              <span className={cn("ui-num", s.rcScore)}>
                {duel.myScore}–{duel.opponentScore}
              </span>
              <span className={s.rcWhen}>{shortWhen(duel.endedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Free ────────────────────────────────────────────────────────────── */

function FreeHome({
  data,
  onJoin,
}: {
  data: DuelHomeData;
  onJoin: () => void;
}) {
  const { data: examProfile } = useExamProfile();
  /* The price is set per board in the admin; the status call returns the
     student's own board's price. Same key as the settings page. */
  const { data: plan } = useQuery({
    queryKey: ["settings", "subscription-status"],
    queryFn: getSubscriptionStatus,
    staleTime: 5 * 60_000,
  });
  const board = boardLabel(
    examProfile?.institution.name ?? data.board.name,
    examProfile?.trackName,
  );
  const now = useNow(30_000);
  const resetIn = formatLeft(
    new Date(data.freeDuel.nextFreeDuelAt).getTime() - now,
  );
  const available = data.freeDuel.available === true;

  return (
    <div className={h.grid}>
      <div className={h.col}>
        <section className={s.pass} aria-label="Your free duel">
          <div className={s.passBig}>
            <b>{available ? 1 : 0}</b>
            <span>free duel</span>
          </div>
          <div>
            <h2>
              {available
                ? "Your duel this week is free"
                : "This week's free duel is used"}
            </h2>
            <p>
              {available
                ? "A taster duel: one subject, 15 questions. Race a ghost, challenge a friend, or accept a friend's taster."
                : "A new free duel arrives on Sunday. Premium duels never run out."}
            </p>
            <span className={s.reset}>Resets Sunday · {resetIn}</span>
          </div>
        </section>

        <div className={s.ways} style={{ marginTop: 14 }}>
          <Link
            className={cn(s.way, s.hot)}
            href={"/dashboard/duel/ghost" as Route}
          >
            <span className={s.wi}>
              <GhostIcon />
            </span>
            <b>Race a ghost</b>
            <span>
              Built from real students&apos; answers. Any time, no waiting.
            </span>
          </Link>
          <Link className={s.way} href={"/dashboard/duel/new" as Route}>
            <span className={s.wi}>
              <SendIcon />
            </span>
            <b>Challenge a friend</b>
            <span>A 15-question taster. Send the slip on WhatsApp.</span>
          </Link>
        </div>

        <button type="button" className={s.joinRow} onClick={onJoin}>
          <span className={s.wi}>
            <TicketIcon />
          </span>
          <div>
            <b>Join with a code</b>
            <small>A friend sent you a taster slip?</small>
          </div>
          <span className={s.freeTag}>Free</span>
        </button>
        <p className={s.pool}>
          Tasters come from a fixed set of about 40 questions per subject,
          picked for free play, so you&apos;ll see some again. Premium duels use
          the whole question bank.
        </p>

        <IncomingChallenges challenges={data.incomingChallenges} />

        <section className={s.locked} aria-label="Find a challenger, premium">
          <div className={s.lockedHead}>
            <LockIcon />
            <h3>Find a challenger</h3>
          </div>
          <p>
            Get matched with someone on {board} who is online right now, on a
            full paper.
          </p>
          <span className={s.pill}>Premium</span>
        </section>
      </div>
      <div className={h.col}>
        <Rivals data={data} />
        <Recent data={data} />

        <section className={s.prem}>
          <h3>
            Duel as much as you like with <span>Premium</span>
          </h3>
          <ul>
            {[
              "Unlimited duels and rematches",
              "Full papers from the whole question bank",
              "Live challengers who are online now",
              "See what your rival picked on every question",
            ].map((line) => (
              <li key={line}>
                <CheckIcon />
                {line}
              </li>
            ))}
          </ul>
          <div className={s.price}>
            <span>
              {plan ? (
                <>
                  <b className="ui-num">
                    ₦{plan.priceNaira.toLocaleString("en-NG")}
                  </b>
                  <small>
                    for {plan.durationMonths} month
                    {plan.durationMonths === 1 ? "" : "s"} on {board}
                  </small>
                </>
              ) : (
                <>
                  <b>Premium</b>
                  <small>on {board}</small>
                </>
              )}
            </span>
            <Link
              className={cn(s.btn, s.ink)}
              style={{ minHeight: 46 }}
              href={"/dashboard/settings?tab=subscription" as Route}
            >
              See premium
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─── Icons (lucide shapes, drawn inline like the mockup) ─────────────── */

function Svg({
  children,
  width = 1.8,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
export const SendIcon = () => (
  <Svg>
    <path d="M21 3 10 14" />
    <path d="M21 3 14.5 21l-4.5-7-7-4.5Z" />
  </Svg>
);
export const TicketIcon = () => (
  <Svg>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6Z" />
    <path d="M13 5v2M13 11v2M13 17v2" />
  </Svg>
);
export const GhostIcon = () => (
  <Svg>
    <path d="M9 10h.01M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </Svg>
);
export const CheckIcon = () => (
  <Svg width={3}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const LockIcon = () => (
  <Svg width={2}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
const PeopleIcon = () => (
  <Svg width={2}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20a6 6 0 0 0-4-5.6" />
  </Svg>
);
const ClockIcon = () => (
  <Svg width={2}>
    <path d="M12 7v5l3 2" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);

export function useBoardLabel(): string {
  const { data: examProfile } = useExamProfile();
  return useMemo(
    () => boardLabel(examProfile?.institution.name, examProfile?.trackName),
    [examProfile],
  );
}
