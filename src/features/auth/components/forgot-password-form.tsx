"use client";

import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthFrame, AuthHead } from "./auth-frame";
import { AuthAlert, AuthField, AuthSubmit } from "./auth-fields";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
});

type ForgotPasswordFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const mutation = useForgotPasswordMutation();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    router.push(`/reset-password?email=${encodeURIComponent(values.email)}` as Route);
  });

  return (
    <AuthFrame topQuestion="Remember it?" topLabel="Log in" topHref="/login">
      <AuthHead title="Forgot your password?">
        <p>Type the email on your account and we&apos;ll send you a 6-digit code to set a new one.</p>
      </AuthHead>

      <form className="au-form" onSubmit={onSubmit} noValidate>
        {mutation.isError ? <AuthAlert>{safeErrorMessage(mutation.error)}</AuthAlert> : null}
        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <AuthSubmit busy={mutation.isPending}>Send me a code</AuthSubmit>
        <p className="au-alt">
          Remember it? <Link href="/login">Log in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
