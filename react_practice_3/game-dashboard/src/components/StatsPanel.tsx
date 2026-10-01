import { Character } from "../types/character";

interface Props {
  characters: Character[];
}

export default function StatsPanel({ characters }: Props) {
  console.log("[render] StatsPanel");
  const count = (s: Character["status"]) => characters.filter((c) => c.status === s).length;
  const stats = [
    { label: "Total", value: characters.length },
    { label: "Active", value: count("Active") },
    { label: "Training", value: count("Training") },
    { label: "Resting", value: count("Resting") },
  ];
  return (
    <section className="stats" aria-label="Statistics">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  );
}
