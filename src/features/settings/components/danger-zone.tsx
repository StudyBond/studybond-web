"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useDeleteAccount } from "@/features/settings/hooks/use-settings";
import { cn } from "@/lib/utils/cn";

import { errorText, PasswordInput } from "./settings-ui";
import s from "./settings.module.css";

/** Delete account: its own page, so the password is the confirmation. */
export function DangerZone() {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = useState("");

  async function handleDelete() {
    if (!password) return;
    try {
      await deleteAccount.mutateAsync(password);
      router.push("/");
    } catch {
      /* Shown under the button from the mutation state. */
    }
  }

  return (
    <>
      <section className={s.warn}>
        <b>This can&rsquo;t be undone</b>
        <p>
          Deleting your account erases your papers, report card, streak, saved questions and plan.
          Any premium time you have left goes with it.
        </p>
      </section>

      <h2 className={s.gh}>Confirm it&rsquo;s you</h2>
      <div className={s.list}>
        <div className={s.item}>
          <label className={s.label} htmlFor="delete-password">Your password</label>
          <PasswordInput
            id="delete-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={deleteAccount.isPending}
          />
        </div>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={cn(s.btn, s.btnBad)}
          onClick={handleDelete}
          disabled={!password || deleteAccount.isPending}
        >
          {deleteAccount.isPending ? "Deleting…" : "Delete my account"}
        </button>
        {deleteAccount.isError ? (
          <p className={s.err} role="alert">{errorText(deleteAccount.error, "Couldn't delete your account. Try again.")}</p>
        ) : null}
        <Link href={"/dashboard/me" as Route} className={cn(s.btn, s.btnLine, s.btnGap)}>
          Keep my account
        </Link>
      </div>
    </>
  );
}
