"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { getDashboardHome, homeKeys } from "@/features/home/api";
import { boardLabel, dayMonth, lagosKey, priceLine, thousands } from "@/features/home/format";
import { resumePaystackTransaction } from "@/lib/payments/paystack-inline";
import { cn } from "@/lib/utils/cn";

import {
  PAYMENT_SUPPORT_EMAIL,
  useInitiateSubscription,
  useRefreshPremium,
  useVerifySubscription,
} from "../hooks/use-subscription";
import { Loading } from "./settings-ui";
import s from "./settings.module.css";

/* What premium opens, in the words of the premium card on Home. */
const PREMIUM_GIVES = [
  "Unlimited papers on every subject",
  "The whole question bank",
  "Duels on full papers",
  "Your full report card",
];

const Tick = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** "15 March", with the year when it isn't this year. */
function endDate(iso: string): string {
  const key = lagosKey(iso);
  const thisYear = lagosKey(new Date().toISOString()).slice(0, 4);
  return key.slice(0, 4) === thisYear ? dayMonth(key) : `${dayMonth(key)} ${key.slice(0, 4)}`;
}

type Phase = "idle" | "loading" | "checkout" | "verifying";

/** Plan: premium on this board, days left, renew; or the free plan and going premium. */
export function SubscriptionTab() {
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const initiate = useInitiateSubscription();
  const verify = useVerifySubscription();
  const refreshPremium = useRefreshPremium();
  const [phase, setPhase] = useState<Phase>("idle");
  const busy = initiate.isPending || verify.isPending || phase !== "idle";

  function busyLabel(idle: string): string {
    if (initiate.isPending) return "Getting checkout ready…";
    if (phase === "loading") return "Opening checkout…";
    if (phase === "checkout") return "Finish paying in the checkout";
    if (phase === "verifying" || verify.isPending) return "Checking your payment…";
    return idle;
  }

  function startCheckout() {
    if (busy) return;
    initiate.mutate(
      { autoRenew: false },
      {
        onSuccess: async (data) => {
          setPhase("loading");
          try {
            await resumePaystackTransaction(data.accessCode, {
              onLoad: () => setPhase("checkout"),
              onSuccess: (transaction) => {
                setPhase("verifying");
                verify.mutate(
                  { reference: transaction.reference || data.reference },
                  {
                    onSuccess: async (result) => {
                      await refreshPremium();
                      if (result.activated) {
                        toast.success("Premium is on", { description: result.message });
                      } else if (result.paymentStatus === "SUCCESS") {
                        /* Paid, but held: a plan is still running on another
                           exam. The team refunds it or sets the plan up by hand. */
                        toast.warning("Payment received", {
                          description: `${result.message} Questions? Email ${PAYMENT_SUPPORT_EMAIL}.`,
                          duration: 20000,
                        });
                      } else {
                        toast.error("The payment didn't go through", {
                          description: `${result.message} If money left your account, email ${PAYMENT_SUPPORT_EMAIL}.`,
                        });
                      }
                      setPhase("idle");
                    },
                    onError: () => setPhase("idle"),
                  },
                );
              },
              onCancel: () => {
                setPhase("idle");
                toast.info("Checkout closed", { description: "You didn't pay anything." });
              },
              onError: (error) => {
                setPhase("idle");
                toast.error("Checkout couldn't load", {
                  description: error.message || `Try again, or email ${PAYMENT_SUPPORT_EMAIL}.`,
                });
              },
            });
          } catch {
            setPhase("idle");
            toast("Opening Paystack's checkout page instead");
            window.location.href = data.checkoutUrl;
          }
        },
      },
    );
  }

  if (!home.data) {
    return <Loading text={home.isError ? "We couldn't load your plan. Check your internet and try again." : undefined} />;
  }

  const { plan, board } = home.data;
  const boardName = boardLabel(board);
  const price = priceLine(plan.priceNaira, plan.durationMonths);
  const months = `${plan.durationMonths} month${plan.durationMonths === 1 ? "" : "s"}`;

  const payNote = (
    <>
      <p className={s.note}>Paystack&rsquo;s checkout opens right here.</p>
      <p className={s.note} style={{ marginTop: 4 }}>
        Payment problem? Email <a href={`mailto:${PAYMENT_SUPPORT_EMAIL}?subject=StudyBond%20payment`}>{PAYMENT_SUPPORT_EMAIL}</a>.
      </p>
    </>
  );

  const gives = (
    <ul className={cn(s.list, s.gets)}>
      {PREMIUM_GIVES.map((line) => (
        <li key={line}><Tick />{line}</li>
      ))}
    </ul>
  );

  if (plan.isPremium) {
    const days = plan.daysLeft ?? 0;
    return (
      <>
        <section className={cn(s.plan, plan.endingSoon ? s.planWarn : s.planOn)}>
          <div className={s.planTop}>
            <b>Premium</b>
            <span className={cn(s.pill, plan.endingSoon ? s.pillWarn : s.pillOn)}>{boardName}</span>
          </div>
          <div className={s.days}>
            <b>{days}</b>
            <span>day{days === 1 ? "" : "s"} left</span>
          </div>
          {plan.endsAt ? <p className={s.planSub}>Ends on {endDate(plan.endsAt)}. Premium covers {boardName} only.</p> : null}
        </section>

        {plan.endingSoon ? (
          <div className={s.actions}>
            <button type="button" className={s.btn} onClick={startCheckout} disabled={busy}>
              {busyLabel(`Renew · ${price}`)}
            </button>
            <p className={s.note}>Renewing adds {months} to your end date, so you lose no days.</p>
            {payNote}
          </div>
        ) : null}

        <h2 className={s.gh}>What you have</h2>
        {gives}
      </>
    );
  }

  const endedOn = plan.endedAt ? endDate(plan.endedAt) : null;
  return (
    <>
      <section className={s.plan}>
        <div className={s.planTop}>
          <b>Free plan</b>
          <span className={cn(s.pill, s.pillDim)}>{boardName}</span>
        </div>
        <p className={s.planSub}>
          {endedOn
            ? `Your premium ended on ${endedOn}. Your report card, streak, saved questions and duel record are all still here.`
            : plan.freeSubjectsLeft !== null
              ? `${plan.freeSubjectsLeft} of ${plan.freeSubjectsTotal} free subjects left. Today's challenge is free every day.`
              : "Today's challenge is free every day."}
        </p>
      </section>

      <h2 className={s.gh}>Premium for {boardName} · {price}</h2>
      {gives}

      <div className={s.actions}>
        <button type="button" className={s.btn} onClick={startCheckout} disabled={busy}>
          {busyLabel(`${endedOn ? "Renew premium" : "Go premium"} · ₦${thousands(plan.priceNaira)}`)}
        </button>
        {payNote}
      </div>
    </>
  );
}
