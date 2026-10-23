import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { api } from "../api";
import { useApiList, useSearchFilter } from "../hooks";
import SectionTitle from "../components/SectionTitle";
import PetCard from "../components/PetCard";
import Pagination from "../components/Pagination";
import StatusView from "../components/StatusView";
const PAGE_SIZE = 12;
export default function Pets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    api
      .pets(controller.signal)
      .then((items) => {
        if (active) setData(items);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [version]);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);
  const filtered = useSearchFilter(data, { search, species, sort });
  useEffect(() => setPage(1), [search, species, sort]);
  const reset = () => {
    setSearch("");
    setSpecies("all");
    setSort("name-asc");
  };
  return (
    <>
      <SectionTitle
        eyebrow="YOUR FURRY FAMILY"
        title="My lovely pets"
        description="Every little personality, all in one happy place."
        action={
          <Link className="btn btn-primary" to="/pets/new">
            <Plus size={18} /> Add new pet
          </Link>
        }
      />
      <button
        className="btn btn-secondary"
        disabled={loading}
        onClick={refresh}
      >
        {loading ? "Loading…" : "Reload list"}
      </button>
      <div className="filter-bar">
        <label className="search-field">
          <Search size={19} />
          <input
            placeholder="Search by name, breed or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="select-field">
          <SlidersHorizontal size={17} />
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="all">All animals</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="rabbit">Rabbits</option>
            <option value="bird">Birds</option>
          </select>
        </label>
        <label className="select-field">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button className="btn btn-quiet" onClick={reset} title="Reset filters">
          <RotateCcw size={17} /> Reset
        </button>
      </div>
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
      ) : (
        <>
          <div className="results-line">
            <b>{filtered.length} companions</b>
            <span>Showing your pet family</span>
          </div>
          {filtered.length === 0 ? (
            <StatusView
              title="No pets found"
              description="Try another search or clear your filters."
              action={
                <button className="btn btn-primary" onClick={reset}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              <div className="pet-grid">
                {filtered
                  .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                  .map((p) => (
                    <PetCard key={p.id} pet={p} />
                  ))}
              </div>
              <Pagination
                page={page}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
