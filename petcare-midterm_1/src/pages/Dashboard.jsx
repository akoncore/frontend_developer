import careTeam from "../assets/care-team.jpg";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Heart,
  PawPrint,
  Plus,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { api } from "../api";
import { useApiList } from "../hooks";
import SectionTitle from "../components/SectionTitle";
import PetAvatar from "../components/PetAvatar";
import StatusView from "../components/StatusView";
export default function Dashboard() {
  const fetchPets = useCallback((signal) => api.pets(signal), []);
  const fetchBookings = useCallback((signal) => api.appointments(signal), []);
  const { data: pets, loading, error, refresh } = useApiList(fetchPets);
  const bookings = useApiList(fetchBookings);
  const active = bookings.data.filter((a) => a.status === "booked");
  return (
    <>
      <SectionTitle
        eyebrow="YOUR PET WELLNESS HUB"
        title={
          <>
            Hello, pet lover <span className="wave">✳</span>
          </>
        }
        description="Here's what's happening in your little world of paws."
      />
      <div className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            <Heart size={14} fill="currentColor" /> MORE LOVE, MORE WAGGING
            TAILS
          </span>
          <h2>
            Because every paw
            <br />
            deserves the <em>best care.</em>
          </h2>
          <p>
            Keep all your furry friends happy and healthy, in one lovely place.
          </p>
          <Link className="btn btn-cream" to="/appointments">
            Book a visit <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="hero-photo">
          <img
            src={careTeam}
            alt="Veterinarian holding a puppy and a kitten"
            fetchPriority="high"
          />
          <span className="photo-badge">
            <Heart size={15} /> Healthy & happy
          </span>
        </div>
      </div>
      {loading ? (
        <StatusView type="loading" />
      ) : error ? (
        <StatusView
          type="error"
          description={error}
          action={
            <button className="btn btn-primary" onClick={refresh}>
              Try again
            </button>
          }
        />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <PawPrint />
              </div>
              <div>
                <p>Pets in care</p>
                <b>{pets.length}</b>
                <small>Beautiful companions</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon peach">
                <CalendarCheck />
              </div>
              <div>
                <p>Upcoming visits</p>
                <b>{bookings.loading ? "…" : active.length}</b>
                <small>Planned appointments</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon lilac">
                <Heart />
              </div>
              <div>
                <p>Animal families</p>
                <b>{new Set(pets.map((p) => p.species)).size}</b>
                <small>Different pet types</small>
              </div>
            </div>
          </div>
          <div className="dashboard-columns">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">THE LITTLE ONES</span>
                  <h2>Meet your companions</h2>
                </div>
                <Link className="text-link" to="/pets">
                  View all <ArrowRight size={16} />
                </Link>
              </div>
              {pets.length === 0 ? (
                <StatusView
                  description="Add your first pet to get started."
                  action={
                    <Link className="btn btn-primary" to="/pets/new">
                      Add a pet
                    </Link>
                  }
                />
              ) : (
                <div className="featured-pets">
                  {pets.slice(0, 4).map((p) => (
                    <Link
                      className="featured-pet"
                      key={p.id}
                      to={`/pets/${p.id}`}
                    >
                      <PetAvatar pet={p} />
                      <span>
                        <b>{p.name}</b>
                        <small>{p.breed || p.species}</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </Link>
                  ))}
                </div>
              )}
              <Link className="add-row" to="/pets/new">
                <Plus size={17} /> Add another furry friend
              </Link>
            </section>
            <section className="panel care-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">STAY ON TOP OF IT</span>
                  <h2>Care made simple</h2>
                </div>
              </div>
              <div className="care-tip">
                <div className="care-icon">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3>Routine checkups matter</h3>
                  <p>
                    Regular vet visits keep our best friends feeling their very
                    best.
                  </p>
                </div>
              </div>
              <div className="care-tip">
                <div className="care-icon">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3>Prevention is everything</h3>
                  <p>Stay up to date on vaccines and preventive care.</p>
                </div>
              </div>
              <Link className="care-link" to="/services">
                Explore our services <ArrowUpRight size={17} />
              </Link>
            </section>
          </div>
        </>
      )}
    </>
  );
}
