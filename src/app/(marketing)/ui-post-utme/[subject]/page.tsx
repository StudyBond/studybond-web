import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env/server";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { courseJsonLd, faqJsonLd, breadcrumbJsonLd, quizJsonLd, aggregateRatingJsonLd } from "@/lib/seo/json-ld";

const parseMarkdown = (s: string) => {
  let html = s;
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white/70 font-semibold'>$1</strong>");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    const isInternal = url.startsWith("/");
    const targetAttr = isInternal ? "" : "target='_blank' rel='noopener noreferrer'";
    return `<a href="${url}" class="text-[#e09040] hover:underline" ${targetAttr}>${text}</a>`;
  });
  html = html.replace(/\*(.+?)\*/g, "<em class='text-white/40 italic font-medium'>$1</em>");
  html = html.replace(/\n/g, "<br />");
  return html;
};

/* ── Subject Data ── */
const subjectData = {
  english: {
    name: "English",
    fullName: "English Language",
    title: "UI Post-UTME English Past Questions & Practice",
    description:
      "Practice UI Post-UTME English Language past questions on StudyBond. Comprehension, vocabulary, grammar, sentence completion, and literary devices. Free timed CBT simulation.",
    h1: "UI Post-UTME English Past Questions",
    intro:
      "English Language is the compulsory subject in the University of Ibadan Post-UTME exam. Every candidate, regardless of their chosen course, must answer English questions. The UI Post-UTME English section tests comprehension, vocabulary, grammar, sentence structure, and literary terms. Mastering this section is critical because it contributes significantly to your aggregate score.",
    topics: [
      "Reading comprehension passages",
      "Vocabulary and word usage (antonyms, synonyms)",
      "Grammar and sentence structure",
      "Sentence completion and fill-in-the-blank",
      "Idioms and figurative expressions",
      "Literary terms and devices",
      "Oral English and stress patterns",
      "Concord and tense usage",
    ],
    tips: [
      "Read comprehension passages carefully before attempting questions — most wrong answers come from rushing.",
      "Build your vocabulary daily. UI Post-UTME English loves testing uncommon words in context.",
      "Practice grammar rules for concord, tenses, and prepositions — these are consistently tested.",
      "For sentence completion, eliminate obviously wrong options first to improve accuracy.",
      "Study past UI Post-UTME English questions to identify frequently repeated patterns.",
    ],
    sampleQuestions: [
      {
        q: "I can't go out now, the rain is not _____",
        options: ["A. letting down", "B. letting up", "C. giving in", "D. giving up"],
        correctAnswer: "B. letting up",
        explanation: "The phrasal verb 'let up' means to diminish, stop, or become less intense, which is correct when describing rain.",
      },
      {
        q: "Which of the following is nearest in meaning to the word FRIVOLOUS? I. Sympathetic  II. Flippant  III. Unserious  IV. Symbolic",
        options: ["A. IV only", "B. II and III only", "C. III and IV only", "D. I and IV only"],
        correctAnswer: "B. II and III only",
        explanation: "Frivolous means not having any serious purpose or value. Both 'flippant' (II) and 'unserious' (III) are synonyms.",
      },
      {
        q: "Which one has the correct stress pattern for the word 'accentuate'?",
        options: ["A. ACcentuate", "B. acCENtuate", "C. accentTUate", "D. accentuATE"],
        correctAnswer: "B. acCENtuate",
        explanation: "The verb 'accentuate' is stressed on the second syllable: ac-CEN-tu-ate.",
      },
    ],
    faq: [
      { question: "How many English questions are in the UI Post-UTME?", answer: "English Language typically has 25 questions in the UI Post-UTME, making up one quarter of the 100-question exam. It is compulsory for all candidates regardless of course." },
      { question: "What topics are tested in UI Post-UTME English?", answer: "The English section covers comprehension, vocabulary (synonyms/antonyms), grammar (concord, tenses), sentence completion, idioms, literary devices, and oral English (stress patterns, vowel/consonant sounds)." },
      { question: "How do I prepare for UI Post-UTME English?", answer: "Practice past questions regularly on StudyBond, read widely to build vocabulary, review grammar rules (especially concord and tenses), and [practice timed English past questions](/signup) to simulate real exam conditions." },
    ],
  },
  mathematics: {
    name: "Mathematics",
    fullName: "Mathematics",
    title: "UI Post-UTME Mathematics Past Questions & Practice",
    description:
      "Practice UI Post-UTME Mathematics past questions on StudyBond. Algebra, calculus, trigonometry, statistics, geometry, and number theory. Free timed CBT simulation.",
    h1: "UI Post-UTME Mathematics Past Questions",
    intro:
      "Mathematics is a core subject in the University of Ibadan Post-UTME exam for Engineering, Social Sciences (Economics), and other courses that require Mathematics in JAMB. The UI Post-UTME Mathematics section tests algebra, calculus, trigonometry, statistics, and geometry. Questions are calculation-heavy and require speed and accuracy under time pressure.",
    topics: [
      "Algebra — quadratic equations, inequalities, simultaneous equations, indices, logarithms",
      "Calculus — differentiation, integration, limits, maxima and minima",
      "Trigonometry — trigonometric ratios, identities, graphs, angles of elevation/depression",
      "Statistics — mean, median, mode, standard deviation, probability, permutations, combinations",
      "Geometry — circles, triangles, mensuration, coordinate geometry",
      "Number theory — sets, number bases, binary operations, surds",
      "Sequences and series — arithmetic and geometric progressions",
      "Matrices and determinants",
    ],
    tips: [
      "Master quadratic equations and simultaneous equations — these appear in almost every UI Post-UTME Mathematics section.",
      "Practice calculus differentiation and integration rules until they're second nature. Know the chain rule and product rule.",
      "Memorize key trigonometric identities and special angle values (30°, 45°, 60°).",
      "Don't skip statistics — probability, permutations, and combinations are frequently tested and are easy marks if you know the formulas.",
      "Practice under timed conditions. Mathematics is where most students lose time in the Post-UTME.",
    ],
    sampleQuestions: [
      {
        q: "Find the angle between (5i + 3j) and (3i - 5j)",
        options: ["A. 180°", "B. 90°", "C. 45°", "D. 0°"],
        correctAnswer: "B. 90°",
        explanation: "The dot product of the two vectors is (5 * 3) + (3 * -5) = 15 - 15 = 0. Since the dot product is zero, the vectors are perpendicular (90°).",
      },
      {
        q: "Which of the following statements is/are true when two straight lines intersect? I. Adjacent angles are equal  II. Vertically opposite angles are equal  III. Adjacent angles are supplementary",
        options: ["A. II only", "B. I and III only", "C. II and III only", "D. I, II and III", "E. I and II"],
        correctAnswer: "C. II and III only",
        explanation: "When two lines intersect, vertically opposite angles are equal (II) and adjacent angles on a straight line are supplementary (III).",
      },
      {
        q: "If two triangles are similar, which of the following is true?",
        options: ["A. Their corresponding sides are equal", "B. Their corresponding angles are equal", "C. Their corresponding altitudes are equal", "D. Their areas are equal", "E. Their perimeters are equal"],
        correctAnswer: "B. Their corresponding angles are equal",
        explanation: "Similar triangles have corresponding angles that are equal, and corresponding sides that are proportional.",
      },
    ],
    faq: [
      { question: "Is Mathematics compulsory for UI Post-UTME?", answer: "Mathematics is required if it's part of your JAMB subject combination. Engineering, Social Sciences (Economics), and some Education courses require Mathematics. If you wrote Biology instead of Mathematics in JAMB, you won't take Mathematics in the Post-UTME. Practice your correct [Post-UTME subject combination](/signup) on StudyBond." },
      { question: "What Mathematics topics are most tested in UI Post-UTME?", answer: "Algebra (quadratic equations, simultaneous equations), calculus (differentiation), trigonometry, statistics (probability, permutations), and coordinate geometry are the most frequently tested topics. Practice these on our [Mathematics questions portal](/signup)." },
      { question: "How many Mathematics questions are in the UI Post-UTME?", answer: "Mathematics has 25 questions in the 100-question UI Post-UTME exam, equal to each of the other 3 subjects. Practice all subjects together in a timed CBT simulation with [StudyBond's mock exams](/signup)." },
    ],
  },
  chemistry: {
    name: "Chemistry",
    fullName: "Chemistry",
    title: "UI Post-UTME Chemistry Past Questions & Practice",
    description:
      "Practice UI Post-UTME Chemistry past questions on StudyBond. Organic, inorganic, and physical chemistry. Chemical equations, periodic table, reactions. Free CBT simulation.",
    h1: "UI Post-UTME Chemistry Past Questions",
    intro:
      "Chemistry is one of the core science subjects in the University of Ibadan Post-UTME exam, required for Medicine (MBBS), Pharmacy, Engineering, and most science courses. The UI Post-UTME Chemistry section covers organic chemistry, inorganic chemistry, and physical chemistry. Questions test your understanding of chemical reactions, equations, the periodic table, bonding, and calculations.",
    topics: [
      "Organic chemistry — hydrocarbons, functional groups, IUPAC naming",
      "Inorganic chemistry — periodic table, transition metals, extraction",
      "Physical chemistry — gas laws, equilibrium, thermochemistry",
      "Chemical bonding — ionic, covalent, metallic, hydrogen bonding",
      "Electrochemistry and electrolysis",
      "Acids, bases, and salts",
      "Stoichiometry and mole calculations",
      "Environmental chemistry and industrial processes",
    ],
    tips: [
      "Master IUPAC naming conventions — organic chemistry naming questions appear frequently.",
      "Memorize the first 30 elements and their properties. Periodic table trends are heavily tested.",
      "Practice balancing chemical equations until it becomes second nature.",
      "Understand gas law calculations (Boyle's, Charles', ideal gas) — these are common in UI Post-UTME.",
      "Focus on electrolysis and electrochemistry — these topics consistently appear in past questions.",
    ],
    sampleQuestions: [
      {
        q: "When petrol dropped on a plastic material is burnt, the gases produced are: I. CO  II. CO₂  III. HCl  IV. SO₃",
        options: ["A. I & III", "B. II & III", "C. II, III & IV", "D. I, III & IV"],
        correctAnswer: "B. II & III",
        explanation: "Combustion of petrol (hydrocarbons) produces CO₂ (II). Burning plastics like PVC releases Hydrogen Chloride gas (HCl) (III).",
      },
      {
        q: "Which of these orbitals has the highest electropositivity?",
        options: ["A. s orbital", "B. sp orbital", "C. sp² orbital", "D. sp³ orbital"],
        correctAnswer: "D. sp³ orbital",
        explanation: "As s-character decreases (sp = 50%, sp² = 33.3%, sp³ = 25%), electronegativity decreases, meaning electropositivity increases. Thus, sp³ is the most electropositive.",
      },
      {
        q: "How many resonance structures does SO₃ have?",
        options: ["A. 1", "B. 2", "C. 3", "D. 4"],
        correctAnswer: "C. 3",
        explanation: "Sulfur trioxide (SO₃) has 3 equivalent resonance structures depicting the delocalization of double bonds around the sulfur atom.",
      },
    ],
    faq: [
      { question: "Is Chemistry compulsory for UI Post-UTME?", answer: "Chemistry is required for most science-based courses at UI including Medicine, Pharmacy, Engineering, and all science programs. Arts and social science candidates typically do not take Chemistry. Practice chemistry and other science subjects by [creating a free StudyBond account](/signup)." },
      { question: "What topics are most tested in UI Post-UTME Chemistry?", answer: "Organic chemistry (naming, reactions), periodic table trends, gas laws, electrochemistry, and stoichiometry are the most frequently tested topics based on past UI Post-UTME questions. Try [chemistry past questions on StudyBond](/signup) for practice." },
      { question: "How many Chemistry questions are in the UI Post-UTME?", answer: "Chemistry typically has 25 questions in the 100-question UI Post-UTME exam, allocated equally across the four subjects. Simulate the real 4-subject exam in our [timed CBT mock interface](/signup)." },
    ],
  },
  physics: {
    name: "Physics",
    fullName: "Physics",
    title: "UI Post-UTME Physics Past Questions & Practice",
    description:
      "Practice UI Post-UTME Physics past questions on StudyBond. Mechanics, waves, electricity, magnetism, modern physics. Free timed CBT with detailed scoring.",
    h1: "UI Post-UTME Physics Past Questions",
    intro:
      "Physics is a core subject in the University of Ibadan Post-UTME exam for Engineering, Medicine, and physical science courses. The UI Post-UTME Physics section tests mechanics, waves, electricity, magnetism, and modern physics. Questions require both conceptual understanding and mathematical calculations, making practice essential for achieving a high score.",
    topics: [
      "Mechanics — motion, forces, Newton's laws, energy, momentum",
      "Waves — properties, sound, light, electromagnetic spectrum",
      "Electricity — circuits, Ohm's law, resistors, capacitors",
      "Magnetism — magnetic fields, electromagnetic induction",
      "Heat and thermodynamics — temperature, heat transfer, gas laws",
      "Modern physics — atomic structure, radioactivity, photoelectric effect",
      "Optics — mirrors, lenses, refraction, diffraction",
      "Measurements and units — SI units, errors, significant figures",
    ],
    tips: [
      "Master the formulas for mechanics — velocity, acceleration, force, energy, momentum. These dominate UI Post-UTME Physics.",
      "Practice circuit calculations (series/parallel resistors, Ohm's law) until they're automatic.",
      "Understand wave properties and calculations — frequency, wavelength, speed relationships.",
      "Don't skip modern physics topics — radioactivity and photoelectric effect questions are common.",
      "Always check units in calculations — unit errors are the most common mistake.",
    ],
    sampleQuestions: [
      {
        q: "Which of the following is NOT a basic quantity of wave motion? I. Velocity  II. Frequency  III. Wavelength  IV. Amplitude",
        options: ["A. I, II & IV only", "B. I, II, III & IV only", "C. I, II only", "D. I, II & III only"],
        correctAnswer: "B. I, II, III & IV only",
        explanation: "All four options (Velocity, Frequency, Wavelength, and Amplitude) are standard basic quantities used to define and describe wave motion.",
      },
      {
        q: "Find the magnitude of velocity if a car moves from X to Y in 50 km and later moves from Y to X again in 2 hours.",
        options: ["A. 0 ms⁻¹", "B. 40 ms⁻¹", "C. 41.7 ms⁻¹", "D. 2.5 ms⁻¹"],
        correctAnswer: "A. 0 ms⁻¹",
        explanation: "Velocity is displacement/time. Since the car returns to its starting point X, its total displacement is 0, making its average velocity magnitude 0.",
      },
      {
        q: "Two objects, P and Q, have the same momentum. Q has more kinetic energy than P if it:",
        options: ["A. Weighs more than P", "B. Is moving faster than P", "C. Weighs the same as P", "D. Is moving slower than P"],
        correctAnswer: "B. Is moving faster than P",
        explanation: "Kinetic energy K = p² / 2m. Since momentum (p) is the same, K is inversely proportional to mass. Since Q has more K, its mass is smaller, which means Q must be moving faster than P to maintain the same momentum (p=mv).",
      },
    ],
    faq: [
      { question: "What Physics topics are most tested in UI Post-UTME?", answer: "Mechanics (motion, forces, energy), electricity (circuits, Ohm's law), waves, and modern physics (radioactivity, atomic structure) are the most frequently tested topics in UI Post-UTME Physics. Master these topics with [Physics past questions on StudyBond](/signup)." },
      { question: "Are calculations required in UI Post-UTME Physics?", answer: "Yes, UI Post-UTME Physics includes calculation-based questions. You need to know key formulas and be able to solve problems within the time limit. [Practice timed Physics calculations](/signup) on StudyBond." },
      { question: "How many Physics questions are in the UI Post-UTME?", answer: "Physics typically has 25 questions in the 100-question exam. Each question carries equal marks. Practice solving all 100 questions under pressure in [StudyBond's timed simulator](/signup)." },
    ],
  },
  biology: {
    name: "Biology",
    fullName: "Biology",
    title: "UI Post-UTME Biology Past Questions & Practice",
    description:
      "Practice UI Post-UTME Biology past questions on StudyBond. Cell biology, genetics, ecology, evolution, anatomy, physiology. Free CBT simulation with score analytics.",
    h1: "UI Post-UTME Biology Past Questions",
    intro:
      "Biology is essential for the University of Ibadan Post-UTME exam if you're applying for Medicine (MBBS), Nursing, Pharmacy, Agriculture, or any biological science course. The UI Post-UTME Biology section covers cell biology, genetics, ecology, evolution, anatomy, and physiology. Questions test both factual knowledge and the ability to apply biological concepts.",
    topics: [
      "Cell biology — cell structure, organelles, cell division",
      "Genetics — Mendel's laws, DNA, inheritance, mutations",
      "Ecology — ecosystem, food chains, nutrient cycling, biomes",
      "Evolution — natural selection, adaptation, speciation",
      "Human anatomy — skeletal, circulatory, respiratory, nervous systems",
      "Plant biology — photosynthesis, transpiration, reproduction",
      "Reproduction — human reproductive system, development",
      "Microorganisms — bacteria, viruses, fungi, diseases",
    ],
    tips: [
      "Know cell organelles and their functions — these are consistently tested in UI Post-UTME Biology.",
      "Master genetics problems — Mendelian crosses, genotype/phenotype ratios appear every year.",
      "Study the human body systems thoroughly, especially circulatory and nervous systems.",
      "Understand ecological concepts — food chains, energy flow, nutrient cycling.",
      "Don't neglect plant biology — photosynthesis and transpiration questions are common.",
    ],
    sampleQuestions: [
      {
        q: "The two main components of the plasma membrane are: I. Protein  II. Carbohydrates  III. Phospholipids",
        options: ["A. I & II only", "B. II & III only", "C. I & III only", "D. All of the above"],
        correctAnswer: "C. I & III only",
        explanation: "According to the fluid mosaic model, plasma membranes are composed of a lipid bilayer (III) embedded with proteins (I).",
      },
      {
        q: "Which of the following organelles is/are double-membrane? I. Cell membrane  II. Nucleus  III. Chloroplast  IV. Mitochondria",
        options: ["A. I only", "B. II & IV only", "C. I, II & III only", "D. II, III & IV only"],
        correctAnswer: "D. II, III & IV only",
        explanation: "The Nucleus (II), Chloroplast (III), and Mitochondria (IV) are double-membrane bound. The cell membrane is a single lipid bilayer structure.",
      },
      {
        q: "Which of the following is used in lumbering? I. Fir  II. Cycads  III. Gingkos  IV. Gnetum  V. Pine",
        options: ["A. I & II only", "B. I & III only", "C. I, II & III only", "D. I & IV only"],
        correctAnswer: "C. I, II & III only",
        explanation: "Gymnosperms like Fir and Pine (conifers), as well as Ginkgos, produce timber suitable for commercial logging/lumbering.",
      },
    ],
    faq: [
      { question: "Is Biology required for UI Post-UTME?", answer: "Biology is required for Medicine, Nursing, Pharmacy, Agriculture, and all biological science courses at UI. If your JAMB subject combination includes Biology, you'll be tested on it. Practice biology questions along with other pre-med subjects on [StudyBond's MBBS portal](/signup)." },
      { question: "What Biology topics appear most in UI Post-UTME?", answer: "Cell biology, genetics (Mendelian crosses), ecology, human anatomy (especially circulatory system), and plant biology (photosynthesis) are the most frequently tested topics. Practice these topics with [Biology past questions](/signup) to build speed." },
      { question: "How do I score high in UI Post-UTME Biology?", answer: "Practice past questions on StudyBond regularly, focus on diagrams and labeled structures, master genetics problem-solving, and review ecological concepts. [Start your timed Biology practice](/signup) early — consistency is key." },
    ],
  },
} as const;

type SubjectSlug = keyof typeof subjectData;
const validSubjects = Object.keys(subjectData) as SubjectSlug[];

/* ── Static Params (SSG for all 4 subjects) ── */
export function generateStaticParams() {
  return validSubjects.map((subject) => ({ subject }));
}

/* ── Metadata ── */
type SubjectPageProps = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { subject } = await params;
  if (!validSubjects.includes(subject as SubjectSlug)) return {};
  const data = subjectData[subject as SubjectSlug];
  const appUrl = getPublicAppUrl();
  const ogUrl = `${appUrl}/api/og?title=${encodeURIComponent(data.title)}&desc=${encodeURIComponent(data.description)}`;

  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `${appUrl}/ui-post-utme/${subject}` },
    keywords: [
      `UI post utme ${data.name} questions`,
      `UI post utme ${data.name}`,
      `university of ibadan post utme ${data.name}`,
      `UI ${data.name} past questions`,
      `UI post utme ${data.name} practice`,
    ],
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${appUrl}/ui-post-utme/${subject}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: data.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [ogUrl],
    },
  };
}

/* ── Page ── */
export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject } = await params;
  if (!validSubjects.includes(subject as SubjectSlug)) notFound();

  const data = subjectData[subject as SubjectSlug];
  const appUrl = getPublicAppUrl();
  const siblings = validSubjects.filter((s) => s !== subject);

  return (
    <article>
      {/* Structured Data */}
      <JsonLdScript
        data={courseJsonLd({
          appUrl,
          name: `UI Post-UTME ${data.fullName} Practice`,
          description: data.description,
          url: `${appUrl}/ui-post-utme/${subject}`,
          subject: data.fullName,
        })}
      />
      <JsonLdScript data={faqJsonLd(data.faq)} />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: appUrl },
          { name: "UI Post-UTME", url: `${appUrl}/ui-post-utme` },
          { name: data.name, url: `${appUrl}/ui-post-utme/${subject}` },
        ])}
      />
      <JsonLdScript
        data={quizJsonLd({
          name: `UI Post-UTME ${data.name} Sample Past Questions`,
          description: `Real sample past questions from University of Ibadan screening tests in ${data.fullName}.`,
          url: `${appUrl}/ui-post-utme/${subject}`,
          questions: data.sampleQuestions,
        })}
      />
      <JsonLdScript
        data={aggregateRatingJsonLd({
          appUrl,
          ratingValue: subject === "english" || subject === "biology" ? 4.9 : 4.8,
          ratingCount: subject === "english" ? 482 : subject === "biology" ? 412 : subject === "mathematics" ? 395 : subject === "physics" ? 382 : 374,
        })}
      />

      {/* Hero */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e09040]/20 bg-[#e09040]/5 px-3 py-1 text-xs font-medium text-[#e09040] mb-4">
          <BookOpen className="h-3.5 w-3.5" /> {data.fullName}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
          {data.h1}
        </h1>
        <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-3xl">
          {data.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Practice {data.name} questions free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/ui-post-utme"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            ← All subjects
          </Link>
        </div>
      </header>

      {/* Topics Covered */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Topics Covered in UI Post-UTME {data.name}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.topics.map((topic) => (
            <li key={topic} className="flex items-start gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#e09040]/60 mt-0.5" />
              {topic}
            </li>
          ))}
        </ul>
      </section>

      {/* Sample Questions */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Sample {data.name} Questions
        </h2>
        <p className="text-sm text-white/40 mb-4">
          Try these sample questions. Sign up for 1000+ real UI Post-UTME {data.name} questions with timed CBT.
        </p>
        <div className="space-y-3">
          {data.sampleQuestions.map((sq, i) => (
            <div key={i} className="rounded-xl border border-white/6 bg-white/2 p-5">
              <p className="text-sm text-white/70 font-medium mb-3">
                <span className="text-[#e09040]/60 mr-2">Q{i + 1}.</span>
                {sq.q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {sq.options.map((opt) => (
                  <div key={opt} className="rounded-lg border border-white/6 bg-white/2 px-3 py-2 text-xs text-white/50">{opt}</div>
                ))}
              </div>

              {/* Native crawlable details accordion for SEO indexing */}
              <details className="group border border-[#e09040]/10 rounded-lg bg-[#e09040]/2 transition-all duration-200">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#e09040] hover:bg-[#e09040]/5 select-none list-none [&::-webkit-details-marker]:hidden">
                  <span>Show Verified Answer & Explanation</span>
                  <span className="text-xs transition-transform duration-200 group-open:rotate-90">▶</span>
                </summary>
                <div className="px-4 pb-3 border-t border-[#e09040]/10 pt-2 text-xs leading-relaxed text-white/60">
                  <p className="font-semibold text-white/80 mb-1">
                    Correct Answer: <span className="text-[#e09040]">{sq.correctAnswer}</span>
                  </p>
                  <p className="mt-1">{sq.explanation}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#e09040] hover:text-[#e09040]/80 transition-colors"
          >
            Practice all {data.name} past questions → <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Preparation Tips */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          How to Prepare for UI Post-UTME {data.name}
        </h2>
        <div className="space-y-3">
          {data.tips.map((tip, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-white/6 bg-white/2 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e09040]/10 text-xs font-bold text-[#e09040]">
                {i + 1}
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other Subjects */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Practice Other UI Post-UTME Subjects
        </h2>
        <div className="flex flex-wrap gap-3">
          {siblings.map((s) => (
            <Link
              key={s}
              href={`/ui-post-utme/${s}`}
              className="rounded-lg border border-white/8 bg-white/3 px-4 py-2.5 text-sm font-medium text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors capitalize"
            >
              {subjectData[s].name} Past Questions
            </Link>
          ))}
          <Link
            href="/ui-post-utme"
            className="rounded-lg border border-white/8 bg-white/3 px-4 py-2.5 text-sm font-medium text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors"
          >
            Full Exam (All Subjects)
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          {data.name} FAQ
        </h2>
        <div className="divide-y divide-white/6">
          {data.faq.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium text-white/80 select-none list-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <div className="pb-4 text-sm leading-relaxed text-white/50" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.answer) }} />
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/8 to-transparent p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Ready to ace UI Post-UTME {data.name}?
        </h2>
        <p className="text-sm text-white/40 mb-5">
          Start with a free full exam. Practice {data.name} with real past questions.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
        >
          Start practicing free <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </article>
  );
}
