import { PODCAST_CATEGORIES } from "@/lib/ceo-library";

export default function PodcastList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PODCAST_CATEGORIES.map((cat) => (
        <div key={cat.id} className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            {cat.name.toUpperCase()}
          </p>
          <ul className="space-y-3">
            {cat.shows.map((s) => (
              <li key={s.name}>
                <p className="font-mono text-[11px]" style={{ color: "var(--text)" }}>
                  {s.name} <span style={{ color: "var(--muted)" }}>— {s.host}</span>
                </p>
                <p className="font-mono text-[10px] leading-relaxed mt-0.5" style={{ color: "var(--subtle)" }}>
                  {s.why}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
