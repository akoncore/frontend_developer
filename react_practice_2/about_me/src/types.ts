export interface Profile {
  name: string;
  role: string;
  tagline: string;
  photo: string;
  photoAlt: string;
}

export interface AboutData {
  paragraphs: string[];
  skills: string[];
}

export interface ContactItem {
  label: string;
  value: string;
  href?: string; // сілтеме болмаса, жай мәтін көрсетіледі
}
