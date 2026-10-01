import { useState } from "react";
import { NewCharacter, Role, ROLES } from "../types/character";

interface Props {
  onAdd: (c: NewCharacter) => void;
}

export default function CharacterForm({ onAdd }: Props) {
  // Local state of the form: typing re-renders only this component, not App.
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Warrior");
  const [level, setLevel] = useState("1");
  const [error, setError] = useState("");
  console.log("[render] CharacterForm");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lvl = Number(level);
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (!Number.isInteger(lvl) || lvl < 1 || lvl > 99) return setError("Level must be a whole number from 1 to 99.");
    onAdd({ name: name.trim(), role, level: lvl }); // child -> parent communication via a prop callback
    setName("");
    setLevel("1");
    setError("");
  };

  return (
    <form className="panel" onSubmit={submit} noValidate>
      <h2>Recruit character</h2>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Thorin" />
      </label>
      <label>
        Role
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        Level
        <input type="number" min={1} max={99} value={level} onChange={(e) => setLevel(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn primary">Add character</button>
    </form>
  );
}
