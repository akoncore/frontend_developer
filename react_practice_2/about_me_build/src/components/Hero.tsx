import type { Profile } from "../types";

export default function Hero(profile: Profile) {
  const {
    greeting,
    firstName,
    lastName,
    tagline,
    intro,
    photo,
    photoAlt,
    handwrittenNote,
  } = profile;

  return (
    <header id="home" className="hero">
      {/* background glow */}
      <div aria-hidden className="hero-glow hero-glow-main" />
      <div aria-hidden className="hero-glow hero-glow-side" />

      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-greeting">{greeting}</p>

          <h1 className="hero-title">
            <span className="hero-first-name">{firstName}</span>{" "}
            <span className="hero-last-name">{lastName}</span>
          </h1>

          <p className="hero-tagline">{tagline}</p>

          <p className="hero-intro">{intro}</p>

          <a href="#contact" className="hero-button">
            Let's Connect
            <span className="hero-arrow">→</span>
          </a>
        </div>

        {/* Portrait */}
        <div className="hero-portrait">
          <div aria-hidden className="portrait-ring" />

          <div aria-hidden className="portrait-glow" />

          <img
            src={photo}
            alt={photoAlt}
            className="portrait-image"
          />

          {/* decorative stars */}
          <span aria-hidden className="star star-one" />

          <span
            aria-hidden
            className="star star-two"
          />

          <span
            aria-hidden
            className="star star-three"
          />

          <p className="handwritten-note">
            {handwrittenNote}
          </p>
        </div>
      </div>
    </header>
  );
}