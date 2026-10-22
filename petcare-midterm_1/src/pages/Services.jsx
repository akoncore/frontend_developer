import vetCheckup from "../assets/vet-checkup.jpg";
import clinicCare from "../assets/clinic-care.jpg";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, Clock3 } from "lucide-react";
import { api } from "../api";
import { useApiList } from "../hooks";
import SectionTitle from "../components/SectionTitle";
import StatusView from "../components/StatusView";
import ServiceIcon from "../components/Icons";
export default function Services() {
  const load = useCallback((signal) => api.services(signal), []);
  const { data, loading, error, refresh } = useApiList(load);
  const [search, setSearch] = useState("");
  const filtered = data.filter((s) =>
    `${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <SectionTitle
        eyebrow="A LITTLE EXTRA LOVE"
        title="Care & services"
        description="Thoughtful veterinary services for every stage of their life."
      />
      <label className="search-field standalone">
        <Search size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search our services..."
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
          title="No services found"
          description="Try a different keyword."
        />
      ) : (
        <div className="service-grid">
          {filtered.map((s, i) => (
            <article className="service-card" key={s.id}>
              <img
                className="service-photo"
                src={Number(s.id) % 2 ? vetCheckup : clinicCare}
                alt="A dog receiving veterinary attention"
                loading="lazy"
              />
              <div className={`service-icon service-color-${i % 4}`}>
                <ServiceIcon
                  name={
                    s.icon ||
                    [
                      "stethoscope",
                      "shield",
                      "smile",
                      "scissors",
                      "heart",
                      "activity",
                    ][i % 6]
                  }
                />
              </div>
              <div className="service-topline">
                <span>WELLNESS SERVICE</span>
                <span>
                  <Clock3 size={14} /> {s.duration_minutes} min
                </span>
              </div>
              <h2>{s.name}</h2>
              <p>
                {s.description || "Professional, caring support for your pet."}
              </p>
              <div className="service-bottom">
                <strong>{Number(s.price).toLocaleString("en-US")} ₸</strong>
                <Link
                  to="/appointments"
                  aria-label={`Book ${s.name}`}
                  className="round-arrow"
                >
                  <ArrowUpRight size={21} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
