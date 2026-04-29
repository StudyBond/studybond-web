"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { useForgotPasswordMutation } from "@/features/auth/hooks/use-auth-mutations";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
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
      <Button
        className="w-full"
        isLoading={mutation.isPending}
        type="submit"
      >
        Send reset code
      </Button>

      <p className="text-center text-xs text-[var(--sb-text-secondary)]">
        Remember your password?{" "}
        <Link className="text-[var(--sb-accent)] transition-colors hover:text-[var(--sb-accent-hover)]" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
