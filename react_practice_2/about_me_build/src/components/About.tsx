import {
  Puzzle,
  Sparkles,
  Users,
  Rocket,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";
import type { AboutData } from "../types";
import { useReveal } from "../hooks/useReveal";

const ICONS = {
  puzzle: Puzzle,
  sparkles: Sparkles,
  users: Users,
  rocket: Rocket,
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
    <section id="about" className="about-section">
      <div
        ref={ref}
        className={`about-container reveal ${
          visible ? "is-visible" : ""
        }`}
      >
        {/* Left column */}
        <div>
          <p className="about-label">{label}</p>

          <h2 className="about-heading">
            {heading}{" "}
            <span className="about-highlight">
              {highlighted}
            </span>
          </h2>

          <div className="about-paragraphs">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = ICONS[feature.icon];

              return (
                <div
                  key={feature.title}
                  className="feature-card"
                >
                  <span className="feature-icon">
                    <Icon size={18} />
                  </span>

                  <p className="feature-title">
                    {feature.title}
                  </p>

                  <p className="feature-text">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="about-right">
          <div className="skills-card">
            <h3 className="about-card-title">
              What I work with
            </h3>

            <div className="skills-list">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className={`skill-tag skill-${skill.tone}`}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div className="goals-card">
            <div>
              <span className="goal-icon">
                <Lightbulb size={18} />
              </span>

              <h3 className="goal-title">
                My Goals
              </h3>

              <p className="goal-text">
                {goal}
              </p>
            </div>

            <ArrowUpRight
              className="goal-arrow"
              size={20}
            />
          </div>
        </div>
      </div>
    </section>
  );
}