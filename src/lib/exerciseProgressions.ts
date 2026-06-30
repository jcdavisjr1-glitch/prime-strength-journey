export type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "horizontal_pull"
  | "vertical_push"
  | "vertical_pull"
  | "carry_core";

export const exerciseProgressions: Record<MovementPattern, string[]> = {
  squat: [
    "Chair-assisted squat",
    "Bodyweight squat",
    "Goblet squat",
    "Dumbbell front squat",
    "Barbell squat",
    "Bulgarian split squat",
    "Single leg squat",
  ],
  hinge: [
    "Glute bridge",
    "Single leg glute bridge",
    "Dumbbell Romanian deadlift",
    "Barbell Romanian deadlift",
    "Conventional deadlift",
    "Single leg RDL",
    "Trap bar deadlift",
  ],
  horizontal_push: [
    "Wall push-up",
    "Elevated push-up",
    "Push-up",
    "Dumbbell floor press",
    "Dumbbell bench press",
    "Barbell bench press",
    "Incline barbell bench press",
  ],
  horizontal_pull: [
    "Dumbbell bent-over row",
    "Seated cable row",
    "Chest-supported row",
    "Barbell bent-over row",
    "Weighted pull-up",
  ],
  vertical_push: [
    "Pike push-up",
    "Dumbbell shoulder press (seated)",
    "Dumbbell shoulder press (standing)",
    "Barbell overhead press",
    "Push press",
  ],
  vertical_pull: [
    "Lat pulldown (wide grip)",
    "Lat pulldown (close grip)",
    "Assisted pull-up",
    "Pull-up",
    "Weighted pull-up",
  ],
  carry_core: [
    "Plank hold",
    "Dead bug",
    "Bird dog",
    "Farmer carry (light)",
    "Farmer carry (heavy)",
    "Ab wheel rollout",
    "L-sit hold",
  ],
};

/**
 * Map an exercise (by lowercased substring matching) to a movement pattern.
 * Used by the level-up / swap engine to pick the next variation.
 */
export function classifyExercise(name: string): MovementPattern | null {
  const n = name.toLowerCase();
  if (/(plank|dead bug|bird dog|farmer carry|ab wheel|l-sit|side plank)/.test(n)) return "carry_core";
  if (/(pulldown|pull-?up|chin-?up)/.test(n)) return "vertical_pull";
  if (/(row)/.test(n)) return "horizontal_pull";
  if (/(overhead press|shoulder press|pike push|push press|military press)/.test(n)) return "vertical_push";
  if (/(bench press|chest press|push-?up|floor press|dip|archer|planche)/.test(n)) return "horizontal_push";
  if (/(deadlift|rdl|romanian|glute bridge|hip hinge|hip thrust)/.test(n)) return "hinge";
  if (/(squat|lunge|step-?up|leg press|leg extension|leg curl|calf raise|sissy|spanish|pistol|jump)/.test(n)) return "squat";
  return null;
}

/** Given an exercise, return the next harder variation in its ladder, or null. */
export function nextVariation(name: string): { exercise: string; pattern: MovementPattern } | null {
  const pattern = classifyExercise(name);
  if (!pattern) return null;
  const ladder = exerciseProgressions[pattern];
  const lowered = name.toLowerCase();
  const idx = ladder.findIndex((e) => e.toLowerCase() === lowered);
  // If not in ladder, jump to a mid-rung variation as a sensible upgrade.
  if (idx === -1) {
    return { exercise: ladder[Math.min(2, ladder.length - 1)], pattern };
  }
  if (idx >= ladder.length - 1) return null;
  return { exercise: ladder[idx + 1], pattern };
}
