/**
 * Blog article content for SEO guide pages.
 * Each article targets a specific long-tail keyword cluster.
 */

export type BlogArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  dateModified: string;
  keywords: string[];
  faq: { question: string; answer: string }[];
  sections: { heading: string; content: string }[];
};

export const blogArticles: Record<string, BlogArticle> = {
  "how-to-pass-ui-post-utme": {
    slug: "how-to-pass-ui-post-utme",
    title: "How to Pass UI Post-UTME: Complete Preparation Guide [2026]",
    metaTitle: "How to Pass UI Post-UTME 2026 — Complete Guide",
    metaDescription: "Learn how to pass the University of Ibadan Post-UTME with proven strategies. Study plans, subject tips, CBT practice techniques, and score optimization. Free guide from StudyBond.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["how to pass UI post utme", "UI post utme preparation", "UI post utme tips", "pass university of ibadan post utme"],
    faq: [
      { question: "What score do I need to pass UI Post-UTME?", answer: "There's no universal pass mark — admission depends on your aggregate score, calculated as (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). Your aggregate must meet or exceed your department's cut-off mark. For Medicine, the 2025 cut-off was 78.875. For less competitive courses, aggregates of 50-55 may be sufficient." },
      { question: "How long should I prepare for UI Post-UTME?", answer: "Ideally, start 2-3 months before the exam. Practice at least 1 full exam per day on StudyBond in the final month. Consistency matters more than cramming." },
      { question: "Can I pass UI Post-UTME without coaching?", answer: "Yes. Many students pass using self-study with platforms like StudyBond. The key is practicing with real past questions in timed CBT format, reviewing your weak areas, and maintaining consistency. However if you feel you need more guidance, consider joining a reliable online class or a physical coaching centre." },
    ],
    sections: [
      { heading: "Understanding the UI Post-UTME", content: "The University of Ibadan Post-UTME is a Computer-Based Test (CBT) screening exam for candidates who scored at least 200 in JAMB and chose UI as first choice. It consists of 100 multiple-choice questions across the same 4 subjects you wrote in JAMB — to be completed in 90 minutes. Your aggregate score is calculated as (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). O'Level results are NOT used in the aggregate — they are only a prerequisite (you need at least 5 credits including English and Mathematics).\n\nUnderstanding the exam structure is the first step to passing. Unlike JAMB, the UI Post-UTME is university-specific — questions are set by UI lecturers and focus on O'Level-level content. This means practicing with real UI past questions (not generic JAMB materials) is critical." },
      { heading: "Step 1: Know Your Target Score", content: "Your admission depends on your aggregate score: (JAMB ÷ 8) + (Post-UTME ÷ 2). Since your JAMB score is already fixed, the Post-UTME is your only remaining lever.\n\nFor example, if you scored 300 in JAMB: JAMB component = 300/8 = 37.5. If Medicine's cut-off is 78.875, you'd need (78.875 - 37.5) × 2 = 82.75 in the Post-UTME — extremely difficult. But with JAMB 350: 350/8 = 43.75, so you'd need (78.875 - 43.75) × 2 = 70.25 in Post-UTME — very achievable with good preparation. Use StudyBond to track whether your practice scores are hitting your target." },
      { heading: "Step 2: Practice with Real Past Questions", content: "This is non-negotiable. The single most effective preparation strategy is practicing with verified UI Post-UTME past questions in timed CBT format. StudyBond provides exactly this — 1000+ real past questions across all 4 subjects with a 90-minute timer that mirrors the actual exam.\n\nDon't just read past questions from PDFs. Active practice — answering under time pressure, getting instant feedback, and reviewing explanations — produces dramatically better results than passive reading. StudyBond tracks your accuracy by subject so you know exactly where to focus." },
      { heading: "Step 3: Master Your Weak Subjects", content: "After your first practice exam on StudyBond, you'll see a score breakdown by subject. Focus 60% of your study time on your weakest subjects. If you're scoring 40% in Chemistry but 80% in English, your Chemistry improvement will yield more aggregate points.\n\nUse StudyBond's subject-specific practice mode (premium) to drill into individual subjects. Take at least 2-3 subject-focused sessions per weak area before attempting another full exam." },
      { heading: "Step 4: Simulate Real Exam Conditions", content: "The UI Post-UTME is a high-pressure, timed environment. Many students who know the material still underperform because they're not used to the time pressure. StudyBond's CBT simulation creates identical conditions — 100 questions, 90 minutes, no pause button.\n\nPractice at least 5-10 full timed exams before exam day. Pay attention to your pacing: you have approximately 54 seconds per question. If a question is taking too long, mark it and move on." },
      { heading: "Step 5: Build Consistency with Streaks", content: "Cramming doesn't work for Post-UTME. Daily practice over weeks produces far better results than 12-hour sessions the day before. StudyBond's streak system helps you build this habit — practice every day to maintain your streak and earn rewards.\n\nStudents who maintain a 7+ day streak on StudyBond score an average of 15% higher than those who practice sporadically. Make exam practice part of your daily routine." },
      { heading: "Subject-Specific Tips", content: "**English**: Focus on vocabulary (synonyms/antonyms), comprehension strategies, and grammar rules (concord, tenses). Read the comprehension passage carefully before answering — don't rush.\n\n**Chemistry**: Master IUPAC naming, periodic table trends, gas law calculations, and electrochemistry. These topics appear consistently in UI Post-UTME.\n\n**Physics**: Know your formulas cold — mechanics, circuits, and waves dominate. Practice calculations under time pressure. Always check units.\n\n**Biology**: Cell organelles, genetics crosses, ecology concepts, and human body systems are frequently tested. Focus on understanding, not just memorization." },
      { heading: "Common Mistakes to Avoid", content: "1. **Relying on JAMB materials only** — UI Post-UTME has its own question style. Use UI-specific past questions.\n2. **Not timing yourself** — Practice without a timer gives false confidence. Always use timed CBT.\n3. **Ignoring weak subjects** — Your weakest subject has the most room for improvement.\n4. **Starting too late** — Begin at least 8 weeks before the exam.\n5. **Using unverified questions** — Sketchy PDFs from unknown sources waste your time. Use StudyBond's verified question bank." },
    ],
  },

  "ui-post-utme-cut-off-mark": {
    slug: "ui-post-utme-cut-off-mark",
    title: "UI Post-UTME Cut-Off Marks by Department [2025 Updated]",
    metaTitle: "UI Post-UTME Cut-Off Marks 2025 by Department",
    metaDescription: "Complete list of University of Ibadan Post-UTME cut-off marks by department and course. Aggregate score requirements and admission criteria. Updated with real 2025/2026 data.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI post utme cut off mark", "university of ibadan cut off mark", "UI admission cut off", "UI JAMB cut off mark"],
    faq: [
      { question: "What is the JAMB cut-off mark for UI?", answer: "The University of Ibadan sets a general JAMB UTME cut-off of 200 for ALL courses. Scoring 200 qualifies you to register for the Post-UTME screening — it does not guarantee admission. Your admission depends on your aggregate score meeting your department's specific cut-off." },
      { question: "How is the UI aggregate score calculated?", answer: "UI calculates your aggregate as: (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). For example, JAMB 320 and Post-UTME 70: (320/8) + (70/2) = 40 + 35 = 75. O'Level results are NOT part of this calculation — they are only a prerequisite (minimum 5 credits)." },
    ],
    sections: [
      { heading: "How UI Cut-Off Marks Work", content: "The University of Ibadan does not publish a single 'pass mark' for the Post-UTME. Instead, admission is based on an aggregate score calculated as: (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). The maximum possible aggregate is 100 (400/8 + 100/2 = 50 + 50).\n\nImportant: O'Level results are NOT used in the aggregate calculation. They are only a prerequisite — you must have at least 5 credit passes in relevant subjects (including English and Mathematics) to be eligible. For College of Medicine and Pharmacy, these credits must be in one sitting.\n\nThe aggregate cut-off varies by department and is determined after all candidates have been screened. Highly competitive courses have higher effective cut-offs because more qualified candidates apply." },
      { heading: "Official 2025/2026 Cut-Off Marks", content: "Based on the official University of Ibadan cut-off marks for the 2025/2026 session:\n\n**Medicine & Surgery**: 78.875\n**Nursing Science**: 71.375\n**Law**: 70.875\n**Mechanical Engineering**: 70.500\n**Pharmacy**: 69.125\n**Dentistry**: 68.625\n**Accounting**: 68.500\n**Computer Science**: 63.500\n**Economics**: 58.125\n**English**: 56.500\n**Linguistics**: 56.875\n**Agricultural Economics**: 51.375\n**Veterinary Medicine**: 50.000\n**Most Agriculture courses**: 50.000\n**Most Education courses**: 50.000\n\n*These are merit cut-off marks. Catchment and ELDS cut-offs may differ. Always verify on the official UI website (ui.edu.ng).*" },
      { heading: "How to Maximize Your Aggregate Score", content: "Since your aggregate is (JAMB/8) + (Post-UTME/2), the Post-UTME carries EQUAL weight to JAMB — both contribute a maximum of 50 points each. This means a strong Post-UTME performance can fully compensate for a moderate JAMB score.\n\nExample: A candidate with JAMB 280 (280/8 = 35) who scores 80 in Post-UTME (80/2 = 40) gets aggregate 75. A candidate with JAMB 350 (350/8 = 43.75) who scores 60 in Post-UTME (60/2 = 30) gets aggregate 73.75. The lower JAMB scorer wins because they prepared better for the Post-UTME.\n\nPractice with real past questions on StudyBond to maximize your Post-UTME score — it's the only component you can still control." },
    ],
  },

  "ui-post-utme-exam-format": {
    slug: "ui-post-utme-exam-format",
    title: "UI Post-UTME Exam Format & Structure — What to Expect",
    metaTitle: "UI Post-UTME Exam Format & Structure 2025",
    metaDescription: "Complete breakdown of the University of Ibadan Post-UTME exam format. Number of questions, time limit, subjects, scoring, CBT interface, and what to expect on exam day.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI post utme exam format", "UI post utme structure", "university of ibadan screening format", "UI post utme questions format"],
    faq: [
      { question: "How many questions are in UI Post-UTME?", answer: "The UI Post-UTME typically has 100 multiple-choice questions: 25 per subject across English, Chemistry, Physics, and Biology (or your relevant subject combination)." },
      { question: "How long is the UI Post-UTME?", answer: "You have 90 minutes (1 hour 30 minutes) to complete all 100 questions. That's approximately 54 seconds per question." },
      { question: "Is the UI Post-UTME a computer-based test?", answer: "Yes, the University of Ibadan Post-UTME is a Computer-Based Test (CBT). You answer questions on a computer screen. Practice with StudyBond's CBT simulation to get comfortable with the format." },
    ],
    sections: [
      { heading: "Exam Overview", content: "The University of Ibadan Post-UTME is a Computer-Based Test (CBT) conducted at designated centers within the university campus. It is a screening exercise for candidates who scored at least 200 in JAMB UTME and chose UI as their first-choice institution.\n\n**Key details:**\n- **Total questions**: 100 multiple-choice\n- **Duration**: 90 minutes\n- **Subjects**: The same 4 subjects you wrote in JAMB\n- **Questions per subject**: 25\n- **Format**: CBT (Computer-Based Test)\n- **Negative marking**: No (typically)\n- **Calculator**: Not allowed\n- **Content level**: O'Level standard" },
      { heading: "Subject Breakdown", content: "**English Language (25 questions)** — Compulsory for all candidates. Covers comprehension, vocabulary, grammar, and literary devices.\n\n**Chemistry (25 questions)** — Organic, inorganic, and physical chemistry. Required for science/engineering courses.\n\n**Physics (25 questions)** — Mechanics, waves, electricity, optics, modern physics. Required for engineering and physical sciences.\n\n**Biology (25 questions)** — Cell biology, genetics, ecology, anatomy. Required for medicine and biological sciences.\n\nYour specific combination depends on your chosen course. All candidates take English. The other 3 subjects match your JAMB subject combination." },
      { heading: "Scoring & Time Management", content: "Each question carries equal marks. With 100 questions in 90 minutes, you have approximately 54 seconds per question. Time management is crucial.\n\n**Recommended strategy:**\n- First pass (60 min): Answer all questions you're confident about. Skip difficult ones.\n- Second pass (25 min): Return to skipped questions. Use elimination to narrow options.\n- Final review (5 min): Check for unanswered questions.\n\nStudyBond's CBT simulation trains you to work within this time constraint so exam day feels familiar." },
      { heading: "What to Bring on Exam Day", content: "- Your printed Post-UTME screening photocard (contains your date, time, venue, and seat number)\n- HB pencils and eraser (backup)\n- Arrive at least 1 hour before your scheduled time\n\n**Do NOT bring**: Phones, calculators, smartwatches, bags, or any electronic device. These are strictly prohibited in the examination hall." },
    ],
  },

  "ui-post-utme-score-calculator": {
    slug: "ui-post-utme-score-calculator",
    title: "UI Post-UTME Score Calculator — Calculate Your Aggregate",
    metaTitle: "UI Post-UTME Score Calculator — Aggregate Score",
    metaDescription: "Calculate your University of Ibadan Post-UTME aggregate score. Enter your JAMB score and Post-UTME score to see your admission chances. Simple formula: (JAMB/8) + (Post-UTME/2).",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI post utme score calculator", "UI aggregate score calculator", "university of ibadan score calculation", "UI admission score"],
    faq: [
      { question: "How is the UI aggregate score calculated?", answer: "The formula is: Aggregate = (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). O'Level results are NOT included in the aggregate — they are only a prerequisite (minimum 5 credits). Maximum possible aggregate is 100." },
      { question: "What aggregate score do I need for UI?", answer: "It depends on your course. In 2025: Medicine required 78.875, Law 70.875, Mechanical Engineering 70.5, Computer Science 63.5, Economics 58.125. Many courses in Agriculture and Education have cut-offs around 50." },
    ],
    sections: [
      { heading: "Understanding the Aggregate Score", content: "The University of Ibadan uses a simple two-component aggregate scoring system to determine admission:\n\n**Aggregate = (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2)**\n\n- JAMB contributes a maximum of 50 points (400/8 = 50)\n- Post-UTME contributes a maximum of 50 points (100/2 = 50)\n- Maximum possible aggregate: 100\n\n**Important**: O'Level results are NOT part of the aggregate calculation. They are only a prerequisite — you need at least 5 credit passes in relevant subjects (including English and Mathematics). For College of Medicine and Pharmacy, these must be in one sitting.\n\nSince JAMB and Post-UTME carry equal weight, a strong Post-UTME performance can fully compensate for a moderate JAMB score." },
      { heading: "Score Calculation Examples", content: "**Example 1: Medicine candidate**\n- JAMB: 350 → 350/8 = 43.75\n- Post-UTME: 72 → 72/2 = 36.00\n- **Aggregate: 79.75** ✔️ (above 78.875 Medicine cut-off)\n\n**Example 2: Engineering candidate**\n- JAMB: 300 → 300/8 = 37.50\n- Post-UTME: 68 → 68/2 = 34.00\n- **Aggregate: 71.50** ✔️ (above 70.5 Mech. Eng. cut-off)\n\n**Example 3: Marginal candidate**\n- JAMB: 250 → 250/8 = 31.25\n- Post-UTME: 60 → 60/2 = 30.00\n- **Aggregate: 61.25** (sufficient for some Science/Arts courses, not enough for Medicine/Law/Engineering)" },
      { heading: "How to Improve Your Aggregate", content: "Since both JAMB and Post-UTME contribute equally (max 50 points each), every mark in the Post-UTME is worth the same as a mark in JAMB.\n\n- Every 2-point improvement in Post-UTME = +1 point on your aggregate\n- Going from 60 to 80 in Post-UTME = +10 points aggregate boost\n\nThat 10-point difference can move you from 'not admitted' to 'admitted' for almost any course. Practice on StudyBond to maximize your Post-UTME score — it's the only component you can still control." },
    ],
  },

  "best-ui-post-utme-practice": {
    slug: "best-ui-post-utme-practice",
    title: "Best Site for UI Post-UTME Practice in 2026",
    metaTitle: "Best Site for UI Post-UTME Practice 2026",
    metaDescription: "Compare the best platforms for University of Ibadan Post-UTME practice. Real past questions, CBT simulation, score analytics. Find the right prep tool.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["best site for UI post utme", "where to get UI post utme past questions", "UI post utme practice site", "best UI post utme app"],
    faq: [
      { question: "What is the best site to practice UI Post-UTME?", answer: "StudyBond is the best platform for UI Post-UTME practice. It offers real, verified past questions in timed CBT simulation (100 questions, 90 minutes), score analytics by subject, leaderboards, daily streaks, and 1v1 duels. The first exam is completely free." },
      { question: "Can I practice UI Post-UTME online for free?", answer: "Yes. StudyBond offers your first full UI Post-UTME exam completely free — no credit card required. This includes 100 real past questions, timed CBT, and a score breakdown." },
    ],
    sections: [
      { heading: "What to Look for in a Practice Platform", content: "Not all exam prep platforms are equal. For effective UI Post-UTME preparation, you need:\n\n1. **Real past questions** — Not generic JAMB questions or AI-generated content. Actual questions from previous UI Post-UTME exams.\n2. **CBT simulation** — The ability to practice under real exam conditions (timed, computer-based).\n3. **Score analytics** — Detailed breakdown by subject so you know where to improve.\n4. **Verified content** — Questions that have been reviewed for accuracy.\n5. **Accessibility** — Works on mobile and desktop. No sketchy downloads." },
      { heading: "Why StudyBond Stands Out", content: "StudyBond was built specifically for Nigerian Post-UTME candidates by engineers who understand the exam. Here's what makes it different:\n\n- **1000+ verified UI Post-UTME past questions** across all 4 subjects\n- **Exact CBT simulation**: 100 questions, 90-minute timer, identical to the real exam\n- **Instant score analytics** by subject — see strengths and weaknesses immediately\n- **Leaderboard** — See how you rank against other students weekly\n- **Daily streaks** — Build study consistency with milestone rewards\n- **1v1 Duels** — Challenge other students in real-time exam battles\n- **Free to start** — Your first full exam is completely free, no credit card\n- **Premium at ₦5,000** for 5 months — unlimited exams, subject practice, all features" },
      { heading: "The Problem with PDF Past Questions", content: "Many students rely on PDF past question compilations shared on WhatsApp or sold by tutorial centers. These have serious problems:\n\n- **No timing** — You can't simulate exam pressure with a PDF\n- **No scoring** — You don't get instant feedback on your performance\n- **Unverified** — Many PDFs contain incorrect answers or outdated questions\n- **No analytics** — You can't track progress or identify weak subjects\n- **Passive learning** — Reading PDFs is far less effective than active CBT practice\n\nStudyBond solves all of these by providing an interactive, timed, scored CBT experience with real verified questions." },
    ],
  },

  "ui-post-utme-registration": {
    slug: "ui-post-utme-registration",
    title: "UI Post-UTME Registration Guide — Step by Step",
    metaTitle: "UI Post-UTME Registration Guide",
    metaDescription: "Step-by-step guide to register for the University of Ibadan Post-UTME screening exam. Requirements, deadlines, fees, and how to complete your registration.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI post utme registration", "how to register for UI post utme", "university of ibadan post utme form", "UI screening registration"],
    faq: [
      { question: "When does UI Post-UTME registration open?", answer: "Registration typically opens between July and August each year. For the 2025/2026 session, it ran from July 21 to August 17, 2025. Monitor the official UI admissions portal (admissions.ui.edu.ng) for updates." },
      { question: "What is the UI Post-UTME registration fee?", answer: "For the 2025/2026 session, candidates paid ₦3,000 (portal access fee) + ₦2,000 (screening fee) = ₦5,000 total. Payment is made online through the official admissions portal." },
    ],
    sections: [
      { heading: "Eligibility Requirements", content: "To register for the UI Post-UTME, you must:\n\n1. **Choose UI as first choice** in your JAMB UTME registration\n2. **Score at least 200 in JAMB** — this is the minimum for ALL courses (there is no higher per-course JAMB requirement)\n3. **Have the required O'Level subjects** for your chosen course (minimum 5 credits including English and Mathematics). For College of Medicine and Pharmacy, credits must be in one sitting.\n4. **Be at least 16 years old** by September 30 of the admission year\n\nCandidates who did not choose UI as first choice may be able to change via the JAMB portal before the Post-UTME registration deadline." },
      { heading: "Registration Steps (Based on 2025 Process)", content: "1. Visit the official UI admissions portal: **admissions.ui.edu.ng**\n2. Log in using your **JAMB registration number** as username and your **surname in capitals** as the initial password\n3. Generate a payment invoice and pay the fees (₦5,000 total for 2025/2026)\n4. Complete the online registration form with accurate information\n5. Upload a recent passport photograph and signature\n6. Print your evidence of transaction\n7. Return later to print your **screening photocard** (contains your exam date, venue, and seat number)\n\n**Important**: Only use the official portal (admissions.ui.edu.ng). Do not pay to any third party for registration." },
      { heading: "While You Wait — Start Practicing", content: "Don't wait until after registration to start preparing. The gap between JAMB results and the Post-UTME is your golden preparation window.\n\nCreate a free StudyBond account now and start practicing with real UI Post-UTME past questions. Your first full exam is free — 100 questions, 90 minutes, timed CBT, instant scoring. Build your streak before registration even opens." },
    ],
  },

  "ui-mbbs-post-utme": {
    slug: "ui-mbbs-post-utme",
    title: "UI MBBS Post-UTME Guide — Medicine Admission Preparation",
    metaTitle: "UI MBBS Post-UTME Guide — Medicine Preparation",
    metaDescription: "Complete guide for UI Medicine (MBBS) Post-UTME preparation. Cut-off marks, subject focus, practice strategies, and how to maximize your aggregate score for medical school admission.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI MBBS post utme", "UI medicine post utme", "university of ibadan medicine admission", "UI medical school post utme"],
    faq: [
      { question: "What is the JAMB cut-off for UI Medicine?", answer: "The JAMB cut-off for UI is 200 for ALL courses, including Medicine. There is no higher per-course JAMB requirement. However, because Medicine has the highest aggregate cut-off (78.875 in 2025), you need a strong JAMB score to have a realistic chance — typically 300+ to leave room for a manageable Post-UTME target." },
      { question: "What subjects do I need for UI MBBS Post-UTME?", answer: "You need English Language, Chemistry, Physics, and Biology — the same 4 subjects you wrote in JAMB. All four are tested with 25 questions each in the Post-UTME." },
    ],
    sections: [
      { heading: "Why UI Medicine is Ultra-Competitive", content: "Medicine (MBBS) at the University of Ibadan is one of the most competitive programs in Nigeria. With thousands of applicants for roughly 150-200 spots, the admission process is intensely selective.\n\nThe 2025/2026 aggregate cut-off for Medicine was **78.875** — the highest of any course at UI. Your aggregate is calculated as (JAMB/8) + (Post-UTME/2). To reach 78.875, you need an exceptional combination of JAMB and Post-UTME scores." },
      { heading: "Target Scores for Medicine", content: "With the 2025 cut-off at 78.875, here's what you need:\n\n**If JAMB = 350**: 350/8 = 43.75. You need Post-UTME of at least (78.875 - 43.75) × 2 = **70.25**\n**If JAMB = 320**: 320/8 = 40.00. You need Post-UTME of at least (78.875 - 40) × 2 = **77.75**\n**If JAMB = 300**: 300/8 = 37.50. You need Post-UTME of at least (78.875 - 37.5) × 2 = **82.75**\n\nThe math is clear: a higher JAMB score gives you breathing room. But regardless of your JAMB score, intense Post-UTME preparation is non-negotiable for Medicine." },
      { heading: "Subject Strategy for Medicine", content: "As a Medicine candidate, you're tested on all 4 subjects equally (25 questions each). Your strategy should be:\n\n1. **Biology** — This is your bread and butter. As a future medical student, you should aim for 90%+ in Biology.\n2. **Chemistry** — Organic chemistry and biochemistry concepts are heavily tested. Target 75%+.\n3. **Physics** — Often the weakest subject for pre-med students. Don't neglect it — every mark counts.\n4. **English** — Should be your easiest subject. Aim for 80%+ with vocabulary and grammar focus.\n\nPractice each subject individually on StudyBond to identify and fix weaknesses before the exam." },
    ],
  },

  "ui-engineering-post-utme": {
    slug: "ui-engineering-post-utme",
    title: "UI Engineering Post-UTME Guide — Preparation & Cut-Off Marks",
    metaTitle: "UI Engineering Post-UTME Guide 2025",
    metaDescription: "Complete guide for University of Ibadan Engineering Post-UTME. Cut-off marks by department, subject focus areas, practice strategies, and aggregate score targets.",
    datePublished: "2025-06-01",
    dateModified: "2026-05-12",
    keywords: ["UI engineering post utme", "university of ibadan engineering admission", "UI engineering cut off mark", "UI post utme for engineering"],
    faq: [
      { question: "What JAMB score do I need for UI Engineering?", answer: "The JAMB cut-off for UI is 200 for ALL courses, including Engineering. There is no higher per-course JAMB requirement. However, Mechanical Engineering's 2025 aggregate cut-off was 70.5, so you need a strong JAMB score (280+) to have a realistic chance after accounting for Post-UTME performance." },
      { question: "What subjects are tested for UI Engineering Post-UTME?", answer: "Engineering candidates are tested on the same 4 subjects they wrote in JAMB — typically English, Mathematics, Physics, and Chemistry. 25 questions per subject." },
    ],
    sections: [
      { heading: "UI Engineering Departments", content: "The University of Ibadan Faculty of Technology offers several engineering programs:\n\n- Civil Engineering\n- Electrical & Electronics Engineering\n- Mechanical Engineering\n- Petroleum Engineering\n- Industrial & Production Engineering\n- Food Technology\n- Agricultural & Environmental Engineering\n\nCompetitiveness varies by department. In 2025, Mechanical Engineering had a cut-off of 70.5. Petroleum and Electrical Engineering are typically among the most competitive." },
      { heading: "Physics & Math Focus", content: "Engineering candidates should prioritize Physics and Mathematics in their Post-UTME preparation. These subjects form the foundation of all engineering programs.\n\n**Physics priorities**: Mechanics (forces, motion, energy), electricity & circuits, waves, and modern physics.\n\n**Chemistry priorities**: Physical chemistry (gas laws, equilibrium), electrochemistry, and organic chemistry basics.\n\nPractice calculation-heavy questions on StudyBond — Engineering Post-UTME questions tend to be more computation-intensive than other courses." },
      { heading: "Maximizing Your Engineering Aggregate", content: "With Mechanical Engineering's 2025 cut-off at 70.5:\n\n**If JAMB = 320**: 320/8 = 40. You need Post-UTME of at least (70.5 - 40) × 2 = **61** — achievable with solid preparation.\n**If JAMB = 280**: 280/8 = 35. You need Post-UTME of at least (70.5 - 35) × 2 = **71** — requires focused practice.\n\nThe Post-UTME carries equal weight to JAMB in the aggregate formula. Practice with real past questions on StudyBond — focus on Physics and Chemistry calculation questions, as these are where most Engineering candidates lose points." },
    ],
  },
};

export function getArticle(slug: string): BlogArticle | undefined {
  return blogArticles[slug];
}

export function getAllSlugs(): string[] {
  return Object.keys(blogArticles);
}
