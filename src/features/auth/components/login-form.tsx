"use client";

import { InlineError } from "@/components/ui/inline-error";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { buildVerifyOtpUrl } from "@/features/auth/lib/build-verify-otp-url";
import { ApiError } from "@/lib/api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const device = buildWebDeviceContext();
    const response = await mutation.mutateAsync({
      ...values,
      deviceName: device.deviceName,
      device,
    });

    if (response.requiresOTP) {
      router.push(buildVerifyOtpUrl(values.email, response));
      return;
    }

    router.push("/dashboard");
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
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
        label="Password"
        type="password"
        placeholder="••••••••"
        {...form.register("password")}
      />
      <Button
        className="w-full"
        isLoading={mutation.isPending}
        type="submit"
      >
        Sign in
      </Button>

      <div className="h-px border-t border-white/[0.06] my-6" />

      <div className="flex items-center justify-between text-xs text-white/50 mt-6">
        <Link
          className="transition-colors hover:text-[#e09040]"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
        <Link
          className="transition-colors hover:text-[#e09040]"
          href="/signup"
        >
          Create account
        </Link>
      </div>
    </form>
  );
}
