"use client";

import { Button } from "@/components/ui/button";
import { CourseCombobox } from "@/components/ui/course-combobox";
import { Field } from "@/components/ui/field";
import { InlineError } from "@/components/ui/inline-error";
import { useSignupMutation } from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { buildVerifyOtpUrl } from "@/features/auth/lib/build-verify-otp-url";
import { DepartmentPicker } from "@/features/institution/components/department-picker";
import { useStudentBoards } from "@/features/institution/hooks/use-student-boards";
import { ApiError } from "@/lib/api/client";
import type { StudentBoard } from "@/lib/api/institutions";
import { cn } from "@/lib/utils/cn";
import { CustomSelect } from "@/components/ui/custom-select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

/*
 * The rules that depend on the board (its score scale, and whether it asks
 * for the department) are checked in onSubmit, where the chosen board is
 * known.
 */
const schema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  institution: z.string(),
  aspiringCourse: z.string().optional(),
  department: z.enum(["SCIENCE", "ART", "COMMERCIAL"]).optional(),
  targetScore: z.string().optional(),
});

type SignupFormValues = z.infer<typeof schema>;

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

/**
 * Shown until the live list arrives, or if it cannot be loaded, so the
 * dropdown is never empty.
 */
const FALLBACK_BOARDS: StudentBoard[] = [
  {
    code: "UI",
    name: "University of Ibadan",
    slug: "ui",
    status: "OPEN",
    examName: "Post-UTME",
    targetScoreMax: 100,
    signupAsksDepartment: false,
  },
];

/**
 * The board and its exam together, e.g. "University of Ibadan Post-UTME".
 * "JAMB UTME" already names its exam, so nothing is added to it.
 */
function examTitle(board: StudentBoard) {
  const examName = board.examName?.trim();
  if (!examName || board.name.toLowerCase().includes(examName.toLowerCase())) {
    return board.name;
  }
  return `${board.name} ${examName}`;
}

function boardLabel(board: StudentBoard) {
  return board.status === "COMING_SOON"
    ? `${examTitle(board)} (Soon)`
    : examTitle(board);
}

export function SignupForm() {
  const router = useRouter();
  const mutation = useSignupMutation();
  const boardsQuery = useStudentBoards();
  const boards = boardsQuery.data?.length ? boardsQuery.data : FALLBACK_BOARDS;
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
  const selectedBoard = useWatch({ control: form.control, name: "institution" });
  const activeBoard = boards.find((board) => board.code === selectedBoard);
  const scoreMax = activeBoard?.targetScoreMax ?? 100;
  const asksDepartment = activeBoard?.signupAsksDepartment ?? false;

  /* If the chosen board is not open, move to the first one that is. */
  useEffect(() => {
    const openBoards = boards.filter((board) => board.status === "OPEN");
    if (
      openBoards.length > 0 &&
      !openBoards.some((board) => board.code === selectedBoard)
    ) {
      form.setValue("institution", openBoards[0].code);
    }
  }, [boards, selectedBoard, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const targetScore = values.targetScore
      ? Number(values.targetScore)
      : undefined;

    if (targetScore !== undefined && targetScore > scoreMax) {
      form.setError("targetScore", {
        message: `The ${activeBoard ? examTitle(activeBoard) : "exam"} is scored out of ${scoreMax}. Please enter ${scoreMax} or less.`,
      });
      return;
    }

    if (asksDepartment && !values.department) {
      form.setError("department", { message: "Choose your department." });
      return;
    }

    const device = buildWebDeviceContext();
    const response = await mutation.mutateAsync({
      email: values.email,
      fullName: values.fullName,
      password: values.password,
      institutionCode: values.institution,
      /* A board asks for one or the other, so only that one is sent. */
      aspiringCourse: asksDepartment
        ? undefined
        : values.aspiringCourse || undefined,
      department: asksDepartment ? values.department : undefined,
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
        <p
          id="institution-label"
          className="block text-xs font-medium text-white/50 tracking-wide"
        >
          Which exam are you preparing for?
        </p>
        <Controller
          control={form.control}
          name="institution"
          render={({ field }) => (
            <CustomSelect
              id="institution"
              labelledBy="institution-label"
              value={field.value}
              onValueChange={field.onChange}
              options={boards.map((board) => ({
                label: boardLabel(board),
                value: board.code,
                disabled: board.status !== "OPEN",
              }))}
            />
          )}
        />
      </div>

      {asksDepartment ? (
        <div className="space-y-1.5">
          <p
            id="department-label"
            className="block text-xs font-medium text-white/50 tracking-wide"
          >
            Your department
          </p>
          <Controller
            control={form.control}
            name="department"
            render={({ field }) => (
              <DepartmentPicker
                value={field.value}
                onChange={field.onChange}
                labelledBy="department-label"
                error={form.formState.errors.department?.message}
              />
            )}
          />
        </div>
      ) : null}

      <div className={cn("grid gap-4", !asksDepartment && "sm:grid-cols-2")}>
        {asksDepartment ? null : (
          <div className="space-y-1.5">
            <label
              htmlFor="aspiringCourse"
              className="block text-xs font-medium text-white/50 tracking-wide"
            >
              Aspiring course
            </label>
            <Controller
              control={form.control}
              name="aspiringCourse"
              render={({ field }) => (
                <CourseCombobox
                  id="aspiringCourse"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. Medicine"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/90 outline-none transition-all duration-200 placeholder:text-white/20 hover:border-white/[0.1] focus:border-[#e09040]/50 focus:ring-2 focus:ring-[#e09040]/15 focus:bg-white/[0.05]"
                />
              )}
            />
          </div>
        )}
        <Field
          id="targetScore"
          label={`Target score (out of ${scoreMax})`}
          placeholder={`e.g. ${Math.round(scoreMax * 0.75)}`}
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
