/* The homepage sections that never change while you look at them: each exam
   kept on its own, Duel, the League, the report card and the daily habits.
   Server-rendered, so search engines and AI tools read all of it as plain
   HTML. Ported from the approved Design canvas (round 5). Example people and
   numbers are drawings of the real screens, never live data. */

export function LandingSections() {
  return (
    <>
      {/* Your exam. Nothing else. */}
      <section className="sec" id="exams">
      <div className="wrap">
      <div className="sec-h">
      <h2>Your exam. Nothing else.</h2>
      <p>Most practice sites pour every exam into one big pile. One rule runs through StudyBond: questions stay with their exam. Pick JAMB and everything you see is JAMB: its questions, its timing, its league. Pick the UI Post-UTME and it&apos;s all UI. <b>A UI candidate never meets a JAMB question dressed up as Post-UTME.</b></p>
      </div>
      <div className="worlds">
      <article className="slip">
      <div className="slip-band"><b>JAMB UTME candidates only</b><span className="seal"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>Kept apart</span></div>
      <div className="slip-main">
      <h3>JAMB UTME<small>Unified Tertiary Matriculation Examination</small></h3>
      <div className="fields">
      <div className="field"><span>Papers</span><b>4</b></div>
      <div className="field"><span>Questions</span><b>180</b></div>
      <div className="field"><span>Time</span><b>2 hours</b></div>
      <div className="field"><span>Marked out of</span><b>400</b></div>
      </div>
      <p className="subj"><b>Use of English</b> plus any three of Physics, Chemistry, Biology, Mathematics, Government, Christian Religious Studies and Economics.</p>
      <p className="pledge"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span>Your JAMB past-question papers hold only real UTME questions. Never a Post-UTME one.</span></p>
      <a className="btn btn-p" href="/signup?board=JAMB">Practise for JAMB</a>
      </div>
      </article>
      <p className="never">never mixed</p>
      <article className="slip">
      <div className="slip-band"><b>UI Post-UTME candidates only</b><span className="seal"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>Kept apart</span></div>
      <div className="slip-main">
      <h3>UI Post-UTME<small>University of Ibadan screening exam</small></h3>
      <div className="fields">
      <div className="field"><span>Papers</span><b>4</b></div>
      <div className="field"><span>Questions</span><b>100</b></div>
      <div className="field"><span>Time</span><b>90 min</b></div>
      <div className="field"><span>Marked out of</span><b>100</b></div>
      </div>
      <p className="subj"><b>English</b> plus your science subjects from Physics, Chemistry, Biology and Mathematics.</p>
      <p className="pledge"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span>Your UI past-question papers hold only questions from UI&apos;s own screening exams. Never a JAMB one.</span></p>
      <a className="btn btn-s" href="/signup?board=UI">Practise for UI</a>
      </div>
      </article>
      </div>
      <p className="both"><b>Writing both?</b> Switch exams the way you&apos;d switch accounts. Your daily streak comes along. Everything else stays with its own exam, and premium is paid for each exam on its own.</p>
      </div>
      </section>

      {/* Duel */}
      <section className="sec" id="duel">
      <div className="wrap">
      <div className="sec-h">
      <h2>Duel. The Bond in StudyBond.</h2>
      <p>A duel is a live practice race between you and another student. You both get the same real questions and the same clock. You can see which question the other person is on, and whoever gets more marks wins. It&apos;s the feature StudyBond is named after.</p>
      </div>
      <div className="steps">
      <div className="step">
      <div className="step-obj">
      <div className="dslip" aria-label="A duel slip">
      <div className="ds-h"><b>Study<span>Bond</span></b><span>Duel slip</span></div>
      <div className="ds-from">
      <svg className="av" viewBox="0 0 40 40" aria-hidden="true"><circle className="bg" cx="20" cy="20" r="20"></circle><path className="tp" d="M7 38c2-8 7-11 13-11s11 3 13 11z"></path><circle className="hd" cx="20" cy="17" r="7.5"></circle><path className="hr" d="M12.5 15.5c0-5 3.5-7.5 7.5-7.5s7.5 2.5 7.5 7.5c-2-2.5-5-3.5-7.5-3.5s-5.5 1-7.5 3.5z"></path></svg>
      <div><b>Tobi A.</b><small>Medicine · #6 this week</small></div>
      </div>
      <dl className="ds-dl">
      <dt>Paper</dt><dd>JAMB · Real past questions</dd>
      <dt>Subjects</dt><dd>Physics, Chemistry</dd>
      <dt>Length</dt><dd>80 questions · 60 min</dd>
      </dl>
      <div className="ds-tear"></div>
      <div className="ds-code"><b>R2B 7KD</b><span>Expires in 23:41:10</span></div>
      </div>
      </div>
      <div className="step-t"><i>1</i><h3>Send a slip</h3><p>Pick the subjects and send your slip to a friend on WhatsApp, as a link or a code. They see who sent it and what&apos;s on the paper before they accept.</p></div>
      </div>
      <div className="step">
      <div className="step-obj">
      <div className="race" aria-label="The live race during a duel">
      <div className="race-top"><span>Question you&apos;re each on</span><span>Physics</span></div>
      <div className="lane you"><span>You</span><div className="track"><s style={{ width: "39%", background: "#c17a28" }}></s><div className="runner" style={{ left: "39%" }}><svg className="av" viewBox="0 0 40 40" aria-hidden="true"><circle className="bg" cx="20" cy="20" r="20"></circle><path className="tp" d="M7 38c2-8 7-11 13-11s11 3 13 11z"></path><circle className="hd" cx="20" cy="17" r="7.5"></circle><path className="hr" d="M12.5 15.5c0-5 3.5-7.5 7.5-7.5s7.5 2.5 7.5 7.5c-2-2.5-5-3.5-7.5-3.5s-5.5 1-7.5 3.5z"></path></svg></div></div><em>Q31</em></div>
      <div className="lane riv"><span>Ada</span><div className="track"><s style={{ width: "41%", background: "#3b82f6" }}></s><div className="runner" style={{ left: "41%" }}><span className="say">Oya!</span><svg className="av riv" viewBox="0 0 40 40" aria-hidden="true"><circle className="bg" cx="20" cy="20" r="20"></circle><path className="tp" d="M7 38c2-8 7-11 13-11s11 3 13 11z"></path><circle className="hd" cx="20" cy="17" r="7.5"></circle><path className="hr" d="M11.5 18c0-7 4-10 8.5-10s8.5 3 8.5 10c-1.5-3-4-5.5-8.5-5.5s-7 2.5-8.5 5.5z"></path></svg></div></div><em>Q33</em></div>
      <p className="coach">Ada is 2 questions ahead. Speed doesn&apos;t win a duel. Marks do.</p>
      <div className="reacts" aria-label="Reactions you can send"><span>Omo!</span><span>No shaking</span><span>Oya!</span><span>Chai!</span><span>Sharp!</span><span>Calm down</span></div>
      </div>
      </div>
      <div className="step-t"><i>2</i><h3>Race live</h3><p>Same questions, same clock. Watch the question your friend is on and send a reaction. Rushing doesn&apos;t help: the one with more marks wins.</p></div>
      </div>
      <div className="step">
      <div className="step-obj">
      <div className="result" aria-label="A duel result">
      <span className="stamp">WON</span>
      <div className="res-score">
      <div className="res-side you"><span><svg className="av" viewBox="0 0 40 40" aria-hidden="true" style={{ width: "26px", height: "26px" }}><circle className="bg" cx="20" cy="20" r="20"></circle><path className="tp" d="M7 38c2-8 7-11 13-11s11 3 13 11z"></path><circle className="hd" cx="20" cy="17" r="7.5"></circle><path className="hr" d="M12.5 15.5c0-5 3.5-7.5 7.5-7.5s7.5 2.5 7.5 7.5c-2-2.5-5-3.5-7.5-3.5s-5.5 1-7.5 3.5z"></path></svg>You</span><b>57</b></div>
      <span className="res-dash">–</span>
      <div className="res-side riv"><span>Ada<svg className="av riv" viewBox="0 0 40 40" aria-hidden="true" style={{ width: "26px", height: "26px" }}><circle className="bg" cx="20" cy="20" r="20"></circle><path className="tp" d="M7 38c2-8 7-11 13-11s11 3 13 11z"></path><circle className="hd" cx="20" cy="17" r="7.5"></circle><path className="hr" d="M11.5 18c0-7 4-10 8.5-10s8.5 3 8.5 10c-1.5-3-4-5.5-8.5-5.5s-7 2.5-8.5 5.5z"></path></svg></span><b>55</b></div>
      </div>
      <div className="tug"><s style={{ left: "44%", width: "6%", background: "#c17a28" }}></s><u></u></div>
      <div className="tug-l"><span>You</span><span>Ada</span></div>
      <div className="marks">
      <div className="mk"><span>Physics</span><b className="y">31</b><i>–</i><b className="r">28</b></div>
      <div className="mk"><span>Chemistry</span><b className="y">26</b><i>–</i><b className="r">27</b></div>
      <div className="mk tot"><span>Total</span><b className="y">57</b><i>–</i><b className="r">55</b></div>
      </div>
      </div>
      </div>
      <div className="step-t"><i>3</i><h3>Marked subject by subject</h3><p>The marks come in one subject at a time, so you watch the lead swing. Then go through every answer with its explanation, and send a rematch.</p></div>
      </div>
      </div>
      <div className="ways">
      <div className="way"><h3>Challenge a friend</h3><p>Send your slip to anyone in your class, your tutorial or your WhatsApp group.</p></div>
      <div className="way"><h3>Find a challenger</h3><p>No friend online? We match you with another student writing the same exam, right now.</p></div>
      <div className="way"><h3>Race a ghost</h3><p>Race a real student&apos;s earlier run, replayed answer by answer, at any hour of the day.</p></div>
      </div>
      <div className="free-duel"><span><b>Free accounts play taster duels:</b> one subject, 15 questions. Full-paper duels come with premium.</span></div>
      </div>
      </section>

      {/* League */}
      <section className="sec">
      <div className="wrap">
      <div className="two">
      <div className="sec-h" style={{ marginBottom: "0" }}>
      <h2>You&apos;re not studying alone.</h2>
      <p>Each exam is its own league. JAMB candidates play only in the JAMB League, UI candidates only in the UI League. Papers, the daily challenge and duels all earn points, and a new week starts every Sunday at 11:59 pm. Finish the week in the Top 10 and your name and avatar stay up all of next week.</p>
      </div>
      <div className="board">
      <div className="bd-h"><b>JAMB League</b><span>This week</span></div>
      <div className="mr"><span className="rk">1</span><span>Chiamaka O.</span><span className="sp">2,480<small>SP</small></span></div>
      <div className="mr"><span className="rk">2</span><span>Ibrahim S.</span><span className="sp">2,365<small>SP</small></span></div>
      <div className="mr"><span className="rk">3</span><span>Funmilayo A.</span><span className="sp">2,210<small>SP</small></span></div>
      <div className="gap">…</div>
      <div className="mr"><span className="rk">9</span><span>Tunde B.</span><span className="sp">1,690<small>SP</small></span></div>
      <div className="mr"><span className="rk">10</span><span>Kunle A.</span><span className="sp">1,640<small>SP</small></span></div>
      <div className="cutline">Top 10</div>
      <div className="mr"><span className="rk">13</span><span>Zainab M.</span><span className="sp">1,450<small>SP</small></span></div>
      <div className="mr me"><span className="rk">14</span><span>You</span><span className="sp">1,395<small>SP</small></span></div>
      <div className="bd-f">245 SP behind Kunle at number 10. The list closes on Sunday at 11:59 pm.</div>
      </div>
      </div>
      </div>
      </section>

      {/* Report card */}
      <section className="sec">
      <div className="wrap">
      <div className="two">
      <div>
      <div className="sec-h" style={{ marginBottom: "0" }}>
      <h2>Know where you stand after every paper.</h2>
      <p>Your report card fills in as you practise. Each subject gets its average over your last 10 papers, a WAEC-style grade, and an arrow for which way you&apos;re heading.</p>
      </div>
      <ul className="ticks">
      <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span><b>Every answer explained.</b> Step by step, like a good tutor sitting next to you.</span></li>
      <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span><b>Your weak topics, early.</b> See what needs work while there&apos;s still time to fix it.</span></li>
      <li><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span><b>Facts, not guesses.</b> We show what you actually scored in practice, never a made-up prediction.</span></li>
      </ul>
      </div>
      <div>
      <div className="report" aria-label="Example report card">
      <div className="rp-h"><b>Report card</b><span>Last 10 papers</span></div>
      <div className="rp-cols"><span></span><span>Subject</span><span>Average</span><span>Grade</span><span>Trend</span></div>
      <div className="rp-row"><i className="dot" style={{ width: "10px", height: "10px", background: "#fb7185" }}></i><b>English<small>10 papers</small></b><span className="avg">64%</span><span className="grade gC">C4</span><span className="trend up">+4</span></div>
      <div className="rp-row"><i className="dot" style={{ width: "10px", height: "10px", background: "#a78bfa" }}></i><b>Physics<small>10 papers</small></b><span className="avg">58%</span><span className="grade gC">C5</span><span className="trend up">+7</span></div>
      <div className="rp-row"><i className="dot" style={{ width: "10px", height: "10px", background: "#2dd4bf" }}></i><b>Chemistry<small>8 papers</small></b><span className="avg">47%</span><span className="grade gD">D7</span><span className="trend down">−3</span></div>
      <div className="rp-row"><i className="dot" style={{ width: "10px", height: "10px", background: "#4ade80" }}></i><b>Biology<small>10 papers</small></b><span className="avg">71%</span><span className="grade gA">B2</span><span className="trend up">+2</span></div>
      <div className="rp-f">
      <div className="pos"><span>Position this week</span><b>14th</b></div>
      <div className="remark"><span>Remark:</span><p>Chemistry needs you this week.</p></div>
      </div>
      </div>
      <p className="cap">An example report card. Yours fills in from your own papers.</p>
      </div>
      </div>
      </div>
      </section>

      {/* Daily habits */}
      <section className="sec">
      <div className="wrap">
      <div className="sec-h">
      <h2>A little every day adds up.</h2>
      <p>Three small reasons to open StudyBond, even on a busy day.</p>
      </div>
      <div className="cards3">
      <article className="card">
      <div className="vis">
      <div className="dc-row">
      <div className="dc-subs"><span className="dc-sub" style={{ background: "#fb7185" }}>Eng</span><span className="dc-sub" style={{ background: "#a78bfa" }}>Phy</span><span className="dc-sub" style={{ background: "#2dd4bf" }}>Chm</span><span className="dc-sub" style={{ background: "#4ade80" }}>Bio</span></div>
      <div className="dc-time">3:00<small>minutes</small></div>
      </div>
      <p className="dc-pts">Worth up to <b>40</b> points in the league</p>
      </div>
      <h3>Daily challenge</h3>
      <p>One question from each of your subjects, three minutes on the clock. Free for everyone, every day.</p>
      </article>
      <article className="card">
      <div className="vis">
      <p className="st-n"><b>12</b>days in a row</p>
      <div className="week">
      <div className="wd"><span className="wm on"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>M</div>
      <div className="wd"><span className="wm on"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>T</div>
      <div className="wd"><span className="wm on"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>W</div>
      <div className="wd"><span className="wm on"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>T</div>
      <div className="wd"><span className="wm on"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>F</div>
      <div className="wd"><span className="wm today"></span>S</div>
      <div className="wd"><span className="wm"></span>S</div>
      </div>
      </div>
      <h3>Your streak</h3>
      <p>Study on any day and your streak grows. Reach day 7 and you earn a freeze that covers one missed day.</p>
      </article>
      <article className="card">
      <div className="vis">
      <div className="words">
      <div className="wrow"><span>Word</span><b>insolvent<small>unable to pay your debts</small></b></div>
      <div className="wrow"><span>Idiom</span><b>neck and neck<small>level with each other in a race</small></b></div>
      <div className="wrow"><span>Phrasal verb</span><b>fall through<small>fail to happen, of a plan</small></b></div>
      </div>
      </div>
      <h3>Today&apos;s words</h3>
      <p>A word, an idiom and a phrasal verb from real UTME English papers. The same three for everyone, each day.</p>
      </article>
      </div>
      </div>
      </section>
    </>
  );
}
