"use client";

import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthFrame, AuthHead } from "./auth-frame";
import { AuthAlert, AuthField, AuthSubmit, PasswordField } from "./auth-fields";
import { CodeBoxes } from "./code-boxes";

/* Two screens: the code from the email (kept here, checked by the server
   with the new password), then the new password. */

const codeSchema = z.object({
  email: z.string().email("Enter a valid email."),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});
type CodeFormValues = z.infer<typeof codeSchema>;

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmNewPassword: z.string().min(8, "Type your new password again."),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "The two passwords don't match.",
    path: ["confirmNewPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPasswordMutation();
  const initialEmail = searchParams.get("email") || "";
  const emailKnown = codeSchema.shape.email.safeParse(initialEmail).success;
  const [code, setCode] = useState<CodeFormValues | null>(null);

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { email: initialEmail, otp: "" },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  const onCode = codeForm.handleSubmit((values) => setCode(values));

  const onReset = passwordForm.handleSubmit(async (values) => {
    if (!code) return;
    await mutation.mutateAsync({
      email: code.email,
      otp: code.otp,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    });
    router.push("/login?reason=reset" as Route);
  });

  if (!code) {
    return (
      <AuthFrame topQuestion="Remember it?" topLabel="Log in" topHref="/login">
        <AuthHead title="Reset your password">
          <p>
            {emailKnown ? (
              <>
                We sent a 6-digit code to <b>{initialEmail}</b>. Type it here, then choose a new password.
              </>
            ) : (
              <>Type your email and the 6-digit code we sent you, then choose a new password.</>
            )}
          </p>
        </AuthHead>

        <form className="au-form" onSubmit={onCode} noValidate>
          {emailKnown ? null : (
            <AuthField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={codeForm.formState.errors.email?.message}
              {...codeForm.register("email")}
            />
          )}
          <Controller
            control={codeForm.control}
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
          <AuthSubmit>Next</AuthSubmit>
          <p className="au-alt">
            No code? <Link href="/forgot-password">Send it again</Link>
          </p>
        </form>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame topQuestion="Remember it?" topLabel="Log in" topHref="/login">
      <AuthHead title="Choose a new password">
        <p>Use at least 8 characters. Saving it signs you out on every device, so you&apos;ll log in again.</p>
      </AuthHead>

      <form className="au-form" onSubmit={onReset} noValidate>
        <div className="au-chip">
          <span>
            Code <b>{code.otp}</b>
          </span>
          <button
            type="button"
            onClick={() => {
              setCode(null);
              mutation.reset();
            }}
          >
            Change
          </button>
        </div>
        {mutation.isError ? <AuthAlert>{safeErrorMessage(mutation.error)}</AuthAlert> : null}
        <PasswordField
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          autoFocus
          error={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register("newPassword")}
        />
        <PasswordField
          label="Type it again"
          autoComplete="new-password"
          placeholder="Same password again"
          error={passwordForm.formState.errors.confirmNewPassword?.message}
          {...passwordForm.register("confirmNewPassword")}
        />
        <AuthSubmit busy={mutation.isPending}>Save new password</AuthSubmit>
      </form>
    </AuthFrame>
  );
}
