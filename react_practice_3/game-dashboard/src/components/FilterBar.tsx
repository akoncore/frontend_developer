import { ROLES, RoleFilter, STATUSES, StatusFilter } from "../types/character";

interface Props {
  statusFilter: StatusFilter;
  roleFilter: RoleFilter;
  onStatusChange: (s: StatusFilter) => void;
  onRoleChange: (r: RoleFilter) => void;
  onReverse: () => void;
}

export default function FilterBar({ statusFilter, roleFilter, onStatusChange, onRoleChange, onReverse }: Props) {
  console.log("[render] FilterBar");
  return (
    <div className="filters">
      <label>
        Status
        <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as StatusFilter)}>
          <option value="All">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Role
        <select value={roleFilter} onChange={(e) => onRoleChange(e.target.value as RoleFilter)}>
          <option value="All">All</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>
      <button type="button" className="btn" onClick={onReverse}>Reverse list</button>
    </div>
  );
}
