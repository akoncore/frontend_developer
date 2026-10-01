export interface Profile {
  greeting: string;
  firstName: string;
  lastName: string;
  tagline: string;
  intro: string;
  photo: string;
  photoAlt: string;
  handwrittenNote: string;
}

export interface FeatureCard {
  icon: "puzzle" | "sparkles" | "users" | "rocket";
  title: string;
  text: string;
}

export interface AboutData {
  label: string;
  heading: string;
  highlighted: string;
  paragraphs: string[];
  features: FeatureCard[];
  skills: { name: string; tone: "blue" | "purple" | "mint" | "yellow" }[];
  goal: string;
}

export interface Project {
  name: string;
  description: string;
  tags: string[];
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterData {
  quote: string;
  note: string;
}
