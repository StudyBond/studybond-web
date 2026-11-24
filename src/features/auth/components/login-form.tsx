"use client";

import { useLoginMutation } from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { buildVerifyOtpUrl } from "@/features/auth/lib/build-verify-otp-url";
import { safeNext } from "@/features/auth/lib/safe-next";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthFrame, AuthHead, PhoneClaim } from "./auth-frame";
import { AuthAlert, AuthField, AuthSubmit, CheckIcon, PasswordField, PhoneIcon, SignOutIcon } from "./auth-fields";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof schema>;

/* Why the student is on the login page, from ?reason= (set by the signed-out
   notice and by the reset-password page). */
const NOTES: Record<string, { band: string; title: string; body: string; good?: boolean; passwordLink?: boolean }> = {
  replaced: {
    band: "Signed out on this device",
    title: "You were signed out here",
    body: "Your account was opened on another device, so we closed it on this one. Premium works on one device at a time, so logging in here signs you out there.",
    passwordLink: true,
  },
  reset: {
    band: "Password changed",
    title: "Your new password is set",
    body: "Log in with it below. We signed you out on your other devices.",
    good: true,
  },
};

function errorCode(error: unknown) {
  if (!(error instanceof ApiError) || !error.payload || typeof error.payload !== "object") return null;
  const code = (error.payload as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const note = NOTES[searchParams.get("reason") ?? ""] ?? null;
  const mutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const errors = form.formState.errors;
  const tooManyDevices = mutation.isError && errorCode(mutation.error) === "MAX_DEVICES_REACHED";

  const onSubmit = form.handleSubmit(async (values) => {
    const device = buildWebDeviceContext();
    const response = await mutation.mutateAsync({
      ...values,
      deviceName: device.deviceName,
      device,
    });

    if (response.requiresOTP) {
      router.push(buildVerifyOtpUrl(values.email, response, next));
      return;
    }

    router.push(safeNext(next));
  });

  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <AuthFrame topQuestion="New here?" topLabel="Create a free account" topHref={signupHref}>
      <PhoneClaim />

      {note ? (
        <div className={note.good ? "au-note good" : "au-note"} role="status">
          <div className="au-note-band">
            {note.good ? <CheckIcon /> : <SignOutIcon />}
            <span>{note.band}</span>
          </div>
          <div className="au-note-main">
            <h2>{note.title}</h2>
            <p>{note.body}</p>
            {note.passwordLink ? (
              <Link className="au-link" href="/forgot-password">
                Wasn&apos;t you? Change your password
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <AuthHead title="Welcome back">
        <p>Log in to carry on where you stopped.</p>
      </AuthHead>

      <form className="au-form" onSubmit={onSubmit} noValidate>
        {tooManyDevices ? (
          <div className="au-note" role="alert">
            <div className="au-note-band">
              <PhoneIcon />
              <span>Not logged in</span>
            </div>
            <div className="au-note-main">
              <h2>Your premium account already has 2 devices</h2>
              <p>
                Log in on one of them and remove one in Settings, under Security. Then try here again.
              </p>
            </div>
          </div>
        ) : mutation.isError ? (
          <AuthAlert>{safeErrorMessage(mutation.error)}</AuthAlert>
        ) : null}

        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...form.register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          labelExtra={<Link href={"/forgot-password" as Route}>Forgot password?</Link>}
          error={errors.password?.message}
          {...form.register("password")}
        />
        <AuthSubmit busy={mutation.isPending}>Log in</AuthSubmit>
        <p className="au-alt">
          New here? <Link href={signupHref as Route}>Create a free account</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
