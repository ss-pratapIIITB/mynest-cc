// Data model for the /ceo development plan.
// Scores below are pulled directly from the BetterUp "Whole Person Strengths"
// report — they are the starting baseline the whole plan is built against.
// Everything else here (pillars, roadmap, habits, books) is editable content,
// not measured data — tweak freely as the plan evolves.

export interface SkillScore {
  name: string;
  score: number;
  definition: string;
}

// Ranked 1-27 in the source report. A few ranks (13-17) weren't captured in
// the assessment screenshots — the ones below are exact.
export const ASSESSMENT_SCORES: SkillScore[] = [
  { name: "Focus", score: 84, definition: "Cultivating deep concentration and immersion in your most important priorities." },
  { name: "Problem Solving", score: 67, definition: "Embracing contradictions and unconventional thinking to drive innovation." },
  { name: "Self-confidence", score: 64, definition: "Believing in your ability to achieve what you set your mind to." },
  { name: "Alignment", score: 60, definition: "Connecting a team's goals to the broader strategy through clear vision and collaboration." },
  { name: "Growth Mindset", score: 57, definition: "Desiring to learn and grow through new challenges and opportunities." },
  { name: "Conscious Collaboration", score: 57, definition: "Setting aside your personal agenda in favor of others' success." },
  { name: "Cognitive Agility", score: 55, definition: "Adapting and shifting thought processes to new information and circumstances." },
  { name: "Social Connection", score: 53, definition: "Having a strong and supportive network of personal relationships." },
  { name: "Recognition", score: 53, definition: "Recognizing a team member's value and impact." },
  { name: "Active Listening", score: 47, definition: "Empathetically listening to the needs of others." },
  { name: "Empowerment", score: 45, definition: "Trusting and enabling team members with high-impact work." },
  { name: "Coaching", score: 41, definition: "Actively supporting the ongoing growth of others." },
  { name: "Mattering", score: 25, definition: "Your sense of the difference your work makes in the world." },
  { name: "Recovery", score: 19, definition: "Consciously balancing your physical, emotional, and mental resources." },
  { name: "Self-compassion", score: 16, definition: "Treating yourself with kindness, particularly during difficult times." },
  { name: "Prioritization", score: 16, definition: "Adapting priorities to business goals." },
  { name: "Driving Performance", score: 15, definition: "Boosting productivity and execution." },
  { name: "Encouraging Participation", score: 13, definition: "Creating an open, inclusive environment." },
  { name: "Clarity", score: 13, definition: "Having a clear awareness of your core values, strengths, and goals." },
  { name: "Strategic Thinking", score: 10, definition: "Establishing a long-term vision and strategy." },
  { name: "Emotional Regulation", score: 5, definition: "Effectively managing emotions, particularly in challenging situations." },
  { name: "Courageous Communication", score: 5, definition: "Embracing difficult conversations productively instead of avoiding them." },
];

export type ScoreTier = "strength" | "developing" | "priority";

export function tierFor(score: number): ScoreTier {
  if (score >= 55) return "strength";
  if (score >= 27) return "developing";
  return "priority";
}

export interface Book {
  title: string;
  author: string;
  why: string;
}

export interface Pillar {
  id: string;
  name: string;
  category: "leverage" | "gap";
  relatedSkills: string[]; // names, must match ASSESSMENT_SCORES
  whyItMatters: string;
  weeklyActions: string[];
  books: Book[];
  milestones: [string, string, string, string, string]; // one per roadmap phase
}

export const PILLARS: Pillar[] = [
  {
    id: "strategic-thinking",
    name: "Strategic Thinking",
    category: "gap",
    relatedSkills: ["Strategic Thinking", "Cognitive Agility", "Problem Solving"],
    whyItMatters:
      "This is the single widest gap between where you are (10/100) and what the seat requires. A CEO's core job is choosing what NOT to do — allocating scarce capital and attention across a multi-year horizon. Right now your strength is solving the problem in front of you (67); the shift is learning to pick which problems deserve to be in front of you at all.",
    weeklyActions: [
      "Block 90 min every Monday for a written 'strategy memo' — no meetings, no Slack, just a one-page view of where the business/your role should be in 3 years and why.",
      "Read one earnings call transcript or 10-K/annual-report a week from a company you admire; note the 3 bets they're making.",
      "Ask one 'why' beyond the obvious in every planning conversation this week — practice reframing tactical asks as strategic questions.",
    ],
    books: [
      { title: "Good Strategy Bad Strategy", author: "Richard Rumelt", why: "The clearest existing framework for telling real strategy apart from goal-setting." },
      { title: "Playing to Win", author: "A.G. Lafley & Roger Martin", why: "A practical 5-question cascade used at P&G — directly portable to any P&L." },
      { title: "The Strategist", author: "Cynthia Montgomery", why: "Reframes strategy as an ongoing act of leadership, not a one-time plan." },
    ],
    milestones: [
      "Write and revise a personal 3-year strategy memo quarterly",
      "Own the strategic plan for one product line or function",
      "Present a multi-year strategy to senior leadership and defend trade-offs",
      "Sit on a strategy or investment committee; influence capital allocation",
      "Set org-wide strategy and be measured on its outcome",
    ],
  },
  {
    id: "emotional-mastery",
    name: "Emotional Mastery",
    category: "gap",
    relatedSkills: ["Emotional Regulation", "Self-compassion", "Recovery"],
    whyItMatters:
      "Emotional Regulation (5) and Self-compassion (16) are your lowest scores. Executives are watched constantly for how they handle pressure — teams take their emotional cue from the person at the top. Low Recovery (19) means the tank is likely already running low, which makes regulation harder, not easier. This pillar is the foundation everything else stands on.",
    weeklyActions: [
      "Daily: 10-minute wind-down with no screens before sleep — protects the recovery window you're currently shortest on.",
      "After any conversation that spikes frustration, write 3 sentences before responding: what happened, what I felt, what I'll do. Delay the reply by at least 20 minutes.",
      "One full offline half-day every week — no exceptions, calendar-blocked like a client meeting.",
      "Weekly: name one thing you did imperfectly and consciously choose not to punish yourself for it.",
    ],
    books: [
      { title: "Self-Compassion", author: "Kristin Neff", why: "The research base for treating yourself like someone worth coaching, not punishing." },
      { title: "Why Has Nobody Told Me This Before", author: "Dr. Julie Smith", why: "Practical, non-woo tools for regulating in the moment." },
      { title: "Burnout", author: "Emily Nagoski & Amelia Nagoski", why: "Explains recovery as a physiological cycle you have to close, not a mood." },
    ],
    milestones: [
      "Build a daily recovery routine (sleep, offline blocks) that survives a bad week",
      "Handle one major setback without a visible emotional spillover to the team",
      "Be known as the calmest person in the room during a crisis",
      "Coach others through high-pressure moments using your own regulation practice",
      "Model sustainable pace for an entire organization",
    ],
  },
  {
    id: "flow-presence",
    name: "Flow State & Presence",
    category: "gap",
    relatedSkills: ["Focus", "Recovery", "Emotional Regulation"],
    whyItMatters:
      "Flow — the state Mihaly Csikszentmihalyi's research defines as complete absorption, where challenge matches skill, feedback is immediate, and self-consciousness disappears — is where peak decisions and peak output both live, and it's also the rare kind of intensity that restores you instead of draining you. But flow requires presence first: you can't merge with the task in front of you if part of your attention is still in yesterday's conversation or tomorrow's worry. That's the real gap here. Your Focus score (84) measures whether you concentrate ON the right priorities — it says nothing about whether you're actually inhabiting the moment while you do it. It's possible to be 'focused' on a to-do list while running on autopilot the whole time, which is exactly the 'I'm almost always somewhere else' pattern to interrupt. Presence is the specific, trainable skill under both flow and the Recovery and Emotional Regulation gaps above — you regulate an emotion by first noticing you're having it, in the moment, not five minutes later.",
    weeklyActions: [
      "Daily 10-minute presence practice — breath-focused, no goal beyond noticing when your mind has wandered and returning it. The noticing-and-returning IS the rep, not a failure of the practice.",
      "One single-tasking block a day: one tab, phone in another room, no context-switching. Treat the urge to switch as the thing you're training against, not a sign to give in.",
      "Before deep work, take 60 seconds to name the block's one clear goal and how you'll know it's done — the two conditions you can engineer to make flow more likely on demand.",
      "One fully phone-free walk or meal a week — no podcast, no music, nothing to hide behind.",
      "End each day by naming one moment, even two minutes long, where you were genuinely present rather than elsewhere — trains noticing presence, not just its absence.",
    ],
    books: [
      { title: "Flow", author: "Mihaly Csikszentmihalyi", why: "The original research defining the state itself — vocabulary for exactly what you're aiming at." },
      { title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", why: "Secular, practical mindfulness without the mysticism — the actual how-to behind the daily practice above." },
      { title: "The Power of Now", author: "Eckhart Tolle", why: "An unconventional but direct case for presence as the root skill under everything else on this list." },
    ],
    milestones: [
      "Build a daily presence practice that survives a genuinely busy week",
      "Enter flow deliberately at least 3x/week during real work, not just hobbies",
      "Be visibly, noticeably present in 1:1s — people register that you're actually there, not just in the room",
      "Use presence as an edge in high-stakes moments — steadiness under scrutiny reads as command of the room",
      "Presence stops being a practice you do and becomes the state you default to",
    ],
  },
  {
    id: "executive-communication",
    name: "Executive Communication",
    category: "gap",
    relatedSkills: ["Courageous Communication", "Clarity", "Active Listening"],
    whyItMatters:
      "Courageous Communication (5) is tied for your lowest score, and Clarity — knowing and stating your own values and goals (13) — is nearly as low. Together these mean the hard conversation is probably being avoided or arrives unclear. CEOs are paid disproportionately for saying the true, difficult thing clearly and on time.",
    weeklyActions: [
      "Identify the one conversation you're avoiding this week. Have it within 48 hours, in person or on a call — never over text.",
      "Before any conversation with stakes, write the outcome you want in one sentence. If you can't, don't have the conversation yet.",
      "Practice the 'say the headline first' rule: lead every update with the conclusion, not the narrative.",
      "One structured self-reflection per week: what are my top 3 values, and did this week's decisions match them?",
    ],
    books: [
      { title: "Radical Candor", author: "Kim Scott", why: "The most direct playbook for caring personally while challenging directly." },
      { title: "Crucial Conversations", author: "Patterson, Grenny, McMillan & Switzler", why: "Tactical, repeatable structure for exactly the conversations you're avoiding." },
      { title: "Difficult Conversations", author: "Douglas Stone, Bruce Patton & Sheila Heen", why: "Harvard Negotiation Project's model for separating facts, feelings, and identity in hard talks." },
    ],
    milestones: [
      "Have zero 'known but unsaid' issues sitting in your 1:1s for more than a week",
      "Deliver a hard message to a peer or senior leader without softening it into ambiguity",
      "Be the person people trust to tell them the truth, not just the polite version",
      "Set the communication standard for a whole leadership team",
      "Communicate a company-defining decision with clarity under public scrutiny",
    ],
  },
  {
    id: "execution",
    name: "Prioritization & Execution",
    category: "gap",
    relatedSkills: ["Prioritization", "Driving Performance", "Encouraging Participation"],
    whyItMatters:
      "You already have elite Focus (84) — the ability to go deep. What's missing is Prioritization (16) and Driving Performance (15): choosing the right target for that focus and then pushing a team, not just yourself, to hit it. High individual focus with low prioritization is a classic 'busy but not compounding' trap.",
    weeklyActions: [
      "Every Monday, write the top 3 outcomes for the week before opening email. Anything not on the list gets a deliberate 'not now.'",
      "End each week with a 10-minute written review: what moved the needle vs. what felt busy.",
      "In every team meeting, ask 'what does done look like, and by when' before the meeting ends.",
    ],
    books: [
      { title: "The One Thing", author: "Gary Keller & Jay Papasan", why: "A simple forcing function for picking the one priority that makes the rest easier." },
      { title: "Essentialism", author: "Greg McKeown", why: "The discipline of pursuing less, but better — a direct antidote to a low prioritization score." },
      { title: "The 4 Disciplines of Execution", author: "McChesney, Covey & Huling", why: "How to drive team performance against a small number of wildly important goals." },
    ],
    milestones: [
      "Run every week against 3 written priorities, reviewed and scored",
      "Own delivery of a cross-functional initiative end to end",
      "Drive a team's performance against a quarterly OKR set you defined",
      "Turn around an underperforming function's execution within two quarters",
      "Set and enforce the execution cadence for an entire company",
    ],
  },
  {
    id: "relationship-capital",
    name: "Relationship Capital",
    category: "gap",
    relatedSkills: ["Social Connection", "Mattering", "Recognition", "Empowerment", "Coaching"],
    whyItMatters:
      "Mattering (25) — your sense that your work makes a difference — is low, and it compounds with mid-tier Social Connection (53) and Coaching (41). CEOs run on relationship capital built years before they need it: the board that trusts you, the operators who'll follow you again, the mentors who'll vouch for you. This is the slowest-compounding pillar, which means it has to start now.",
    weeklyActions: [
      "One deliberate 'give without ask' per week: an intro, a piece of credit, useful feedback to someone senior to you.",
      "One coaching conversation per week with someone more junior — ask questions, resist giving the answer.",
      "Quarterly: reach out to 2 people outside your current company purely to stay connected, no agenda.",
    ],
    books: [
      { title: "Never Eat Alone", author: "Keith Ferrazzi", why: "Reframes networking as generosity practiced consistently, not a transaction before you need something." },
      { title: "Multipliers", author: "Liz Wiseman", why: "How the best leaders make everyone around them smarter and more capable." },
      { title: "How to Win Friends and Influence People", author: "Dale Carnegie", why: "Unfashionable but still the clearest primer on making people feel genuinely valued." },
    ],
    milestones: [
      "Build a standing monthly rhythm of outward-facing relationship touches",
      "Have 2-3 people who'd join your next venture without asking why",
      "Be sought out as a mentor inside and outside your org",
      "Have a board-caliber network you didn't have to build under time pressure",
      "Be the person other executives call before making a big decision",
    ],
  },
  {
    id: "leverage-strengths",
    name: "Leverage: Focus, Problem-Solving & Confidence",
    category: "leverage",
    relatedSkills: ["Focus", "Problem Solving", "Self-confidence", "Alignment", "Growth Mindset", "Conscious Collaboration"],
    whyItMatters:
      "These are already elite or strong (Focus 84, Problem Solving 67, Self-confidence 64, Alignment 60, Growth Mindset 57, Conscious Collaboration 57). The job here isn't to build them — it's to not let them over-run. High Focus without Prioritization becomes tunnel vision; high Self-confidence without Emotional Regulation becomes brittleness under real pressure. Point these strengths deliberately at the gaps above.",
    weeklyActions: [
      "Once a week, ask a peer: 'where did my confidence read as certainty when it should've read as a question?'",
      "Redirect one deep-focus block per week toward a Strategic Thinking or Relationship Capital action instead of default execution work.",
      "Keep a visible 'strengths ledger' — one line per week on how a top strength was deliberately aimed at a gap area.",
    ],
    books: [
      { title: "Mindset", author: "Carol Dweck", why: "Reinforces and sharpens the Growth Mindset you already score well on." },
      { title: "High Output Management", author: "Andrew Grove", why: "Channels focus and problem-solving into leverage — the output of others, not just yourself." },
    ],
    milestones: [
      "Consciously redirect strengths toward the 4 gap pillars weekly",
      "Use Alignment + Conscious Collaboration to unblock a cross-team conflict",
      "Be known for pairing high standards with real steadiness under pressure",
      "Mentor someone else on turning raw confidence into calibrated judgment",
      "Model 'strength without ego' at the executive level",
    ],
  },
];

export interface RoadmapPhase {
  id: string;
  label: string;
  years: string;
  theme: string;
  focus: string[];
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: "foundation",
    label: "Foundation",
    years: "Year 1",
    theme: "Self-mastery & credibility",
    focus: [
      "Close the Emotional Regulation / Recovery gap enough that pressure stops leaking onto the team",
      "Build the weekly Strategic Thinking and Prioritization habits from zero",
      "Have every avoided conversation within 48 hours — no exceptions",
    ],
  },
  {
    id: "scope",
    label: "Scope",
    years: "Year 2",
    theme: "Own a P&L or function",
    focus: [
      "Take ownership of a measurable business outcome, not just a project",
      "Run a team against a strategy you wrote and defended",
      "Relationship capital shifts from 'nice to have' to a working network",
    ],
  },
  {
    id: "scale",
    label: "Scale",
    years: "Year 3",
    theme: "Lead leaders",
    focus: [
      "Manage managers — coaching and empowerment become the primary lever, not direct execution",
      "Strategic Thinking output moves from a function to a multi-year org bet",
      "Emotional steadiness is visible under a real crisis, not just theoretical",
    ],
  },
  {
    id: "executive-readiness",
    label: "Executive Readiness",
    years: "Year 4",
    theme: "Board & exec exposure",
    focus: [
      "Present to and take questions from a board or investor committee",
      "Be the calibration point other executives check their judgment against",
      "Communication and clarity are now a leadership signature, not a work-on",
    ],
  },
  {
    id: "ceo-ready",
    label: "CEO-Ready",
    years: "Year 5",
    theme: "Step into the seat",
    focus: [
      "Every gap pillar has moved from 'priority' to at least 'developing'",
      "A track record exists: strategy set, team scaled, crisis survived, trust earned",
      "The network and board relationships exist before you need them",
    ],
  },
];

export interface HabitDefault {
  id: string;
  label: string;
  cadence: "daily" | "weekly";
  pillarId?: string;
}

export const DEFAULT_HABITS: HabitDefault[] = [
  { id: "h1", label: "10-min screen-free wind-down before bed", cadence: "daily", pillarId: "emotional-mastery" },
  { id: "h2", label: "Strength training or structured cardio", cadence: "daily" },
  { id: "h3", label: "Write top 3 outcomes before opening email", cadence: "daily", pillarId: "execution" },
  { id: "h4", label: "One 'say the headline first' update", cadence: "daily", pillarId: "executive-communication" },
  { id: "h13", label: "10-min presence practice (breath, notice, return)", cadence: "daily", pillarId: "flow-presence" },
  { id: "h14", label: "One single-tasking block — one tab, phone away", cadence: "daily", pillarId: "flow-presence" },
  { id: "h5", label: "90-min strategy memo block", cadence: "weekly", pillarId: "strategic-thinking" },
  { id: "h15", label: "Phone-free walk or meal, no podcast/music", cadence: "weekly", pillarId: "flow-presence" },
  { id: "h6", label: "Have the conversation you're avoiding", cadence: "weekly", pillarId: "executive-communication" },
  { id: "h7", label: "One coaching conversation with a junior colleague", cadence: "weekly", pillarId: "relationship-capital" },
  { id: "h8", label: "One 'give without ask' — intro, credit, or feedback", cadence: "weekly", pillarId: "relationship-capital" },
  { id: "h9", label: "Full offline half-day, calendar-blocked", cadence: "weekly", pillarId: "emotional-mastery" },
  { id: "h10", label: "Read one earnings call, 10-K, or long-form strategy piece", cadence: "weekly", pillarId: "strategic-thinking" },
  { id: "h11", label: "Friday review: what moved the needle vs. felt busy", cadence: "weekly", pillarId: "execution" },
  { id: "h12", label: "Meal-prep or plan next week's protein-forward meals", cadence: "weekly" },
];

export interface HealthPlan {
  exercise: string[];
  nutrition: string[];
  sleep: string[];
}

export const HEALTH_PLAN: HealthPlan = {
  exercise: [
    "4x/week strength training (compound lifts — squat, hinge, push, pull, carry) — executive stamina is a physical trait, not just a mental one.",
    "2x/week zone-2 cardio, 30-45 min — builds the recovery capacity your Recovery score (19) says you're currently missing.",
    "Daily 10-minute mobility/stretch — protects the joints that a decade of desk-and-flight life will otherwise take from you.",
    "One full rest day a week, genuinely off — recovery is trained the same way strength is.",
  ],
  nutrition: [
    "Protein-forward meals (aim ~1.6g/kg bodyweight/day) — stabilizes energy and mood across long decision-heavy days.",
    "Caffeine cutoff 8+ hours before bed — protects the sleep that Recovery and Emotional Regulation both depend on.",
    "Alcohol as an occasional choice, not a nightly decompression tool — it quietly taxes the same recovery system you're trying to rebuild.",
    "Hydration target visible on the desk — dehydration reads as fatigue and gets misdiagnosed as low motivation.",
  ],
  sleep: [
    "7-8 hours, consistent wake time even on weekends — the highest-leverage lever for both Emotional Regulation and Self-compassion.",
    "No phone in the last 30 minutes before bed — pairs directly with the daily wind-down habit above.",
    "Treat a bad night as data, not a moral failure — this is the Self-compassion practice in physical form.",
  ],
};

export const VISION =
  "Become CEO-ready within 4-5 years by closing the gap between elite individual execution (Focus, Problem Solving, Confidence) and the muscles a CEO is actually paid for: strategic thinking, emotional steadiness under pressure, courageous communication, ruthless prioritization, and relationship capital built well before it's needed.";
