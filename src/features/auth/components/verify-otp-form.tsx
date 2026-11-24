"use client";

import {
  useResendVerificationOtpMutation,
  useVerifyOtpMutation,
} from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { safeNext } from "@/features/auth/lib/safe-next";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AuthFrame, AuthHead } from "./auth-frame";
import { AuthAlert, AuthField, AuthOk, AuthSubmit, PhoneIcon } from "./auth-fields";
import { CodeBoxes } from "./code-boxes";

/* One page for both codes: checking a new account's email, and approving a
   new device for a premium account (?verificationType=DEVICE_REGISTRATION). */

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
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useVerifyOtpMutation();
  const resendMutation = useResendVerificationOtpMutation();
  const isDevice = searchParams.get("verificationType") === "DEVICE_REGISTRATION";
  const next = searchParams.get("next");
  const initialEmail = searchParams.get("email") || "";
  const emailKnown = emailSchema.safeParse(initialEmail).success;
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

  const emailValue = useWatch({ control: form.control, name: "email" });
  const otpExpiresAtMs = parseDateValue(otpExpiresAt);
  const resendAvailableAtMs = parseDateValue(resendAvailableAt);
  const otpSecondsRemaining =
    otpExpiresAtMs === null ? null : Math.max(0, Math.ceil((otpExpiresAtMs - now) / 1000));
  const resendSecondsRemaining =
    resendAvailableAtMs === null ? 0 : Math.max(0, Math.ceil((resendAvailableAtMs - now) / 1000));
  const otpExpired = otpSecondsRemaining === 0;
  const canResend = !isDevice && resendSecondsRemaining === 0 && emailSchema.safeParse(emailValue).success;
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

    router.push(
      response.requiresOTP
        ? ((next ? `/login?next=${encodeURIComponent(next)}` : "/login") as Route)
        : safeNext(next),
    );
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

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const sentTo = emailKnown ? <b>{initialEmail}</b> : "your email";
  const expiryLine =
    otpSecondsRemaining === null
      ? "Use the newest code in your email."
      : otpExpired
        ? isDevice
          ? "This code has expired. Start logging in again to get a new one."
          : "This code has expired. Ask for a new one below."
        : `The code expires in ${formatCountdown(otpSecondsRemaining)}.`;

  return (
    <AuthFrame topLabel="Log in instead" topHref={loginHref}>
      <AuthHead title={isDevice ? "Approve this device" : "Check your email"}>
        <p>
          {isDevice ? (
            <>This is a new device for your premium account. We sent a 6-digit code to {sentTo}. Type it here to approve this device.</>
          ) : (
            <>We sent a 6-digit code to {sentTo}. Type it below to finish setting up your account.</>
          )}
        </p>
      </AuthHead>

      <form className="au-form" onSubmit={onSubmit} noValidate>
        {activeErrorMessage ? <AuthAlert>{activeErrorMessage}</AuthAlert> : null}
        {statusMessage ? <AuthOk>{statusMessage}</AuthOk> : null}

        {emailKnown ? null : (
          <AuthField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
        )}

        <Controller
          control={form.control}
          name="otp"
          render={({ field, fieldState }) => (
            <CodeBoxes
              label="6-digit code"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoFocus={emailKnown}
            />
          )}
        />
        <p className="au-hint" aria-live="polite">
          {expiryLine}
        </p>

        {isDevice ? (
          <p className="au-warn">
            <PhoneIcon />
            <span>
              Once you approve this device, <b>your other device will be signed out.</b> Premium works on one device at
              a time.
            </span>
          </p>
        ) : null}

        <AuthSubmit busy={mutation.isPending}>{isDevice ? "Approve this device" : "Verify my email"}</AuthSubmit>

        <div className="au-resend">
          {isDevice ? (
            <>
              <span>Need a new code?</span>
              <Link href={loginHref as Route}>Start logging in again</Link>
            </>
          ) : (
            <>
              <span>Didn&apos;t get it? Check spam first.</span>
              <button type="button" onClick={handleResend} disabled={!canResend || mutation.isPending || resendMutation.isPending}>
                {resendMutation.isPending
                  ? "Sending..."
                  : resendSecondsRemaining > 0
                    ? `Send a new code in ${formatCountdown(resendSecondsRemaining)}`
                    : "Send a new code"}
              </button>
            </>
          )}
        </div>

        <p className="au-alt">
          {isDevice ? (
            <>
              Wasn&apos;t you? <Link href="/forgot-password">Change your password</Link>
            </>
          ) : (
            <>
              Already verified? <Link href={loginHref as Route}>Log in</Link>
            </>
          )}
        </p>
      </form>
    </AuthFrame>
  );
}
