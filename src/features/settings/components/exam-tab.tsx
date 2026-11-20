"use client";

import { TextSizePicker } from "@/features/exam/components/text-size-picker";
import { useExamPrefs, useSyncExamPrefs } from "@/features/exam/stores/exam-prefs-store";
import { FLAT_COLOUR } from "@/features/exam/lib/papers";
import { textScale } from "@/features/exam/lib/text-size";
import { cn } from "@/lib/utils/cn";

const PAPERS = [
  { name: "English", colour: "#fb7185" },
  { name: "Biology", colour: "#4ade80" },
  { name: "Chemistry", colour: "#2dd4bf" },
  { name: "Physics", colour: "#a78bfa" },
];

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-150",
        on ? "bg-[#e09040]" : "bg-white/[0.12]",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] h-4 w-4 rounded-full transition-transform duration-150",
          on ? "translate-x-[18px] bg-[#0a0a0a]" : "bg-white/60",
        )}
      />
    </button>
  );
}

function Row({ title, body, children }: { title: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="mt-1 text-[12.5px] leading-relaxed text-white/45">{body}</div>
      </div>
      <div className="pt-0.5">{children}</div>
    </div>
  );
}

/**
 * Exam preferences. These are set here, not in the exam: anything to fiddle
 * with is a distraction during a timed paper. Auto-advance can still be
 * flipped from the exam's ... menu for one sitting.
 */
export function ExamTab() {
  useSyncExamPrefs();
  const paperColour = useExamPrefs((p) => p.paperColour);
  const autoAdvance = useExamPrefs((p) => p.autoAdvance);
  const setPaperColour = useExamPrefs((p) => p.setPaperColour);
  const setAutoAdvance = useExamPrefs((p) => p.setAutoAdvance);
  const textSize = useExamPrefs((p) => p.textSize);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-bold text-white">Exam</h2>
        <p className="text-[13px] text-white/30">How the exam screen looks and moves</p>
      </div>

      <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <Row
          title="Paper colour"
          body={
            <>
              <p>Each paper gets its own colour on the tabs, your chosen answer and the question ruler.</p>
              <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5" aria-hidden="true">
                {PAPERS.map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1.5 text-[12px] text-white/55">
                    <i className="h-1.5 w-1.5 rounded-full" style={{ background: paperColour ? p.colour : FLAT_COLOUR }} />
                    {p.name}
                  </span>
                ))}
              </div>
              {!paperColour ? <p className="mt-2">Off: every paper uses amber.</p> : null}
            </>
          }
        >
          <Switch on={paperColour} onChange={setPaperColour} label="Paper colour" />
        </Row>

        <Row
          title="Auto-advance"
          body="Go to the next question as soon as you choose an answer. You can also switch this for one exam from its ... menu."
        >
          <Switch on={autoAdvance} onChange={setAutoAdvance} label="Auto-advance" />
        </Row>

        <div className="px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Text size</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/45">
                Makes the questions, options and explanations bigger in exams, the review and Study Mode. You can also
                change it from the exam&apos;s ... menu.
              </p>
            </div>
            <TextSizePicker />
          </div>
          <p
            className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 leading-relaxed text-white/80"
            style={{ fontSize: `${16 * textScale(textSize)}px` }}
          >
            This is how big questions and explanations will look.
          </p>
        </div>
      </div>

      <p className="text-[12px] text-white/30">Saved to your account, so your other devices use it too.</p>
    </div>
  );
}
