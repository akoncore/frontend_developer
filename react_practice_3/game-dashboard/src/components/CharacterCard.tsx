import { useState } from "react";
import { Character, Status, STATUSES } from "../types/character";

interface Props {
  character: Character;
  onRemove: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
}

type Equipment = "None" | "Iron set" | "Arcane set" | "Shadow set";
const EQUIPMENT: Equipment[] = ["None", "Iron set", "Arcane set", "Shadow set"];

export default function CharacterCard({ character, onRemove, onStatusChange }: Props) {
  // LOCAL STATE: owned by this card instance only. React ties it to the card's
  // identity (position in the tree + key), not to the character data.
  const [equipment, setEquipment] = useState<Equipment>("None");
  const [favorite, setFavorite] = useState(false);

  // Runs when the parent re-renders (new props) or when this card's own state changes.
  console.log(`[render] CharacterCard #${character.id} ${character.name}`);

  const reset = () => {
    setEquipment("None");
    setFavorite(false);
  };

  return (
    <article className={`card role-${character.role.toLowerCase()}`}>
      <div className="card-top">
        <h3>{favorite && <span aria-label="Favorite">★ </span>}{character.name}</h3>
        <button type="button" className="icon-btn" onClick={() => onRemove(character.id)} aria-label={`Remove ${character.name}`}>×</button>
      </div>
      <div className="badges">
        <span className="badge role">{character.role}</span>
        <span className={`badge status-${character.status.toLowerCase()}`}>{character.status}</span>
      </div>
      <p className="meta">Level {character.level}, {character.xp} XP</p>

      <label>
        Status
        <select value={character.status} onChange={(e) => onStatusChange(character.id, e.target.value as Status)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Equipment (local)
        <select value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)}>
          {EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>{eq}</option>
          ))}
        </select>
      </label>

      <div className="card-actions">
        <button type="button" className={`btn ${favorite ? "primary" : ""}`} aria-pressed={favorite} onClick={() => setFavorite((f) => !f)}>
          {favorite ? "Favorited" : "Favorite"}
        </button>
        <button type="button" className="btn" onClick={reset}>Reset local state</button>
      </div>
    </article>
  );
}
