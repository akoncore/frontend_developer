import { ArrowUpRight } from "lucide-react";
import type { Project } from "../types";
import { useReveal } from "../hooks/useReveal";

interface ProjectsProps {
  items: Project[];
}

export default function Projects({ items }: ProjectsProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="projects" className="projects-section">
      <div
        ref={ref}
        className={`projects-container reveal ${visible ? "is-visible" : ""}`}
      >
        <p className="projects-label">Projects</p>

        <h2 className="projects-title">
          Things I've built
        </h2>

        <div className="projects-grid">
          {items.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="project-card"
            >
              <div className="project-header">
                <h3 className="project-name">{project.name}</h3>

                <ArrowUpRight
                  size={18}
                  className="project-icon"
                />
              </div>

              <p className="project-description">
                {project.description}
              </p>

              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-tag">
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