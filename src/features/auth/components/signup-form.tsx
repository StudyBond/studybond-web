"use client";

import { CourseCombobox } from "@/components/ui/course-combobox";
import { useSignupMutation } from "@/features/auth/hooks/use-auth-mutations";
import { buildWebDeviceContext } from "@/features/auth/lib/device-context";
import { buildVerifyOtpUrl } from "@/features/auth/lib/build-verify-otp-url";
import { safeNext } from "@/features/auth/lib/safe-next";
import { DEPARTMENTS } from "@/features/institution/components/department-picker";
import { useStudentBoards } from "@/features/institution/hooks/use-student-boards";
import { ApiError } from "@/lib/api/client";
import type { StudentBoard } from "@/lib/api/institutions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AuthFrame, AuthHead } from "./auth-frame";
import { ArrowIcon, AuthAlert, AuthField, AuthSubmit, CheckIcon, PasswordField } from "./auth-fields";
import { CandidateSlip, MiniSlip, type SlipValues } from "./candidate-slip";

/*
 * The rules that depend on the board (its score scale, and whether it asks
 * for the department) are checked in checkGoal, where the chosen board is
 * known.
 *
 * Layout (auth.css): on a laptop every field shows at once beside the full
 * candidate slip. On a phone the same form is three short steps (exam, goal,
 * account) under a small slip; only the step's fields show, and Next checks
 * that step before moving on.
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
type Step = 1 | 2 | 3;

const STEP_NAMES: Record<Step, string> = { 1: "Your exam", 2: "Your goal", 3: "Your account" };

function safeErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

/**
 * Shown until the live list arrives, or if it cannot be loaded, so there is
 * always an exam to pick.
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

/* The short name on an exam slip: "JAMB UTME", "UI Post-UTME". */
function shortTitle(board: StudentBoard) {
  const examName = board.examName?.trim();
  if (!examName || board.name.toLowerCase().includes(examName.toLowerCase())) {
    return board.name;
  }
  return `${board.code} ${examName}`;
}

/* "Scored out of 400", or "University of Ibadan, scored out of 100" when the short name hides the school. */
function examNote(board: StudentBoard) {
  return board.name === shortTitle(board)
    ? `Scored out of ${board.targetScoreMax}`
    : `${board.name}, scored out of ${board.targetScoreMax}`;
}

/* "Coming soon: OAU, UNIBEN, UNILORIN and UNILAG Post-UTME." Each name is
   kept whole so "Post-UTME" never breaks at its hyphen on a phone. */
function ComingSoon({ boards }: { boards: StudentBoard[] }) {
  const soon = boards.filter((board) => board.status === "COMING_SOON");
  if (soon.length === 0) return null;
  const exams = new Set(soon.map((board) => board.examName?.trim() ?? ""));
  const [onlyExam] = [...exams];
  const sharedExam = exams.size === 1 && onlyExam ? onlyExam : null;
  const names = soon.map((board) => (sharedExam ? board.code : shortTitle(board)));
  return (
    <p className="au-soon">
      Coming soon:{" "}
      {names.map((name, i) => (
        <span key={name}>
          {i > 0 ? (i === names.length - 1 ? " and " : ", ") : null}
          <span style={{ whiteSpace: "nowrap" }}>
            {name}
            {sharedExam && i === names.length - 1 ? ` ${sharedExam}` : null}
          </span>
        </span>
      ))}
      .
    </p>
  );
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  /* A duel invite link opens signup on the host's board, so the two can play. */
  const linkedBoard = searchParams.get("board")?.trim().toUpperCase() || null;
  const mutation = useSignupMutation();
  const boardsQuery = useStudentBoards();
  const boards = boardsQuery.data?.length ? boardsQuery.data : FALLBACK_BOARDS;
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      institution: linkedBoard ?? "UI",
      aspiringCourse: "",
      targetScore: "",
    },
  });
  const [step, setStep] = useState<Step>(1);
  const movedByStudent = useRef(false);
  const nextButton = useRef<HTMLButtonElement>(null);
  const stepBoxes = { 1: useRef<HTMLDivElement>(null), 2: useRef<HTMLDivElement>(null), 3: useRef<HTMLDivElement>(null) };

  const [selectedBoard, fullName, email, department, aspiringCourse, targetScore] = useWatch({
    control: form.control,
    name: ["institution", "fullName", "email", "department", "aspiringCourse", "targetScore"],
  });
  const activeBoard = boards.find((board) => board.code === selectedBoard);
  const scoreMax = activeBoard?.targetScoreMax ?? 100;
  const asksDepartment = activeBoard?.signupAsksDepartment ?? false;
  const openBoards = boards.filter((board) => board.status === "OPEN");
  const errors = form.formState.errors;

  /* If the chosen board is not open, move to the first one that is.
     Wait for the real board list first: the fallback list only knows UI, so
     checking it would move a ?board=JAMB link to UI before the list arrives,
     and UI would then stick. */
  const boardsSettled = boardsQuery.isSuccess || boardsQuery.isError;
  useEffect(() => {
    if (!boardsSettled) return;
    const open = boards.filter((board) => board.status === "OPEN");
    if (open.length > 0 && !open.some((board) => board.code === selectedBoard)) {
      form.setValue("institution", open[0].code);
    }
  }, [boardsSettled, boards, selectedBoard, form]);

  /* After Next or Back, put the keyboard on the new step's first field. */
  useEffect(() => {
    if (!movedByStudent.current) return;
    movedByStudent.current = false;
    stepBoxes[step].current?.querySelector<HTMLElement>("input, button")?.focus();
    // stepBoxes is rebuilt each render but always points at the same three boxes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const moveTo = (target: Step) => {
    movedByStudent.current = true;
    setStep(target);
  };

  /* Department and target score: checked on Next (phone) and on submit. */
  function checkGoal(values: Pick<SignupFormValues, "department" | "targetScore">) {
    form.clearErrors(["department", "targetScore"]);
    let ok = true;
    if (asksDepartment && !values.department) {
      form.setError("department", { message: "Choose your department." });
      ok = false;
    }
    const target = values.targetScore ? Number(values.targetScore) : undefined;
    if (target !== undefined && target > scoreMax) {
      form.setError("targetScore", {
        message: `The ${activeBoard ? examTitle(activeBoard) : "exam"} is scored out of ${scoreMax}. Please enter ${scoreMax} or less.`,
      });
      ok = false;
    }
    return ok;
  }

  function goNext() {
    if (step === 2 && !checkGoal(form.getValues())) return;
    if (step < 3) moveTo((step + 1) as Step);
  }

  const submit = form.handleSubmit(
    async (values) => {
      if (!checkGoal(values)) {
        setStep(2);
        return;
      }
      const target = values.targetScore ? Number(values.targetScore) : undefined;
      const device = buildWebDeviceContext();
      const response = await mutation.mutateAsync({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        institutionCode: values.institution,
        /* A board asks for one or the other, so only that one is sent. */
        aspiringCourse: asksDepartment ? undefined : values.aspiringCourse || undefined,
        department: asksDepartment ? values.department : undefined,
        targetScore: Number.isFinite(target) ? target : undefined,
        deviceName: device.deviceName,
        device,
      });

      if (response.requiresOTP) {
        router.push(buildVerifyOtpUrl(values.email, response, next));
        return;
      }

      router.push(safeNext(next));
    },
    /* Only the account fields can fail the schema, and they are on step 3.
       react-hook-form puts the keyboard on the first wrong field itself. */
    () => setStep(3),
  );

  /* On a phone, Enter on steps 1 and 2 means Next, not "create the account". */
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const phoneSteps = nextButton.current !== null && nextButton.current.offsetParent !== null;
    if (phoneSteps && step < 3) {
      event.preventDefault();
      goNext();
      return;
    }
    void submit(event);
  };

  const shortExam = activeBoard ? shortTitle(activeBoard) : "";
  const departmentLabel = DEPARTMENTS.find((item) => item.value === department)?.label ?? "";
  const slip: SlipValues = {
    name: fullName.trim(),
    email: email.trim(),
    exam: shortExam,
    goalLabel: asksDepartment ? "Department" : "Course",
    goal: asksDepartment ? departmentLabel : (aspiringCourse ?? "").trim(),
    target: targetScore ? `${targetScore} / ${scoreMax}` : "",
    freePaper: shortExam
      ? `One full ${shortExam} paper, with up to 3 tries`
      : "One full paper for your exam, with up to 3 tries",
  };
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const stepClass = (n: Step) => (step === n ? "au-step on" : "au-step");

  return (
    <AuthFrame
      topQuestion="Already have an account?"
      topLabel="Log in"
      topHref={loginHref}
      side={<CandidateSlip values={slip} />}
      sideLabel="Your StudyBond slip"
    >
      <AuthHead title="Create your free account">
        <p className={step > 1 ? "au-lead later" : "au-lead"}>
          Pick your exam and we&apos;ll set StudyBond up for it. You can switch exams later.
        </p>
      </AuthHead>

      <MiniSlip values={slip} step={step} />

      <div className="au-progress">
        <div className="au-bars" aria-hidden="true">
          <i className="on" />
          <i className={step >= 2 ? "on" : undefined} />
          <i className={step >= 3 ? "on" : undefined} />
        </div>
        <p aria-live="polite">
          <b>Step {step} of 3</b> · {STEP_NAMES[step]}
        </p>
      </div>

      <form className="au-form" onSubmit={onSubmit} noValidate>
        {mutation.isError ? <AuthAlert>{safeErrorMessage(mutation.error)}</AuthAlert> : null}

        <div className={stepClass(1)} ref={stepBoxes[1]}>
          <fieldset className="au-field">
            <legend className="au-label" style={{ marginBottom: 7 }}>
              Which exam are you writing?
            </legend>
            {boardsSettled ? (
              <div className="au-exams">
                {openBoards.map((board) => {
                  const on = board.code === selectedBoard;
                  return (
                    <label key={board.code} className={on ? "au-exam on" : "au-exam"}>
                      <input
                        className="sr"
                        type="radio"
                        name="institution"
                        value={board.code}
                        checked={on}
                        onChange={() => form.setValue("institution", board.code, { shouldDirty: true })}
                      />
                      <span className="au-tick" aria-hidden="true">
                        <CheckIcon />
                      </span>
                      <b>{shortTitle(board)}</b>
                      <small>{examNote(board)}</small>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="au-exams" aria-busy="true" aria-label="Loading exams">
                <div className="au-exam skel" />
                <div className="au-exam skel" />
              </div>
            )}
            <ComingSoon boards={boards} />
          </fieldset>
        </div>

        <div className={stepClass(2)} ref={stepBoxes[2]}>
          {asksDepartment ? (
            <>
              <fieldset className="au-field" aria-describedby={errors.department ? "department-error" : undefined}>
                <legend className="au-label" style={{ marginBottom: 7 }}>
                  Your department
                </legend>
                <div className={errors.department ? "au-seg bad" : "au-seg"}>
                  {DEPARTMENTS.map((item) => {
                    const on = department === item.value;
                    return (
                      <label key={item.value} className={on ? "on" : undefined}>
                        <input
                          className="sr"
                          type="radio"
                          name="department"
                          value={item.value}
                          checked={on}
                          onChange={() => {
                            form.setValue("department", item.value, { shouldDirty: true });
                            form.clearErrors("department");
                          }}
                        />
                        {item.label}
                      </label>
                    );
                  })}
                </div>
                {errors.department ? (
                  <p className="au-err" id="department-error">
                    {errors.department.message}
                  </p>
                ) : null}
              </fieldset>
              <AuthField
                id="targetScore"
                label={`Target score (out of ${scoreMax})`}
                placeholder={`e.g. ${Math.round(scoreMax * 0.75)}`}
                inputMode="numeric"
                error={errors.targetScore?.message}
                {...form.register("targetScore", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/[^0-9]/g, "");
                  },
                })}
              />
            </>
          ) : (
            <div className="au-pair">
              <div className="au-field">
                <div className="au-label">
                  <label htmlFor="aspiringCourse">Course you want</label>
                </div>
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
                      className="au-input"
                    />
                  )}
                />
              </div>
              <AuthField
                id="targetScore"
                label={`Target score (out of ${scoreMax})`}
                placeholder={`e.g. ${Math.round(scoreMax * 0.75)}`}
                inputMode="numeric"
                error={errors.targetScore?.message}
                {...form.register("targetScore", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/[^0-9]/g, "");
                  },
                })}
              />
            </div>
          )}
        </div>

        <div className={stepClass(3)} ref={stepBoxes[3]}>
          <AuthField
            label="Full name"
            autoComplete="name"
            placeholder="Your full name"
            error={errors.fullName?.message}
            {...form.register("fullName")}
          />
          <AuthField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            hint="We'll send a 6-digit code here to check it's yours."
            error={errors.email?.message}
            {...form.register("email")}
          />
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...form.register("password")}
          />
        </div>

        <div className="au-nav">
          <button
            type="button"
            className={step > 1 ? "au-btn au-btn-s au-back on" : "au-btn au-btn-s au-back"}
            onClick={() => moveTo(Math.max(1, step - 1) as Step)}
          >
            Back
          </button>
          <button
            ref={nextButton}
            type="button"
            className={step < 3 ? "au-btn au-next on" : "au-btn au-next"}
            onClick={goNext}
          >
            Next
            <ArrowIcon />
          </button>
          <AuthSubmit busy={mutation.isPending} className={step === 3 ? "au-create on" : "au-create"}>
            Create account
          </AuthSubmit>
        </div>
      </form>
    </AuthFrame>
  );
}
