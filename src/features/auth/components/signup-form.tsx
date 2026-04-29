"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { useSignupMutation } from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { buildVerifyOtpUrl } from "@/features/auth/lib/build-verify-otp-url";
import { ApiError } from "@/lib/api/client";
import { CustomSelect } from "@/components/ui/custom-select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Use at least 8 characters."),
    institution: z.string(),
    aspiringCourse: z.string().optional(),
    targetScore: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.institution === "UI" && data.targetScore) {
      const score = Number(data.targetScore);
      if (!Number.isFinite(score) || score > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "The UI post utme exam is graded over 100. Please enter a valid score.",
          path: ["targetScore"],
        });
      }
    }
  });

type SignupFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function SignupForm() {
  const router = useRouter();
  const mutation = useSignupMutation();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      institution: "UI",
      aspiringCourse: "",
      targetScore: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const device = buildWebDeviceContext();
    const targetScore = values.targetScore
      ? Number(values.targetScore)
      : undefined;
    const response = await mutation.mutateAsync({
      email: values.email,
      fullName: values.fullName,
      password: values.password,
      institutionCode: values.institution,
      aspiringCourse: values.aspiringCourse || undefined,
      targetScore: Number.isFinite(targetScore) ? targetScore : undefined,
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
      {mutation.isError ? (
        <InlineError message={safeErrorMessage(mutation.error)} />
      ) : null}
      <Field
        autoComplete="name"
        error={form.formState.errors.fullName?.message}
        label="Full name"
        placeholder="Your full name"
        {...form.register("fullName")}
      />
      <Field
        autoComplete="email"
        error={form.formState.errors.email?.message}
        label="Email address"
        type="email"
        placeholder="you@example.com"
        {...form.register("email")}
      />
      <Field
        autoComplete="new-password"
        error={form.formState.errors.password?.message}
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        {...form.register("password")}
      />

      <div className="space-y-1.5 z-10 relative">
        <label
          htmlFor="institution"
          className="block text-xs font-medium text-white/50 tracking-wide"
        >
          Target University
        </label>
        <Controller
          control={form.control}
          name="institution"
          render={({ field }) => (
            <CustomSelect
              value={field.value}
              onValueChange={field.onChange}
              options={[
                { label: "University of Ibadan (UI)", value: "UI" },
                {
                  label: "Obafemi Awolowo University (Soon)",
                  value: "OAU",
                  disabled: true,
                },
                {
                  label: "University of Lagos (Soon)",
                  value: "UNILAG",
                  disabled: true,
                },
                {
                  label: "University of Ilorin (Soon)",
                  value: "UNILORIN",
                  disabled: true,
                },
                {
                  label: "University of Benin (Soon)",
                  value: "UNIBEN",
                  disabled: true,
                },
              ]}
            />
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Aspiring course"
          placeholder="e.g. Medicine"
          {...form.register("aspiringCourse")}
        />
        <Field
          label="Target score"
          placeholder={
            form.watch("institution") === "UI" ? "e.g. 85" : "e.g. 85"
          }
          inputMode="numeric"
          error={form.formState.errors.targetScore?.message}
          {...form.register("targetScore", {
            onChange: (e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              e.target.value = value;
            },
          })}
        />
      </div>
      <Button className="w-full" isLoading={mutation.isPending} type="submit">
        Create account
      </Button>

      <p className="text-center text-xs text-white/50 mt-6">
        Already have an account?{" "}
        <Link
          className="text-[#e09040] transition-colors hover:text-[#f5c890]"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
