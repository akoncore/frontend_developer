import { ArrowUpRight } from "lucide-react";
import type { Project } from "../types";
import { useReveal } from "../hooks/useReveal";

interface ProjectsProps {
  items: Project[];
}

export default function Projects({ items }: ProjectsProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="projects" className="bg-lavender-50 px-6 pb-24 sm:px-10">
      <div ref={ref} className={`reveal mx-auto max-w-6xl ${visible ? "is-visible" : ""}`}>
        <p className="text-sm font-medium text-violet-600">Projects</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          Things I've built
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {items.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-semibold text-ink">{project.name}</h3>
                <ArrowUpRight
                  size={18}
                  className="text-violet-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="mt-2 text-sm text-muted">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-lavender-100 px-3 py-1 text-xs font-medium text-violet-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
