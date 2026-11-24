import Image from "next/image";
import { CheckIcon } from "./auth-fields";

/* The sign-up page's candidate slip. It fills in as the student types:
   the full slip sits in the laptop panel, a smaller one sits above the
   steps on a phone and marks the boxes the current step fills. */

export type SlipValues = {
  name: string;
  email: string;
  exam: string;
  goalLabel: string;
  goal: string;
  target: string;
  freePaper: string;
};

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Band() {
  return (
    <div className="au-slip-band">
      <span>
        <Image src="/studybond-logo.png" alt="" width={18} height={18} />
        <span>
          <b>StudyBond</b> candidate slip
        </span>
      </span>
      {/* The server and the browser may disagree at midnight; either date is fine. */}
      <span suppressHydrationWarning>{today()}</span>
    </div>
  );
}

function Value({ value, empty }: { value: string; empty: string }) {
  return value ? <b>{value}</b> : <b className="empty">{empty}</b>;
}

export function CandidateSlip({ values }: { values: SlipValues }) {
  return (
    <div className="au-side-in">
      <div className="au-slip">
        <Band />
        <div className="au-slip-main">
          <div className="au-slip-name">
            <h3 className={values.name ? undefined : "empty"}>{values.name || "Your name"}</h3>
            <p>{values.email || "Your email address"}</p>
          </div>
          <div className="au-fields">
            <div>
              <span>Exam</span>
              <Value value={values.exam} empty="Pick one" />
            </div>
            <div>
              <span>{values.goalLabel}</span>
              <Value value={values.goal} empty="Not set" />
            </div>
            <div>
              <span>Target score</span>
              <Value value={values.target} empty="Not set" />
            </div>
            <div>
              <span>Plan</span>
              <b>Free</b>
            </div>
          </div>
          <div className="au-free">
            <h4>Free with your account</h4>
            <ul>
              <li>
                <CheckIcon />
                <span>{values.freePaper}</span>
              </li>
              <li>
                <CheckIcon />
                <span>The daily challenge, every day</span>
              </li>
              <li>
                <CheckIcon />
                <span>Taster duels with other students</span>
              </li>
              <li>
                <CheckIcon />
                <span>Your streak, the league and today&apos;s words</span>
              </li>
            </ul>
          </div>
        </div>
        <span className="au-stamp" aria-hidden="true">
          Free
        </span>
      </div>
      <p className="au-hand" aria-hidden="true">
        <svg className="ic" viewBox="0 0 60 32" style={{ strokeWidth: 2.2 }}>
          <path d="M56 28C36 28 16 22 8 5" />
          <path d="M8 5l-1 10M8 5l9 5" />
        </svg>
        fills in as you type
      </p>
    </div>
  );
}

/* Phone: name, exam, goal and target, with the current step's boxes marked. */
export function MiniSlip({ values, step }: { values: SlipValues; step: 1 | 2 | 3 }) {
  return (
    <div className="au-slip mini" aria-hidden="true">
      <Band />
      <div className="au-slip-main">
        <div className={step === 3 ? "au-slip-name now" : "au-slip-name"}>
          <h3 className={values.name ? undefined : "empty"}>{values.name || "Your name"}</h3>
        </div>
        <div className="au-fields">
          <div className={step === 1 ? "now" : undefined}>
            <span>Exam</span>
            <Value value={values.exam} empty="Pick one" />
          </div>
          <div className={step === 2 ? "now" : undefined}>
            <span>{values.goalLabel}</span>
            <Value value={values.goal} empty="Not set" />
          </div>
          <div className={step === 2 ? "now" : undefined}>
            <span>Target</span>
            <Value value={values.target} empty="Not set" />
          </div>
        </div>
      </div>
      <span className="au-stamp">Free</span>
    </div>
  );
}
