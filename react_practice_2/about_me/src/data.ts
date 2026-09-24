
import photo from "./assets/avatar.svg"; 
import type { Profile, AboutData, ContactItem } from './types';

export const profile: Profile = {
  name: "Abdresh Akniet",
  role: "Student of KBTU",
  tagline: "I'm learning React and building things that make me smile.",
  photo,
  photoAlt: "Portrait of Your Name",
};

export const about: AboutData = {
  paragraphs: [
    "Hi! My name is Akon. I am a student and a beginner software developer. I am interested in web development and programming.",
    "Currently, I am learning React, TypeScript, Flutter, and Django. I enjoy learning new technologies and improving my skills.",
  ],
  skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Git"],
};


export const contacts: ContactItem[] = [
  { label: "GitHub", value: "github.com/akoncore", href: "https://github.com/akoncore" },
  { label: "Instagram", value: "@akon_abdresh", href: "https://www.instagram.com/akon_abdresh" },
  { label: "Address", value: "NARYNQOL" },
];
