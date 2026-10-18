export interface Project {
  slug: string;
  title: string;
  category: string;
  filter: "social" | "events" | "leadership";
  year?: string;
  thumbnail: string;
  thumbnailPosition?: string;
  hero: string;
  heroFit?: "cover" | "contain";
  photos: { src: string; width: number; height: number; caption: string }[];
  headline: [string, string, string];
  description: string;
  role: string;
  context: string;
  challenge?: string;
  response?: string;
  contributions: string[];
  programme?: string[];
  results?: string;
  learning?: string;
  metrics: { value: string; label: string }[];
}
