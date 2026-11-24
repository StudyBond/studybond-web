"use client";

import { useEffect, useState } from "react";

/* One real UTME question (English, 1979) on a drawing of the real exam
   screen: four paper tabs, one clock, the question ribbon with its pace
   tick. Pick an answer, submit, and the review shows StudyBond's
   explanation. Nothing is sent anywhere; it all happens on this page. */

const OPTIONS = [
  ["A", "incredulous"],
  ["B", "credible"],
  ["C", "incredible"],
  ["D", "credulous"],
  ["E", "ridiculous"],
] as const;
const ANSWER = "C";
const START_SECONDS = 4904; // 1:21:44 left of a 2-hour UTME

const SKIPPED = [7, 19, 26];
const CURRENT = 34;
const PACE = 33;
const RIBBON = [1, 2, 3, 4, 5, 6].map((group) => ({
  label: `${group * 10 - 9}–${group * 10}`,
  now: group === 4,
  cells: Array.from({ length: 10 }, (_, i) => {
    const n = (group - 1) * 10 + i + 1;
    let cls = "cell";
    if (n === CURRENT) cls = "cell cur";
    else if (n < CURRENT && !SKIPPED.includes(n)) cls = "cell done";
    if (n === PACE) cls += " pace";
    return { n, cls };
  }),
}));

const TABS = [
  { name: "English", color: "#fb7185", done: 33, of: 60, fill: "63%", mins: "38 min", current: true },
  { name: "Physics", color: "#a78bfa", done: 12, of: 40, fill: "35%", mins: "14 min" },
  { name: "Chemistry", color: "#2dd4bf", done: 0, of: 40, fill: null, mins: "0 min" },
  { name: "Biology", color: "#4ade80", done: 0, of: 40, fill: null, mins: "0 min" },
];

function clockText(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function Arrow({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 64 30">
      <path className="ic" d={d} />
    </svg>
  );
}

export function DemoQuestion() {
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [secs, setSecs] = useState(START_SECONDS);

  useEffect(() => {
    if (submitted) return;
    const id = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  return (
    <section className="sec" id="demo">
      <div className="wrap">
        <div className="sec-h">
          <h2>Sit one real question.</h2>
          <p>
            This is the exam screen you&apos;ll write on: four papers, one clock. Pick an answer, submit it, and see how
            StudyBond explains it.
          </p>
        </div>
        <div className="demo">
          <div className="mnotes l" aria-hidden="true">
            <div className="mnote">
              each subject is its own paper
              <Arrow d="M4 8c16-6 34-4 50 12M46 21l8-1-2-8" />
            </div>
            <div className="mnote">
              this tick tells you if you&apos;re on pace
              <Arrow d="M4 6c18 2 34 8 50 18M45 25l9-1-3-8" />
            </div>
          </div>

          <div className="screen">
            <div className="rail">
              <div className="tabs">
                {TABS.map((tab) => (
                  <div key={tab.name} className={tab.current ? "tab cur" : "tab"}>
                    <div className="tab-t">
                      <span>
                        <i className="dot" style={{ background: tab.color }} />
                        {tab.name}
                      </span>
                      <em>
                        <b>{tab.done}</b>/{tab.of}
                      </em>
                    </div>
                    <div className="bar">
                      {tab.fill ? <s style={{ width: tab.fill }} /> : null}
                      <u style={{ left: "67%" }} />
                    </div>
                    <div className="tab-m">{tab.mins}</div>
                  </div>
                ))}
              </div>
              <div className="pchips">
                <span className="pchip cur">
                  <i className="dot" style={{ background: "#fb7185" }} />
                  Eng 33/60
                </span>
                <span className="pchip">
                  <i className="dot" style={{ background: "#a78bfa" }} />
                  Phy 12/40
                </span>
                <span className="pchip">
                  <i className="dot" style={{ background: "#2dd4bf" }} />
                  Chm 0
                </span>
              </div>
              <div className="clock" aria-label="Time left">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {clockText(secs)}
              </div>
            </div>

            <div className="qa">
              {submitted ? (
                <p className="qa-h">
                  Answer review · <b>English</b>, question 34 · UTME 1979
                </p>
              ) : (
                <p className="qa-h">
                  <b>English</b> · Question 34 of 60 · UTME 1979
                </p>
              )}
              <p className="qa-inst">Choose the option nearest in meaning to the underlined words.</p>
              <p className="qa-stem">
                The story told by the suspect was <u>difficult to believe</u>.
              </p>

              <div className="xopts" role="group" aria-label="Options">
                {OPTIONS.map(([key, text]) => {
                  let cls = "xopt";
                  let tag: string | null = null;
                  let mark: "good" | "bad" | null = null;
                  if (!submitted) {
                    if (picked === key) cls = "xopt sel";
                  } else if (key === ANSWER) {
                    cls = "xopt good";
                    tag = picked === ANSWER ? "Your answer" : "Correct";
                    mark = "good";
                  } else if (key === picked) {
                    cls = "xopt bad";
                    tag = "Your answer";
                    mark = "bad";
                  } else {
                    cls = "xopt dim";
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cls}
                      aria-pressed={picked === key}
                      onClick={() => {
                        if (!submitted) setPicked(key);
                      }}
                    >
                      <b>{key}</b>
                      {text}
                      {tag ? (
                        <em>
                          {mark === "good" ? (
                            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          ) : null}
                          {mark === "bad" ? (
                            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          ) : null}
                          {tag}
                        </em>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {!submitted ? (
                <div className="qa-go">
                  <span>{picked ? `Option ${picked} picked. Submit when you are sure.` : "Pick an answer, then submit."}</span>
                  <button type="button" className="btn btn-p btn-sm" disabled={!picked} onClick={() => setSubmitted(true)}>
                    Submit
                  </button>
                </div>
              ) : (
                <div className="ex" aria-live="polite">
                  <h3>{picked === ANSWER ? "Right. Here is why it works." : "Not this time. Here is the trap."}</h3>
                  <p className="ex-ans">The answer is C, incredible.</p>
                  <p>
                    Something difficult to believe is <strong>incredible</strong>: in- (not) + credible (believable). So
                    the suspect&apos;s story was incredible, which is option C.
                  </p>
                  <p>This question sets a famous trap with two pairs of look-alikes. Learn them as a set:</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Word</th>
                        <th>Describes</th>
                        <th>Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>credible</td>
                        <td>a story</td>
                        <td>believable</td>
                      </tr>
                      <tr>
                        <td>incredible</td>
                        <td>a story</td>
                        <td>unbelievable</td>
                      </tr>
                      <tr>
                        <td>credulous</td>
                        <td>a person</td>
                        <td>believes things too easily</td>
                      </tr>
                      <tr>
                        <td>incredulous</td>
                        <td>a person</td>
                        <td>unable to believe something</td>
                      </tr>
                    </tbody>
                  </table>
                  <p>
                    <strong>Incredulous</strong> (A) is the main trap. It describes the listener who cannot believe the
                    story, not the story itself.
                  </p>
                  <button
                    type="button"
                    className="again"
                    onClick={() => {
                      setSubmitted(false);
                      setPicked(null);
                    }}
                  >
                    Try it again
                  </button>
                </div>
              )}
            </div>

            <div className="ribbon">
              <div className="rgs">
                {RIBBON.map((group) => (
                  <span key={group.label} className={group.now ? "rg now" : "rg"}>
                    {group.cells.map((cell) => (
                      <i key={cell.n} className={cell.cls} />
                    ))}
                    <small>{group.label}</small>
                  </span>
                ))}
              </div>
              <span className="pace-note">on pace</span>
            </div>
          </div>

          <div className="mnotes" aria-hidden="true">
            <div className="mnote">
              one clock for all four papers
              <Arrow d="M60 8c-16-6-34-4-50 12M18 21l-8-1 2-8" />
            </div>
            <div className="mnote">
              network gone? your answers stay saved
              <Arrow d="M60 6c-18 2-34 8-50 18M19 25l-9-1 3-8" />
            </div>
          </div>
          <ul className="mnotes-ph" aria-label="About the exam screen">
            <li>each subject is its own paper</li>
            <li>one clock for all four papers</li>
            <li>a tick tells you if you&apos;re on pace</li>
            <li>network gone? your answers stay saved</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
