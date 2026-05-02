"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, ArrowLeft, ShieldCheck } from "lucide-react";

// ── Step 1: verify code schema ────────────────────────

const verifySchema = z.object({
  email: z.string().email("Enter a valid email."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

// ── Step 2: new password schema ───────────────────────

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmNewPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "Passwords must match.",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPasswordMutation();

  // Two-step state
  const [step, setStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");

  // Step 1 form
  const verifyForm = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: searchParams.get("email") || "",
      otp: "",
    },
  });

  // Step 2 form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onVerify = verifyForm.handleSubmit((values) => {
    setVerifiedEmail(values.email);
    setVerifiedOtp(values.otp);
    setStep(2);
  });

  const onReset = passwordForm.handleSubmit(async (values) => {
    await mutation.mutateAsync({
      email: verifiedEmail,
      otp: verifiedOtp,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    });
    router.push("/login");
  });

  // ── Step 1: Email + OTP ─────────────────────────────

  if (step === 1) {
    return (
      <form className="space-y-4" onSubmit={onVerify}>
        <Field
          autoComplete="email"
          error={verifyForm.formState.errors.email?.message}
          label="Email address"
          type="email"
          placeholder="you@example.com"
          {...verifyForm.register("email")}
        />
        <Field
          autoComplete="one-time-code"
          error={verifyForm.formState.errors.otp?.message}
          inputMode="numeric"
          label="Reset code"
          maxLength={6}
          placeholder="6-digit code"
          {...verifyForm.register("otp")}
        />

        <Button className="w-full" type="submit">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Verify code
        </Button>

        <p className="text-center text-xs text-[var(--sb-text-secondary)]">
          Back to{" "}
          <Link
            className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]"
            href="/login"
          >
            sign in
          </Link>
        </p>
      </form>
    );
  }

  // ── Step 2: New Password ────────────────────────────

  return (
    <form className="space-y-4" onSubmit={onReset}>
      {/* Verified badge */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3">
        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-400">Code verified</p>
          <p className="text-[10px] text-white/30 truncate">{verifiedEmail}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep(1);
            mutation.reset();
          }}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Change
        </button>
      </div>

      {mutation.isError ? (
        <InlineError message={safeErrorMessage(mutation.error)} />
      ) : null}

      <Field
        autoComplete="new-password"
        error={passwordForm.formState.errors.newPassword?.message}
        label="New password"
        type="password"
        placeholder="At least 8 characters"
        {...passwordForm.register("newPassword")}
      />
      <Field
        autoComplete="new-password"
        error={passwordForm.formState.errors.confirmNewPassword?.message}
        label="Confirm new password"
        type="password"
        placeholder="Repeat your password"
        {...passwordForm.register("confirmNewPassword")}
      />

      <Button
        className="w-full"
        isLoading={mutation.isPending}
        type="submit"
      >
        Reset password
      </Button>

      <p className="text-center text-xs text-[var(--sb-text-secondary)]">
        Back to{" "}
        <Link
          className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]"
          href="/login"
        >
          sign in
        </Link>
      </p>
    </form>
  );
}
