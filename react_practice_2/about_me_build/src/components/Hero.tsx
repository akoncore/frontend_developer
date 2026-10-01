import type { Profile } from "../types";

export default function Hero(profile: Profile) {
  const { greeting, firstName, lastName, tagline, intro, photo, photoAlt, handwrittenNote } =
    profile;

  return (
    <header
      id="home"
      className="relative overflow-hidden bg-navy-950 px-6 pb-24 pt-32 sm:px-10 lg:pt-40"
    >
      {/* background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/3 h-[380px] w-[380px] rounded-full bg-blue-400/15 blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hero-rise">
          <p className="text-sm text-violet-300">{greeting}</p>
          <h1 className="font-display mt-3 text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="text-white">{firstName}</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-400 bg-clip-text text-transparent">
              {lastName}
            </span>
          </h1>
          <p className="mt-5 font-display text-lg text-white/60 sm:text-xl">{tagline}</p>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/50">{intro}</p>
          <a
            href="#contact"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 text-sm font-medium text-white shadow-[0_0_30px_-8px_rgba(139,92,246,0.8)] transition-transform hover:-translate-y-0.5"
          >
            Let's Connect
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Portrait */}
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div
            aria-hidden
            className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-white/15"
          />
          <div
            aria-hidden
            className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-400 opacity-80 blur-2xl"
          />
          <img
            src={photo}
            alt={photoAlt}
            className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] rounded-full border border-white/20 object-cover shadow-2xl"
          />

          {/* decorative stars */}
          <span
            aria-hidden
            className="animate-float-slow absolute -top-2 right-6 h-2 w-2 rounded-full bg-white/80"
          />
          <span
            aria-hidden
            className="animate-float-slow absolute bottom-10 -left-3 h-1.5 w-1.5 rounded-full bg-blue-300/80"
            style={{ animationDelay: "1.2s" }}
          />
          <span
            aria-hidden
            className="animate-float-slow absolute bottom-0 right-10 h-1 w-1 rounded-full bg-violet-300/80"
            style={{ animationDelay: "2.4s" }}
          />

          <p
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-white/50"
            style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
          >
            {handwrittenNote}
          </p>
        </div>
      </div>
    </header>
  );
}
