import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
const initial = {
  name: "",
  species: "dog",
  breed: "",
  gender: "unknown",
  size: "unknown",
  date_of_birth: "",
  weight_kg: "",
  color: "",
  allergies: "",
  notes: "",
};
export default function AddPet() {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const notify = useToast();
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter your pet’s name.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        breed: form.breed.trim(),
        date_of_birth: form.date_of_birth || null,
        weight_kg: form.weight_kg === "" ? null : Number(form.weight_kg),
      };
      const pet = await api.addPet(payload);
      notify(`${pet.name} joined your pet family!`);
      navigate(`/pets/${pet.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/pets">
        <ArrowLeft size={17} /> Back to my pets
      </Link>
      <div className="form-layout">
        <div>
          <p className="eyebrow">A NEW LITTLE FRIEND</p>
          <h1>
            Let's meet your pet <span className="wave">✳</span>
          </h1>
          <p className="muted">
            Tell us a little about your new companion. Every detail helps us
            care better.
          </p>
          <div className="form-aside-art">
            <span>🐕</span>
            <div>
              <Heart size={24} />
              <b>
                Every pet has a story.
                <br />
                We'd love to hear yours.
              </b>
            </div>
          </div>
        </div>
        <form className="form-card" onSubmit={submit}>
          <div className="form-card-heading">
            <CheckCircle2 size={21} />
            <b>Pet's basic information</b>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="fields">
            <label className="field full">
              Pet's name <span>*</span>
              <input
                required
                maxLength="100"
                name="name"
                value={form.name}
                onChange={change}
                placeholder="e.g. Milo"
              />
            </label>
            <label className="field">
              Animal type <span>*</span>
              <select name="species" value={form.species} onChange={change}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field">
              Breed
              <input
                name="breed"
                maxLength="100"
                value={form.breed}
                onChange={change}
                placeholder="e.g. Golden Retriever"
              />
            </label>
            <label className="field">
              Gender
              <select name="gender" value={form.gender} onChange={change}>
                <option value="unknown">Not sure</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="field">
              Size
              <select name="size" value={form.size} onChange={change}>
                <option value="unknown">Not sure</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label className="field">
              Date of birth
              <input
                type="date"
                name="date_of_birth"
                max={new Date().toISOString().slice(0, 10)}
                value={form.date_of_birth}
                onChange={change}
              />
            </label>
            <label className="field">
              Weight (kg)
              <input
                type="number"
                min="0.01"
                max="9999"
                step="0.01"
                name="weight_kg"
                value={form.weight_kg}
                onChange={change}
                placeholder="e.g. 5.5"
              />
            </label>
            <label className="field full">
              Coat / color
              <input
                name="color"
                value={form.color}
                onChange={change}
                placeholder="e.g. Golden"
              />
            </label>
            <label className="field full">
              Known allergies
              <textarea
                name="allergies"
                value={form.allergies}
                onChange={change}
                rows="2"
                placeholder="Anything we should know?"
              />
            </label>
            <label className="field full">
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={change}
                rows="3"
                placeholder="Favorite activities, special care..."
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={busy}
          >
            {busy ? "Saving your pet..." : "Add my pet"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
