import type { AboutData } from "../types";

export default function About({ paragraphs, skills }: AboutData) {
  return (
    <section className="section" aria-labelledby="about-title">
      <h2 id="about-title">About me</h2>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
      <ul className="chips">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}
