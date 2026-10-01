import type { Profile, AboutData, Project, NavLink, FooterData } from "./types";

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const profile: Profile = {
  greeting: "Hello, I'm",
  firstName: "Akon",
  lastName: "Abdresh",
  tagline: "Developer · Learner · Dreamer",
  intro:
    "I'm a student and a passionate developer who loves building useful things, solving problems and constantly learning new technologies. I believe consistency and curiosity can lead to great results.",
  // Replace this file with your own photo, same name and path:
  // public/images/profile.jpg
  photo: "/images/profile1.jpg",
  photoAlt: "Portrait of Akon Abdresh",
  handwrittenNote: "Better than yesterday",
};

export const about: AboutData = {
  label: "About Me",
  heading: "A little bit about",
  highlighted: "me",
  paragraphs: [
    "I'm currently a student at KBTU, spending most of my time between lectures and side projects. What pulls me toward software is the moment a problem finally clicks and the solution just works.",
    "Right now I'm learning React, TypeScript, Flutter and Django, and I enjoy going deep rather than staying surface-level. Outside of code, I like sketching interfaces, reading about design, and slow, long walks to think things through.",
  ],
  features: [
    { icon: "puzzle", title: "Problem Solver", text: "I enjoy finding solutions" },
    { icon: "sparkles", title: "Always Learning", text: "New skills, new opportunities" },
    { icon: "users", title: "Team Player", text: "Better together" },
    { icon: "rocket", title: "Big Dreams", text: "Step by step" },
  ],
  skills: [
    { name: "Flutter", tone: "blue" },
    { name: "Dart", tone: "mint" },
    { name: "React", tone: "purple" },
    { name: "TypeScript", tone: "blue" },
    { name: "Python", tone: "yellow" },
    { name: "Django", tone: "mint" },
    { name: "Git", tone: "purple" },
    { name: "PostgreSQL", tone: "blue" },
  ],
  goal:
    "I want to become a strong developer, build meaningful products, and create a life I'm proud of.",
};

export const projects: Project[] = [
  {
    name: "Task Runner",
    description: "A small app exploring closures, promises, async/await and the event loop.",
    tags: ["JavaScript", "Async"],
    href: "https://github.com/akoncore/frontend_developer/tree/main/react_practice_1",
  },
  {
    name: "About Me",
    description: "This page — a React and TypeScript portfolio built from scratch.",
    tags: ["React", "TypeScript"],
    href: "https://github.com/akoncore/frontend_developer/tree/main/react_practice_2",
  },
];

export const footer: FooterData = {
  quote: "Small steps every day lead to big results.",
  note: "Keep going",
};

export const contact = {
  email: "akon@example.com",
  github: "https://github.com/akoncore",
  instagram: "https://www.instagram.com/akon_abdresh",
};
