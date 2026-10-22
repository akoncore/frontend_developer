import clinicCare from "../assets/clinic-care.jpg";
import vetCheckup from "../assets/vet-checkup.jpg";
import { useCallback, useState } from "react";
import { MapPin, Clock3, ArrowUpRight, Search } from "lucide-react";
import { api } from "../api";
import { useApiList } from "../hooks";
import SectionTitle from "../components/SectionTitle";
import StatusView from "../components/StatusView";
export default function Clinics() {
  const load = useCallback((signal) => api.clinics(signal), []);
  const { data, loading, error, refresh } = useApiList(load);
  const [search, setSearch] = useState("");
  const filtered = data.filter((c) =>
    `${c.name} ${c.city} ${c.address}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <SectionTitle
        eyebrow="GOOD PEOPLE, GREAT CARE"
        title="Partner clinics"
        description="Find a caring veterinary clinic that feels just right."
      />
      <label className="search-field standalone">
        <Search size={18} />
        <input
          placeholder="Find a clinic by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {loading ? (
        <StatusView type="loading" />
      ) : error ? (
        <StatusView
          type="error"
          description={error}
          action={
            <button className="btn btn-primary" onClick={refresh}>
              Retry
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <StatusView
          title="No clinics found"
          description="Try searching for another clinic or city."
        />
      ) : (
        <div className="clinic-grid">
          {filtered.map((c) => (
            <div className="clinic-card" key={c.id}>
              <div className="clinic-cover">
                <img
                  src={Number(c.id) % 2 ? clinicCare : vetCheckup}
                  alt="Veterinary care for a dog"
                  loading="lazy"
                />
                <span className="clinic-photo-label">Veterinary care</span>
              </div>
              <div className="clinic-body">
                <span className="pet-label">
                  {c.is_active ? "OPEN FOR CARE" : "UNAVAILABLE"}
                </span>
                <h2>{c.name}</h2>
                <p>{c.description || "Compassionate professional pet care."}</p>
                <div className="clinic-meta">
                  <span>
                    <MapPin size={16} />
                    {c.address}, {c.city}
                  </span>
                  <span>
                    <Clock3 size={16} />
                    {typeof c.opening_hours === "string"
                      ? c.opening_hours
                      : "Contact clinic for hours"}
                  </span>
                </div>
                <a
                  className="clinic-route"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.address} ${c.city}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Find on map <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
