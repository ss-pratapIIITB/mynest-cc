import { logout } from "@/app/ceo/actions";
import ScoreChart from "@/components/ceo/score-chart";
import RoadmapTimeline from "@/components/ceo/roadmap-timeline";
import PillarCard from "@/components/ceo/pillar-card";
import DailyPlanner from "@/components/ceo/daily-planner";
import DailyCheckin from "@/components/ceo/daily-checkin";
import PresenceReset from "@/components/ceo/presence-reset";
import BookShelf from "@/components/ceo/book-shelf";
import PodcastList from "@/components/ceo/podcast-list";
import { PILLARS, HEALTH_PLAN, VISION } from "@/lib/ceo-plan";

export const dynamic = "force-dynamic";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-mono text-[10px] tracking-widest mb-3" style={{ color: "var(--subtle)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function CeoDashboardPage() {
  const gapPillars = PILLARS.filter((p) => p.category === "gap");
  const leveragePillars = PILLARS.filter((p) => p.category === "leverage");

  return (
    <main className="min-h-screen px-4 sm:px-8 py-10 max-w-4xl mx-auto" style={{ background: "var(--bg)" }}>
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: "var(--accent)" }}>
            CEO DEVELOPMENT PLAN — 4-5 YEAR HORIZON
          </p>
          <h1 className="font-mono text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text)" }}>
            {VISION}
          </h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex-shrink-0 font-mono text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            log out
          </button>
        </form>
      </header>

      <Section title="TODAY — MIND & BODY CHECK-IN">
        <div className="space-y-4">
          <DailyCheckin />
          <PresenceReset />
        </div>
      </Section>

      <Section title="STRENGTHS & GROWTH AREAS — WHOLE PERSON ASSESSMENT">
        <ScoreChart />
      </Section>

      <Section title="5-YEAR ROADMAP">
        <RoadmapTimeline />
      </Section>

      <Section title="PRIORITY GAP PILLARS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gapPillars.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </div>
      </Section>

      <Section title="LEVERAGE PILLARS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leveragePillars.map((p) => (
            <PillarCard key={p.id} pillar={p} />
          ))}
        </div>
      </Section>

      <Section title="HEALTH & RECOVERY">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(
            [
              ["Exercise", HEALTH_PLAN.exercise],
              ["Nutrition", HEALTH_PLAN.nutrition],
              ["Sleep", HEALTH_PLAN.sleep],
            ] as const
          ).map(([label, items]) => (
            <div key={label} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                {label.toUpperCase()}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="font-mono text-[10px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="THE READING LIST">
        <BookShelf />
      </Section>

      <Section title="PODCASTS & AUDIO">
        <PodcastList />
      </Section>

      <Section title="DAY-TO-DAY PLANNER — EDIT FREELY, IT'S YOURS">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <DailyPlanner />
        </div>
      </Section>

      <p className="font-mono text-[9px] text-center" style={{ color: "var(--subtle)" }}>
        stored locally in this browser only · not synced anywhere
      </p>
    </main>
  );
}
