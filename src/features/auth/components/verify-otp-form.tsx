"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import {
  useResendVerificationOtpMutation,
  useVerifyOtpMutation,
} from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email.");
const schema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

type VerifyOtpFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

function parseDateValue(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useVerifyOtpMutation();
  const resendMutation = useResendVerificationOtpMutation();
  const verificationType =
    searchParams.get("verificationType") === "DEVICE_REGISTRATION"
      ? "DEVICE_REGISTRATION"
      : "EMAIL_VERIFICATION";
  const initialEmail = searchParams.get("email") || "";
  const initialOtpExpiresAt = searchParams.get("otpExpiresAt");
  const initialResendAvailableAt = searchParams.get("resendAvailableAt");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(() => initialOtpExpiresAt);
  const [resendAvailableAt, setResendAvailableAt] = useState<string | null>(() => initialResendAvailableAt);
  const [now, setNow] = useState(() => Date.now());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      otp: "",
    },
  });

  const emailValue = form.watch("email");
  const otpExpiresAtMs = parseDateValue(otpExpiresAt);
  const resendAvailableAtMs = parseDateValue(resendAvailableAt);
  const otpSecondsRemaining =
    otpExpiresAtMs === null ? null : Math.max(0, Math.ceil((otpExpiresAtMs - now) / 1000));
  const resendSecondsRemaining =
    resendAvailableAtMs === null ? 0 : Math.max(0, Math.ceil((resendAvailableAtMs - now) / 1000));
  const otpExpired = otpSecondsRemaining === 0;
  const canResend =
    verificationType === "EMAIL_VERIFICATION" &&
    resendSecondsRemaining === 0 &&
    emailSchema.safeParse(emailValue).success;
  const activeErrorMessage = mutation.isError
    ? safeErrorMessage(mutation.error)
    : resendMutation.isError
      ? safeErrorMessage(resendMutation.error)
      : null;

  useEffect(() => {
    setOtpExpiresAt(initialOtpExpiresAt);
  }, [initialOtpExpiresAt]);

  useEffect(() => {
    form.setValue("email", initialEmail);
  }, [form, initialEmail]);

  useEffect(() => {
    setResendAvailableAt(initialResendAvailableAt);
  }, [initialResendAvailableAt]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    setStatusMessage(null);
    const device = buildWebDeviceContext();

    const response = await mutation.mutateAsync({
      ...values,
      deviceName: device.deviceName,
      device,
    });

    router.push(response.requiresOTP ? "/login" : "/dashboard");
  });

  async function handleResend() {
    const email = form.getValues("email").trim();
    const parsedEmail = emailSchema.safeParse(email);

    if (!parsedEmail.success) {
      form.setError("email", {
        type: "manual",
        message: parsedEmail.error.issues[0]?.message || "Enter a valid email.",
      });
      return;
    }

    form.clearErrors("email");
    setStatusMessage(null);

    const response = await resendMutation.mutateAsync({ email });
    setStatusMessage(response.message);
    setOtpExpiresAt((current) => response.otpExpiresAt ?? current);
    setResendAvailableAt((current) => response.resendAvailableAt ?? current);
    setNow(Date.now());
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {activeErrorMessage ? <InlineError message={activeErrorMessage} /> : null}
      {statusMessage ? (
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-3.5 py-3 text-sm text-emerald-300">
          {statusMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <p className="text-sm font-medium text-white/85">
          {otpSecondsRemaining === null
            ? "Check your email for the latest 6-digit code."
            : otpExpired
              ? "This verification code has expired."
              : `Code expires in ${formatCountdown(otpSecondsRemaining)}.`}
        </p>
        <p className="mt-1 text-xs text-white/50">
          {verificationType === "EMAIL_VERIFICATION"
            ? otpExpired
              ? "Request a fresh code to finish verifying your account."
              : resendSecondsRemaining > 0
                ? `You can request a new code in ${formatCountdown(resendSecondsRemaining)}.`
                : "You can request a fresh code now if the email has not arrived."
            : otpExpired
              ? "Start sign-in again to request another device approval code."
              : "Enter the code from your email to approve this device."}
        </p>
      </div>

      <Field
        autoComplete="email"
        error={form.formState.errors.email?.message}
        label="Email address"
        type="email"
        placeholder="you@example.com"
        {...form.register("email")}
      />
      <Field
        autoComplete="one-time-code"
        className="sb-mono text-xl tracking-[0.3em] text-center"
        error={form.formState.errors.otp?.message}
        inputMode="numeric"
        label="Verification code"
        maxLength={6}
        placeholder="000000"
        {...form.register("otp")}
      />
      <Button
        className="w-full"
        isLoading={mutation.isPending}
        type="submit"
      >
        Verify
      </Button>

      {verificationType === "EMAIL_VERIFICATION" ? (
        <Button
          className="w-full"
          disabled={!canResend || mutation.isPending}
          isLoading={resendMutation.isPending}
          onClick={handleResend}
          type="button"
          variant="secondary"
        >
          {resendSecondsRemaining > 0
            ? `Resend code in ${formatCountdown(resendSecondsRemaining)}`
            : "Resend code"}
        </Button>
      ) : null}

      <p className="text-center text-xs text-[var(--sb-text-secondary)]">
        {verificationType === "EMAIL_VERIFICATION" ? (
          <>
            Already verified?{" "}
            <Link
              className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]"
              href="/login"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Need a fresh device code?{" "}
            <Link
              className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]"
              href="/login"
            >
              Start sign-in again
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
