import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import PetAvatar from "./PetAvatar";
export default function PetCard({ pet }) {
  return (
    <Link to={`/pets/${pet.id}`} className="pet-card">
      <div className="pet-card-top">
        <span className="pet-label">{pet.species}</span>
        <ArrowUpRight size={18} />
      </div>
      <PetAvatar pet={pet} size="large" />
      <h3>{pet.name}</h3>
      <p className="muted">{pet.breed || "Lovely companion"}</p>
      <div className="pet-card-footer">
        <span>
          <CalendarDays size={14} />{" "}
          {pet.date_of_birth
            ? new Date(pet.date_of_birth).getFullYear()
            : "N/A"}
        </span>
        <span className="pet-view">View profile →</span>
      </div>
    </Link>
  );
}
