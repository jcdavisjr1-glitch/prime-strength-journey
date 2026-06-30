import data from "./exercise-media-data.json";

export type ExerciseMedia = {
  name: string;
  images: string[]; // relative paths under /exercise-media/
  instructions: string[];
  equipment?: string | null;
};

const media = data as Record<string, ExerciseMedia>;

const MEDIA_BASE = "/exercise-media";

export function getExerciseMedia(name: string): {
  name: string;
  imageUrls: string[];
  instructions: string[];
} | null {
  const entry = media[name];
  if (!entry || !entry.images?.length) return null;
  return {
    name: entry.name,
    imageUrls: entry.images.map((p) => `${MEDIA_BASE}/${p}`),
    instructions: entry.instructions ?? [],
  };
}

export function hasExerciseMedia(name: string): boolean {
  return !!media[name]?.images?.length;
}
