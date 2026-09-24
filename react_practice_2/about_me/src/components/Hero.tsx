import type { Profile } from "../types";

export default function Hero({ name, role, tagline, photo, photoAlt }: Profile) {
  return (
    <header className="hero">
      <div className="hero__text">
        <p className="hero__role">{role}</p>
        <h1>{name}</h1>
        <p className="hero__tagline">{tagline}</p>
      </div>
      <div className="hero__photo">
        <img src={photo} alt={photoAlt} />
      </div>
    </header>
  );
}
