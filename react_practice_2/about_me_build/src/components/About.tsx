import { Puzzle, Sparkles, Users, Rocket, Lightbulb, ArrowUpRight } from "lucide-react";
import type { AboutData } from "../types";
import { useReveal } from "../hooks/useReveal";

const ICONS = { puzzle: Puzzle, sparkles: Sparkles, users: Users, rocket: Rocket };

const TAG_STYLES: Record<string, string> = {
  blue: "bg-blue-400/15 text-blue-700 dark:text-blue-300",
  purple: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  mint: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
  yellow: "bg-amber-400/20 text-amber-700 dark:text-amber-300",
};

export default function About({
  label,
  heading,
  highlighted,
  paragraphs,
  features,
  skills,
  goal,
}: AboutData) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="bg-lavender-50 px-6 py-24 sm:px-10">
      <div
        ref={ref}
        className={`reveal mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] ${
          visible ? "is-visible" : ""
        }`}
      >
        {/* Left column */}
        <div>
          <p className="text-sm font-medium text-violet-600">{label}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            {heading}{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              {highlighted}
            </span>
          </h2>

          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Icon size={18} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">{feature.title}</p>
                  <p className="text-sm text-muted">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-lavender-100 p-7">
            <h3 className="font-display text-lg font-semibold text-ink">What I work with</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${TAG_STYLES[skill.tone]}`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-7 text-white">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Lightbulb size={18} />
              </span>
              <h3 className="font-display mt-3 text-lg font-semibold">My Goals</h3>
              <p className="mt-2 max-w-xs text-sm text-white/80">{goal}</p>
            </div>
            <ArrowUpRight className="mt-1 shrink-0 text-white/70" size={20} />
          </div>
        </div>
      </div>
    </section>
  );
}
