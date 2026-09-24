
import photo from "./assets/avatar.svg"; 
import type { Profile, AboutData, ContactItem } from './types';

export const profile: Profile = {
  name: "Your Name",
  role: "Student & future developer",
  tagline: "I'm learning React and building things that make me smile.",
  photo,
  photoAlt: "Portrait of Your Name",
};

export const about: AboutData = {
  paragraphs: [
    "Hi! I'm a student from Kazakhstan. Write two or three sentences here: who you are, what you study, what you enjoy.",
    "Add something fun: a hobby, a favourite game, a goal for this year.",
  ],
  skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Git"],
};


export const contacts: ContactItem[] = [
  { label: "GitHub", value: "github.com/your-username", href: "https://github.com/your-username" },
  { label: "Instagram", value: "@your_handle", href: "https://instagram.com/your_handle" },
  { label: "Address", value: "Planet Earth" },
];
