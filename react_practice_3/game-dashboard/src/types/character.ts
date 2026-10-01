export type Role = "Warrior" | "Mage" | "Archer" | "Healer";
export type Status = "Active" | "Resting" | "Training";

export const ROLES: Role[] = ["Warrior", "Mage", "Archer", "Healer"];
export const STATUSES: Status[] = ["Active", "Resting", "Training"];

export interface Character {
  id: number; // stable, unique: used as React key
  name: string;
  role: Role;
  level: number;
  status: Status;
  xp: number;
}

export interface NewCharacter {
  name: string;
  role: Role;
  level: number;
}

export type RoleFilter = Role | "All";
export type StatusFilter = Status | "All";
