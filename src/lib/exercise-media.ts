import data from "./exercise-media-data.json";

export type ExerciseMedia = {
  name: string;
  gif: string; // filename under /exercise-media/
  instructions: string[];
  equipment?: string | null;
};

const media = data as Record<string, ExerciseMedia>;

const MEDIA_BASE = "/exercise-media";

export function getExerciseMedia(name: string): {
  name: string;
  gifUrl: string;
  instructions: string[];
  equipment?: string | null;
} | null {
  const entry = media[name];
  if (!entry?.gif) return null;
  return {
    name: entry.name,
    gifUrl: `${MEDIA_BASE}/${entry.gif}`,
    instructions: entry.instructions ?? [],
    equipment: entry.equipment,
  };
}

export function hasExerciseMedia(name: string): boolean {
  return !!media[name]?.gif;
}
