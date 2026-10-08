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
  const [equipment, setEquipment] = useState<Equipment>("None");
  const [favorite, setFavorite] = useState(false);

  // Runs when the parent re-renders (new props) or when this card's own state changes.
  console.log(`[render] CharacterCard #${character.id} ${character.name}`);

  const reset = () => {
    setEquipment("None");
    setFavorite(false);
  };

  return (
    <article className={`character-card role-${character.role.toLowerCase()}`}>
    <div className="character-card-header">
      <div className="character-avatar">
        {character.name.charAt(0).toUpperCase()}
      </div>

      <div className="character-title">
        <div className="character-name-row">
          <h3>{character.name}</h3>

          {favorite && (
            <span className="favorite-star" aria-label="Favorite">
              ★
            </span>
          )}
        </div>

        <span className="character-id">
          ID #{character.id}
        </span>
      </div>

      <button
        type="button"
        className="remove-btn"
        onClick={() => onRemove(character.id)}
        aria-label={`Remove ${character.name}`}
      >
        ×
      </button>
    </div>

    <div className="character-info">
      <div className="info-item">
        <span className="info-label">ROLE</span>
        <span className="badge role-badge">
          {character.role}
        </span>
      </div>

      <div className="info-item">
        <span className="info-label">STATUS</span>
        <span className={`badge status-${character.status.toLowerCase()}`}>
          {character.status}
        </span>
      </div>

      <div className="info-item">
        <span className="info-label">LEVEL</span>
        <strong>{character.level}</strong>
      </div>

      <div className="info-item">
        <span className="info-label">XP</span>
        <strong>{character.xp}</strong>
      </div>
    </div>

    <div className="character-controls">
      <label>
        <span>Status</span>

        <select
          value={character.status}
          onChange={(e) =>
            onStatusChange(
              character.id,
              e.target.value as Status
            )
          }
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Equipment</span>

        <select
          value={equipment}
          onChange={(e) =>
            setEquipment(e.target.value as Equipment)
          }
        >
          {EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </select>
      </label>
    </div>

    <div className="equipment-preview">
      <span className="equipment-icon">✦</span>

      <div>
        <span>Current equipment</span>
        <strong>{equipment}</strong>
      </div>
    </div>

    <div className="card-actions">
      <button
        type="button"
        className={`btn favorite-btn ${favorite ? "primary" : ""}`}
        aria-pressed={favorite}
        onClick={() => setFavorite((f) => !f)}
      >
        <span>{favorite ? "★" : "☆"}</span>
        {favorite ? "Favorited" : "Add to favorites"}
      </button>

      <button
        type="button"
        className="btn reset-btn"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  </article>
  );
}
