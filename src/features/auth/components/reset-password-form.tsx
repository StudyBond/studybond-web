"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email("Enter a valid email."),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmNewPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "Passwords must match.",
    path: ["confirmNewPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams.get("email") || "",
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    router.push("/login");
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mutation.isError ? <InlineError message={safeErrorMessage(mutation.error)} /> : null}
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
        error={form.formState.errors.otp?.message}
        inputMode="numeric"
        label="Reset code"
        maxLength={6}
        placeholder="6-digit code"
        {...form.register("otp")}
      />
      <Field
        autoComplete="new-password"
        error={form.formState.errors.newPassword?.message}
        label="New password"
        type="password"
        placeholder="At least 8 characters"
        {...form.register("newPassword")}
      />
      <Field
        autoComplete="new-password"
        error={form.formState.errors.confirmNewPassword?.message}
        label="Confirm new password"
        type="password"
        placeholder="Repeat your password"
        {...form.register("confirmNewPassword")}
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
        <Link className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]" href="/login">
          sign in
        </Link>
      </p>
    </form>
  );
}
