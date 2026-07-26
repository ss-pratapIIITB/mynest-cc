// The reading & listening list. Every entry carries a reason it earns a
// place on a CEO-track list specifically — not just "good business book."
// Curated for depth over a round number; add to it freely.

export interface BookEntry {
  title: string;
  author: string;
  why: string;
}

export interface BookCategory {
  id: string;
  name: string;
  books: BookEntry[];
}

export const BOOK_CATEGORIES: BookCategory[] = [
  {
    id: "strategy",
    name: "Strategy & Competitive Advantage",
    books: [
      { title: "Good Strategy Bad Strategy", author: "Richard Rumelt", why: "The clearest existing framework for telling real strategy apart from goal-setting dressed up as a plan." },
      { title: "Playing to Win", author: "A.G. Lafley & Roger Martin", why: "A practical 5-question cascade used at P&G — directly portable to any P&L, not just theory." },
      { title: "The Strategist", author: "Cynthia Montgomery", why: "Reframes strategy as an ongoing act of leadership rather than a one-time plan you file and forget." },
      { title: "Competitive Strategy", author: "Michael Porter", why: "The foundational Five Forces framework — every modern strategy book is either building on this or arguing against it." },
      { title: "7 Powers", author: "Hamilton Helmer", why: "The framework most working VCs and operators actually reach for now — sharper and more testable than Porter for a builder's day-to-day decisions." },
      { title: "The Innovator's Dilemma", author: "Clayton Christensen", why: "Explains why great, well-run companies still miss disruption — essential the moment you're defending an incumbent position instead of attacking one." },
      { title: "The Innovator's Solution", author: "Clayton Christensen & Michael Raynor", why: "The constructive follow-up: how to build the disruptive business, not just recognize one coming for you." },
      { title: "Blue Ocean Strategy", author: "W. Chan Kim & Renée Mauborgne", why: "Reframes strategy as creating uncontested market space instead of fighting over existing demand — a useful counterweight to pure Porter-style rivalry thinking." },
    ],
  },
  {
    id: "execution",
    name: "Execution, Operations & Scaling",
    books: [
      { title: "High Output Management", author: "Andrew Grove", why: "Channels your existing Focus and Problem Solving strengths into leverage — the output of others, not just yourself." },
      { title: "The 4 Disciplines of Execution", author: "McChesney, Covey & Huling", why: "How to drive team performance against a small number of wildly important goals — direct antidote to a low Driving Performance score." },
      { title: "Measure What Matters", author: "John Doerr", why: "The OKR bible. A concrete, adoptable system for the Prioritization gap that currently sits at 16/100." },
      { title: "Scaling Up", author: "Verne Harnish", why: "The most concrete operating system for the exact transition your roadmap calls for — founder-led to process-led." },
      { title: "Traction", author: "Gino Wickman", why: "A simpler, more mechanical alternative operating system (EOS) to Scaling Up — worth reading both and picking pieces from each." },
      { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", why: "A no-varnish account of operational decisions with no clean answer — a vaccination against boardroom-slide thinking." },
      { title: "The Effective Executive", author: "Peter Drucker", why: "The original 'time is the scarcest resource' text. Still the tightest 200 pages ever written on personal executive effectiveness." },
      { title: "Work Rules!", author: "Laszlo Bock", why: "Google's people-ops playbook — most useful once a team scales past what you can manage by direct contact alone." },
    ],
  },
  {
    id: "finance",
    name: "Finance, Capital Allocation & Business Acumen",
    books: [
      { title: "The Outsiders", author: "William Thorndike", why: "Case studies of CEOs whose entire edge was capital allocation, not operations — arguably the single most CEO-specific book on this list." },
      { title: "Poor Charlie's Almanack", author: "Charles T. Munger", why: "Multidisciplinary mental models applied directly to business and investing judgment, from the clearest thinker on the subject." },
      { title: "The Essays of Warren Buffett", author: "ed. Lawrence Cunningham", why: "Buffett's own words on capital allocation, moats, and incentives — curated and annotated rather than paraphrased by a biographer." },
      { title: "Financial Intelligence for Entrepreneurs", author: "Karen Berman & Joe Knight", why: "Plain-English finance built for operators, not the MBA-textbook version most CEOs never actually needed." },
      { title: "The Interpretation of Financial Statements", author: "Benjamin Graham", why: "Short and foundational — teaches you to read a balance sheet like an owner deciding what to do next, not an analyst issuing a rating." },
      { title: "Damodaran on Valuation", author: "Aswath Damodaran", why: "The deeper reference once you need to argue rigorously about what a business or a deal is actually worth." },
    ],
  },
  {
    id: "leadership",
    name: "Leadership & Building Teams",
    books: [
      { title: "Multipliers", author: "Liz Wiseman", why: "How the best leaders make everyone around them smarter and more capable — the mechanism for turning your Alignment strength into team output." },
      { title: "The Five Dysfunctions of a Team", author: "Patrick Lencioni", why: "The clearest model for why teams stall (trust → conflict → commitment → accountability → results); maps directly onto your low Encouraging Participation score." },
      { title: "Team of Teams", author: "Gen. Stanley McChrystal", why: "How to keep small-team adaptability at large-org scale — a direct answer to the 'leading leaders' phase of your roadmap." },
      { title: "Leaders Eat Last", author: "Simon Sinek", why: "Argues psychological safety, not charisma, is the real leadership lever — relevant given your low Mattering and Recognition scores." },
      { title: "Principles", author: "Ray Dalio", why: "A systemized, sometimes extreme, framework for radical transparency and decision-making at scale — take the frameworks, leave the culture wholesale." },
      { title: "The Making of a Manager", author: "Julie Zhuo", why: "The best 'first 90 days as a manager' book — worth revisiting even past that stage as a fundamentals check." },
      { title: "Turn the Ship Around!", author: "L. David Marquet", why: "A submarine captain's model for pushing authority down to where the information actually is — directly useful given your low Empowerment score." },
    ],
  },
  {
    id: "communication",
    name: "Communication, Negotiation & Influence",
    books: [
      { title: "Radical Candor", author: "Kim Scott", why: "The most direct playbook for caring personally while challenging directly — built for your lowest score, Courageous Communication." },
      { title: "Crucial Conversations", author: "Patterson, Grenny, McMillan & Switzler", why: "A tactical, repeatable structure for exactly the conversations you're currently avoiding." },
      { title: "Difficult Conversations", author: "Stone, Patton & Heen", why: "Harvard Negotiation Project's model for separating facts, feelings, and identity in hard talks — pairs well with Crucial Conversations rather than repeating it." },
      { title: "Never Split the Difference", author: "Chris Voss", why: "An FBI hostage negotiator's tactics — the most practical negotiation book available, built for real stakes rather than classroom game theory." },
      { title: "Influence", author: "Robert Cialdini", why: "The canonical reference on the psychological levers of persuasion — understand them so they're never used on you unknowingly." },
      { title: "Made to Stick", author: "Chip Heath & Dan Heath", why: "Why some ideas spread and others don't — useful for translating strategy into a message a whole company actually remembers." },
    ],
  },
  {
    id: "judgment",
    name: "Decision-Making & Judgment",
    books: [
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", why: "The foundational text on cognitive bias — nearly every 'gut call gone wrong' traces back to a bias named in this book." },
      { title: "The Great Mental Models (Vol. 1-3)", author: "Shane Parrish", why: "A practical index of the mental models Poor Charlie's Almanack references without fully explaining." },
      { title: "Superforecasting", author: "Philip Tetlock & Dan Gardner", why: "What actually predicts good judgment under uncertainty (it's not confidence) — a direct complement to your low Strategic Thinking score." },
      { title: "Noise", author: "Kahneman, Sibony & Sunstein", why: "The underrated sequel to Thinking, Fast and Slow — unwanted variability in judgment is often a bigger problem than bias." },
      { title: "Range", author: "David Epstein", why: "The case for generalists over specialists in complex, uncertain domains — a defense of staying broad, not just deep, as you climb." },
    ],
  },
  {
    id: "psychology",
    name: "Psychology, Behavior & Emotional Mastery",
    books: [
      { title: "Self-Compassion", author: "Kristin Neff", why: "The research base for treating yourself like someone worth coaching, not punishing — direct work on your lowest self-compassion score." },
      { title: "Why Has Nobody Told Me This Before", author: "Dr. Julie Smith", why: "Practical, non-abstract tools for regulating in the moment — built for your lowest score, Emotional Regulation." },
      { title: "Burnout", author: "Emily Nagoski & Amelia Nagoski", why: "Explains recovery as a physiological cycle you have to close, not a mood — directly relevant to your Recovery score of 19." },
      { title: "Emotional Intelligence", author: "Daniel Goleman", why: "The book that made 'EQ matters more than IQ at the top' a mainstream, evidence-backed idea." },
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", why: "Explains why unresolved stress shows up physically — worth reading given your own brain fog and back pain, not as therapy but as grounding in the mind-body link." },
      { title: "Atlas of the Heart", author: "Brené Brown", why: "A precise vocabulary for naming emotional states — the prerequisite for Clarity, your lowest self-awareness score, and for regulating what you can't yet name." },
    ],
  },
  {
    id: "flow-presence",
    name: "Flow, Presence & Attention",
    books: [
      { title: "Flow", author: "Mihaly Csikszentmihalyi", why: "The original research defining the state itself — the vocabulary for exactly what deep, restorative peak performance actually is." },
      { title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", why: "Secular, practical mindfulness without the mysticism — the clearest how-to for a daily presence practice." },
      { title: "The Power of Now", author: "Eckhart Tolle", why: "Unconventional for a business list, but the most direct case available for presence as the root skill under everything else, including flow." },
      { title: "Full Catastrophe Living", author: "Jon Kabat-Zinn", why: "The full clinical program behind mindfulness-based stress reduction — deeper and more structured than the primer above." },
      { title: "The Rise of Superman", author: "Steven Kotler", why: "Flow-state research applied to extreme performers — concrete, engineerable triggers rather than abstract theory." },
      { title: "Stealing Fire", author: "Steven Kotler & Jamie Wheal", why: "How top performers and organizations access altered/flow states deliberately and at scale — a natural next step once a basic daily practice is in place." },
      { title: "10% Happier", author: "Dan Harris", why: "A skeptical journalist's account of adopting meditation — useful if the spiritual framing elsewhere on this list is a barrier for you specifically." },
    ],
  },
  {
    id: "founders",
    name: "Founder Stories & Company Case Studies",
    books: [
      { title: "Shoe Dog", author: "Phil Knight", why: "The best-written founder memoir available — visceral honesty about doubt that most business books sand off entirely." },
      { title: "The Everything Store", author: "Brad Stone", why: "Amazon's rise as a long-run case study in relentless prioritization and long-term thinking over quarterly optics." },
      { title: "Steve Jobs", author: "Walter Isaacson", why: "A warts-and-all biography — a useful cautionary tale on where high self-confidence curdles into something a team can't survive." },
      { title: "Elon Musk", author: "Walter Isaacson", why: "Same lens on a more recent, more extreme case — read critically, as a warning as much as a template." },
      { title: "Founders at Work", author: "Jessica Livingston", why: "First-person startup origin stories, told close to the moment — a useful antidote to the survivorship-bias narratives told years later." },
      { title: "Barbarians at the Gate", author: "Bryan Burrough & John Helyar", why: "The RJR Nabisco buyout — the best case study ever written on what capital and ego actually do at the very top." },
    ],
  },
  {
    id: "systems",
    name: "Habits, Focus & Personal Systems",
    books: [
      { title: "The One Thing", author: "Gary Keller & Jay Papasan", why: "A simple forcing function for picking the one priority that makes the rest easier — direct fit for the Prioritization gap." },
      { title: "Essentialism", author: "Greg McKeown", why: "The discipline of pursuing less, but better — a direct antidote to a low prioritization score paired with a very high Focus score." },
      { title: "Atomic Habits", author: "James Clear", why: "The best-known, most rigorously simple habit-formation framework — the mechanical layer under every habit in your daily planner." },
      { title: "Deep Work", author: "Cal Newport", why: "Makes the case for protecting the exact kind of uninterrupted block your Strategic Thinking habit already asks for." },
      { title: "Four Thousand Weeks", author: "Oliver Burkeman", why: "A corrective to productivity culture itself — finitude as the starting assumption, not a problem to optimize away." },
    ],
  },
  {
    id: "health",
    name: "Health, Energy & Longevity",
    books: [
      { title: "Why We Sleep", author: "Matthew Walker", why: "The definitive case for sleep as a performance lever, not a luxury — directly relevant to your Recovery score and reported brain fog." },
      { title: "Outlive", author: "Peter Attia", why: "Reframes health as a long-game strategic project run with real rigor — a natural fit for how you already think about the business." },
      { title: "Spark", author: "John Ratey", why: "The exercise-cognition link explained — the evidence behind why strength training and cardio are in your health plan at all." },
      { title: "The Comfort Crisis", author: "Michael Easter", why: "A case for deliberate physical discomfort as a tool against exactly the kind of low-grade avoidance — of pain, of hard conversations — visible in your gap scores." },
    ],
  },
  {
    id: "philosophy",
    name: "Philosophy & Long-Term Thinking",
    books: [
      { title: "Meditations", author: "Marcus Aurelius", why: "The original executive journal — a Roman emperor's private notes on staying steady under total, undelegable pressure." },
      { title: "The Obstacle Is the Way", author: "Ryan Holiday", why: "Modern, readable Stoicism applied directly to setbacks — a good on-ramp before Meditations itself." },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", why: "Meaning as the thing that makes hardship bearable — relevant to your low Mattering score at a depth no business book reaches." },
    ],
  },
  {
    id: "networks",
    name: "Networks, Power & Influence Building",
    books: [
      { title: "Never Eat Alone", author: "Keith Ferrazzi", why: "Reframes networking as generosity practiced consistently, not a transaction attempted right before you need something." },
      { title: "Give and Take", author: "Adam Grant", why: "Evidence that 'givers' often win long-term — a healthier, better-supported counterweight to zero-sum power thinking." },
      { title: "The 48 Laws of Power", author: "Robert Greene", why: "Read as a map of how power actually gets used against you, not a script to emulate — useful precisely because it's uncomfortable." },
    ],
  },
];

export interface PodcastEntry {
  name: string;
  host: string;
  why: string;
}

export interface PodcastCategory {
  id: string;
  name: string;
  shows: PodcastEntry[];
}

export const PODCAST_CATEGORIES: PodcastCategory[] = [
  {
    id: "operators",
    name: "Operators & Builders",
    shows: [
      { name: "Contrarian Thinking", host: "Codie Sanchez", why: "Buying and operating unglamorous, cash-flowing businesses — a direct counterweight to hype-driven thinking, useful given your own Prioritization and Execution gap." },
      { name: "Founders", host: "David Senra", why: "Reads a business biography every episode and extracts the operating principles — effectively an audio companion to the Founder Stories shelf above." },
      { name: "My First Million", host: "Sam Parr & Shaan Puri", why: "Idea generation and blunt operator banter — keeps you close to what's actually working right now, not just theory." },
      { name: "How I Built This", host: "Guy Raz", why: "Founder origin stories, shorter and more accessible than Acquired — good for the empathy side of leadership, not just the mechanics." },
      { name: "Lenny's Podcast", host: "Lenny Rachitsky", why: "Product, growth, and operating tactics from practitioners at top tech companies — most useful once you're closer to owning a P&L." },
    ],
  },
  {
    id: "investing",
    name: "Investing, Money & Capital Allocation",
    shows: [
      { name: "Naval", host: "Naval Ravikant", why: "The clearest living voice on leverage, wealth creation without a boss, and rational happiness — foundational listening for a CEO-track mindset." },
      { name: "Invest Like the Best", host: "Patrick O'Shaughnessy", why: "Long-form conversations with elite investors and operators on decision-making and business models, rarely dumbed down." },
      { name: "Acquired", host: "Ben Gilbert & David Rosenthal", why: "Multi-hour deep dives into individual companies (Nvidia, Costco, Hermès) — the closest audio equivalent to a strategy MBA elective." },
      { name: "Capital Allocators", host: "Ted Seides", why: "How the best investors actually allocate capital and manage portfolios — a direct audio companion to The Outsiders." },
      { name: "Business Breakdowns", host: "Colossus", why: "Shorter, single-company deep dives — a lighter-weight companion to Acquired for a commute-length listen." },
    ],
  },
  {
    id: "big-ideas",
    name: "Strategy & Big Ideas",
    shows: [
      { name: "The Knowledge Project", host: "Shane Parrish", why: "Mental models and judgment — the podcast counterpart to The Great Mental Models on the shelf above." },
      { name: "Masters of Scale", host: "Reid Hoffman", why: "Scaling-specific stories from founders who lived through exactly the 'Scale' phase this roadmap is aiming at." },
      { name: "All-In Podcast", host: "Chamath Palihapitiya, Jason Calacanis, David Sacks & David Friedberg", why: "Unfiltered operator/investor takes on the news cycle — good practice pattern-matching current events to business fundamentals fast." },
      { name: "Dwarkesh Podcast", host: "Dwarkesh Patel", why: "Dense, technical conversations with researchers and founders on where technology and the economy are actually headed — a workout for the long-horizon thinking Strategic Thinking requires." },
      { name: "No Priors", host: "Sarah Guo & Elad Gil", why: "Fast-moving conversations on AI and company-building at the frontier — useful for spotting the next Innovator's Dilemma before it arrives." },
      { name: "Prof G Markets / The Prof G Pod", host: "Scott Galloway", why: "Blunt, occasionally uncomfortable business and career commentary — a useful gut-check against your own blind spots." },
    ],
  },
  {
    id: "health-mind",
    name: "Health, Mind & Performance",
    shows: [
      { name: "Huberman Lab", host: "Andrew Huberman", why: "Rigorous, protocol-driven neuroscience on sleep, focus, and stress — the most direct scientific backing for your health plan and a likely source of concrete brain-fog fixes." },
      { name: "Modern Wisdom", host: "Chris Williamson", why: "Wide-ranging conversations spanning psychology, health, and philosophy — a strong fit for the Emotional Mastery pillar specifically." },
      { name: "Diary of a CEO", host: "Steven Bartlett", why: "Long-form, emotionally candid interviews — useful for the Emotional Regulation and Clarity gaps since guests talk openly about failure and identity, not just wins." },
      { name: "The Tim Ferriss Show", host: "Tim Ferriss", why: "Long-form deconstruction of high performers' routines and decision rules across every domain, not just business." },
    ],
  },
];
