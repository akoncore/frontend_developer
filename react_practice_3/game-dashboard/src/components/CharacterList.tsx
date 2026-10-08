import { Character, Status } from "../types/character";
import CharacterCard from "./CharacterCard";

interface Props {
  characters: Character[];
  onRemove: (id: number) => void;
  onStatusChange: (id: number, status: Status) => void;
}

export default function CharacterList({ characters, onRemove, onStatusChange }: Props) {
  console.log("[render] CharacterList");

  // Conditional rendering: empty state
  if (characters.length === 0) {
    return (
      <div className="empty">
        <h2>No characters match</h2>
        <p>Change the filters or recruit a new character.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {characters.map((c) => (
        <CharacterCard
          key={c.id}
          character={c}
          onRemove={onRemove}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
