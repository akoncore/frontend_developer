import { useState } from "react";
import { Character, NewCharacter, RoleFilter, Status, StatusFilter } from "./types/character";
import DashboardHeader from "./components/DashboardHeader";
import StatsPanel from "./components/StatsPanel";
import CharacterForm from "./components/CharacterForm";
import FilterBar from "./components/FilterBar";
import CharacterList from "./components/CharacterList";
import ResetDemo from "./components/ResetDemo";

const initialCharacters: Character[] = [
  { id: 1, name: "Aldric", role: "Warrior", level: 12, status: "Active", xp: 3400 },
  { id: 2, name: "Lyra", role: "Mage", level: 9, status: "Training", xp: 2100 },
  { id: 3, name: "Fenn", role: "Archer", level: 7, status: "Resting", xp: 1500 },
  { id: 4, name: "Sera", role: "Healer", level: 10, status: "Active", xp: 2800 },
];

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [nextId, setNextId] = useState(5);

  console.log("[render] App (parent state changed or App re-rendered)");

  const addCharacter = (c: NewCharacter) => {
    setCharacters((prev) => [...prev, { ...c, id: nextId, status: "Active", xp: c.level * 250 }]);
    setNextId((n) => n + 1);
  };

  const removeCharacter = (id: number) =>
    setCharacters((prev) => prev.filter((c) => c.id !== id));

  const changeStatus = (id: number, status: Status) =>
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  // Immutable reverse: copy first, because reverse() mutates the array it is called on.
  const reverseList = () => setCharacters((prev) => [...prev].reverse());

  const visible = characters.filter(
    (c) =>
      (statusFilter === "All" || c.status === statusFilter) &&
      (roleFilter === "All" || c.role === roleFilter)
  );

  return (
    <div className="app">
      <DashboardHeader total={characters.length} />
      <div className="layout">
        <aside className="sidebar">
          <CharacterForm onAdd={addCharacter} />
          <ResetDemo />
        </aside>
        <main>
          <FilterBar
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            onStatusChange={setStatusFilter}
            onRoleChange={setRoleFilter}
            onReverse={reverseList}
          />
          <CharacterList
            characters={visible}
            onRemove={removeCharacter}
            onStatusChange={changeStatus}
          />
        </main>
      </div>
    </div>
  );
}
