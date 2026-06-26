export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  note: string;
}

export interface WorkoutDay {
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface EquipmentPlan {
  day1: WorkoutDay;
  day2: WorkoutDay;
}

export interface FitnessPlan {
  gym: EquipmentPlan;
  home: EquipmentPlan;
  bodyweight: EquipmentPlan;
}

export const plans: {
  beginner: FitnessPlan;
  intermediate: FitnessPlan;
  advanced: FitnessPlan;
} = {

  beginner: {

    gym: {

      day1: { name: "Full Body — Session A", focus: "Upper body focus, light weight, 3 sets",

        exercises: [

          { name: "Chest press machine", sets: 3, reps: "12-15", rest: 90, note: "Very light weight" },

          { name: "Lat pulldown", sets: 3, reps: "12-15", rest: 75, note: "Weight you can lift easily" },

          { name: "Dumbbell shoulder press", sets: 3, reps: 12, rest: 75, note: "Seated if possible" },

          { name: "Dumbbell curl", sets: 3, reps: 12, rest: 60, note: "Slow, no swinging" },

          { name: "Seated calf raise", sets: 3, reps: 15, rest: 45, note: "Bodyweight or very light" },

          { name: "Plank hold", sets: 3, reps: "15 sec", rest: 45, note: "On knees if needed" }

        ]},

      day2: { name: "Full Body — Session B", focus: "Lower body focus, light weight, 3 sets",

        exercises: [

          { name: "Leg press", sets: 3, reps: "12-15", rest: 90, note: "Very light" },

          { name: "Seated leg curl", sets: 3, reps: 12, rest: 75, note: "Slow on the way up" },

          { name: "Seated cable row", sets: 3, reps: 12, rest: 75, note: "Squeeze shoulder blades" },

          { name: "Tricep pushdown", sets: 3, reps: 12, rest: 60, note: "Light, full range" },

          { name: "Leg extension", sets: 3, reps: 12, rest: 75, note: "Don't lock knees" },

          { name: "Dead bug", sets: 3, reps: "6 each side", rest: 45, note: "Slow and controlled" }

        ]}},

    home: {

      day1: { name: "Full Body — Session A", focus: "Upper body, bodyweight + light dumbbells",

        exercises: [

          { name: "Wall push-up", sets: 3, reps: "12-15", rest: 90, note: "Step back to increase difficulty" },

          { name: "Chair-assisted squat", sets: 3, reps: "10-12", rest: 90, note: "Hold chair for balance" },

          { name: "Seated dumbbell curl", sets: 3, reps: 12, rest: 60, note: "Light dumbbells or water bottles" },

          { name: "Seated overhead press", sets: 3, reps: "10-12", rest: 75, note: "Light dumbbells" },

          { name: "Standing calf raise", sets: 3, reps: 15, rest: 45, note: "Hold wall for balance" },

          { name: "Modified plank (knees)", sets: 3, reps: "15 sec", rest: 45, note: "Straight line knees to head" }

        ]},

      day2: { name: "Full Body — Session B", focus: "Lower body + core, minimal equipment",

        exercises: [

          { name: "Bodyweight squat", sets: 3, reps: "10-12", rest: 90, note: "Go as low as comfortable" },

          { name: "Glute bridge", sets: 3, reps: "12-15", rest: 60, note: "Hold 1 sec at top" },

          { name: "Dumbbell bent-over row", sets: 3, reps: "10-12", rest: 75, note: "Support on chair" },

          { name: "Tricep chair dip", sets: 3, reps: "8-10", rest: 75, note: "Small range to start" },

          { name: "Side step touch", sets: 3, reps: "20 steps", rest: 45, note: "Gets blood flowing" },

          { name: "Bird dog", sets: 3, reps: "6 each side", rest: 45, note: "Slow and steady" }

        ]}},

    bodyweight: {

      day1: { name: "Upper Body Push/Pull", focus: "No equipment needed",

        exercises: [

          { name: "Push-up (elevated if needed)", sets: 3, reps: "8-12", rest: 90, note: "Hands on counter if needed" },

          { name: "Pike push-up", sets: 3, reps: "8-10", rest: 75, note: "Targets shoulders" },

          { name: "Chair dip", sets: 3, reps: "10-12", rest: 60, note: "Use sturdy chair" },

          { name: "Towel row (door anchor)", sets: 3, reps: "10-12", rest: 60, note: "Or any sturdy anchor point" },

          { name: "Dead bug", sets: 3, reps: "8 each side", rest: 45, note: "Core stability" }

        ]},

      day2: { name: "Lower Body / Full Body", focus: "No equipment needed",

        exercises: [

          { name: "Bodyweight squat", sets: 3, reps: 15, rest: 75, note: "Full range" },

          { name: "Reverse lunge", sets: 3, reps: "10 each", rest: 75, note: "Front knee over toe" },

          { name: "Glute bridge", sets: 3, reps: 15, rest: 60, note: "Squeeze at top" },

          { name: "Bird dog", sets: 3, reps: "8 each side", rest: 45, note: "On hands and knees" },

          { name: "Step-up (stairs)", sets: 3, reps: "10 each", rest: 60, note: "Use any sturdy step" }

        ]}}

  },

  intermediate: {

    gym: {

      day1: { name: "Full Body Push", focus: "Chest/shoulders/triceps/biceps, 4 sets",

        exercises: [

          { name: "Barbell or DB bench press", sets: 4, reps: "8-10", rest: 90, note: "Last 2 reps should be hard" },

          { name: "Dumbbell shoulder press", sets: 4, reps: 10, rest: 75, note: "Controlled descent" },

          { name: "Tricep pushdown", sets: 3, reps: "10-12", rest: 60, note: "Heavy enough to feel by rep 10" },

          { name: "Dumbbell curl", sets: 3, reps: "10-12", rest: 60, note: "Strict form" },

          { name: "Lateral raise", sets: 3, reps: "12-15", rest: 60, note: "Pause at top" },

          { name: "Plank", sets: 3, reps: "35 sec", rest: 45, note: "Challenge yourself" }

        ]},

      day2: { name: "Full Body Pull", focus: "Legs/back/hamstrings, compound lifts",

        exercises: [

          { name: "Barbell squat or leg press", sets: 4, reps: "8-10", rest: 120, note: "Leg press as alternative" },

          { name: "Romanian deadlift", sets: 4, reps: 10, rest: 90, note: "Feel the hamstring stretch" },

          { name: "Seated cable row", sets: 4, reps: 10, rest: 75, note: "Full contraction" },

          { name: "Lat pulldown", sets: 3, reps: "10-12", rest: 75, note: "Pull to upper chest" },

          { name: "Leg curl", sets: 3, reps: 12, rest: 60, note: "Squeeze at top" },

          { name: "Plank or ab rollout", sets: 3, reps: "35-40 sec", rest: 45, note: "Core challenge" }

        ]}},

    home: {

      day1: { name: "Full Body Push", focus: "Dumbbells, moderate-heavy",

        exercises: [

          { name: "Push-up", sets: 4, reps: "10-15", rest: 90, note: "Full range" },

          { name: "Dumbbell shoulder press", sets: 4, reps: 10, rest: 75, note: "Standing or seated" },

          { name: "Dumbbell curl", sets: 3, reps: "10-12", rest: 60, note: "Strict, no swing" },

          { name: "Tricep overhead extension", sets: 3, reps: "10-12", rest: 60, note: "Full range behind head" },

          { name: "Dumbbell lateral raise", sets: 3, reps: 12, rest: 60, note: "Light, shoulder height" },

          { name: "Plank", sets: 3, reps: "35-40 sec", rest: 45, note: "Hold strong form" }

        ]},

      day2: { name: "Full Body Pull", focus: "Dumbbells, compound focus",

        exercises: [

          { name: "Dumbbell goblet squat", sets: 4, reps: "10-12", rest: 90, note: "Heavy dumbbell, full depth" },

          { name: "Dumbbell Romanian deadlift", sets: 4, reps: 10, rest: 90, note: "Deep hinge" },

          { name: "Dumbbell bent-over row", sets: 4, reps: "10-12", rest: 75, note: "Pull to hip" },

          { name: "Reverse lunge with dumbbells", sets: 3, reps: "10 each", rest: 75, note: "Add resistance" },

          { name: "Single leg glute bridge", sets: 3, reps: "10 each", rest: 60, note: "Drive heel down" },

          { name: "Renegade row", sets: 3, reps: "8 each side", rest: 75, note: "Plank position" }

        ]}},

    bodyweight: {

      day1: { name: "Upper Body Strength", focus: "Advanced bodyweight variations",

        exercises: [

          { name: "Push-up (full range)", sets: 4, reps: "12-15", rest: 90, note: "Chest to floor" },

          { name: "Pike push-up (feet elevated)", sets: 4, reps: "10-12", rest: 75, note: "Approximates shoulder press" },

          { name: "Diamond push-up", sets: 3, reps: "8-12", rest: 75, note: "Tricep focus" },

          { name: "Towel row (heavier anchor)", sets: 3, reps: "12-15", rest: 60, note: "Slow negative" },

          { name: "Plank to push-up", sets: 3, reps: 10, rest: 60, note: "Core + shoulder stability" }

        ]},

      day2: { name: "Lower Body Strength", focus: "Advanced bodyweight variations",

        exercises: [

          { name: "Bulgarian split squat (rear foot elevated)", sets: 4, reps: "10 each", rest: 90, note: "Use chair or step" },

          { name: "Single leg glute bridge", sets: 4, reps: "12 each", rest: 75, note: "Drive hard at top" },

          { name: "Jump squat", sets: 3, reps: 10, rest: 90, note: "Land softly" },

          { name: "Walking lunge", sets: 3, reps: "12 each", rest: 75, note: "Long stride" },

          { name: "Side plank", sets: 3, reps: "30 sec each", rest: 60, note: "Stack feet" }

        ]}}

  },

  advanced: {

    gym: {

      day1: { name: "Upper Body Power", focus: "Heavy compound push/pull, 4-5 sets",

        exercises: [

          { name: "Barbell bench press", sets: 5, reps: "5-6", rest: 150, note: "Heavy working weight" },

          { name: "Weighted pull-up or pulldown", sets: 4, reps: "6-8", rest: 120, note: "Full range" },

          { name: "Overhead press — barbell", sets: 4, reps: "6-8", rest: 120, note: "Strict, no leg drive" },

          { name: "Incline DB press", sets: 3, reps: "8-10", rest: 90, note: "Superset with rows if energy allows" },

          { name: "EZ bar curl", sets: 3, reps: 8, rest: 75, note: "Slow negative" },

          { name: "Weighted dip", sets: 3, reps: "8-10", rest: 75, note: "Upright torso" }

        ]},

      day2: { name: "Lower Body Power", focus: "Heavy squat/deadlift, periodized",

        exercises: [

          { name: "Barbell squat", sets: 5, reps: "4-6", rest: 180, note: "85-90% effort, perfect depth" },

          { name: "Romanian deadlift", sets: 4, reps: "6-8", rest: 150, note: "Full hamstring stretch" },

          { name: "Leg press — heavy", sets: 3, reps: "8-10", rest: 120, note: "Glute dominant" },

          { name: "Nordic hamstring curl or leg curl", sets: 3, reps: 8, rest: 90, note: "Most demanding hamstring move" },

          { name: "Farmer carry", sets: 3, reps: "40 yards", rest: 90, note: "Heavy dumbbells" },

          { name: "Ab wheel rollout", sets: 3, reps: "10-12", rest: 60, note: "Full extension if possible" }

        ]}},

    home: {

      day1: { name: "Upper Body Power", focus: "Heaviest dumbbells available",

        exercises: [

          { name: "Weighted push-up (vest/plates)", sets: 5, reps: "6-8", rest: 120, note: "Make it genuinely heavy" },

          { name: "Heavy dumbbell row", sets: 4, reps: "6-8", rest: 120, note: "Heavy, full range" },

          { name: "DB overhead press — standing", sets: 4, reps: "6-8", rest: 120, note: "Strict form" },

          { name: "Archer push-up", sets: 3, reps: "6 each side", rest: 90, note: "Unilateral push" },

          { name: "Heavy dumbbell curl", sets: 3, reps: 8, rest: 75, note: "Slow negative" },

          { name: "Pike push-up (feet elevated)", sets: 3, reps: "8-10", rest: 75, note: "Approximates overhead press" }

        ]},

      day2: { name: "Lower Body Power", focus: "Heaviest dumbbells, periodized",

        exercises: [

          { name: "Bulgarian split squat — heavy", sets: 5, reps: "6-8 each", rest: 150, note: "Heaviest dumbbells" },

          { name: "Single leg RDL — heavy", sets: 4, reps: "8 each", rest: 120, note: "Balance + strength" },

          { name: "Jump squat", sets: 3, reps: 8, rest: 90, note: "Explosive, soft landing" },

          { name: "Heavy dumbbell row", sets: 4, reps: 8, rest: 90, note: "Full range pull" },

          { name: "Sissy squat or Spanish squat", sets: 3, reps: 10, rest: 90, note: "Quad isolation" },

          { name: "L-sit hold (on chairs)", sets: 3, reps: "10-15 sec", rest: 60, note: "Elite core strength" }

        ]}},

    bodyweight: {

      day1: { name: "Upper Body Elite", focus: "Maximum bodyweight difficulty",

        exercises: [

          { name: "Archer push-up", sets: 5, reps: "8 each side", rest: 90, note: "Unilateral strength" },

          { name: "Pseudo planche push-up", sets: 4, reps: "6-8", rest: 90, note: "Lean forward, advanced" },

          { name: "Pike push-up (feet elevated higher)", sets: 4, reps: "10-12", rest: 75, note: "Steeper angle = harder" },

          { name: "One-arm towel row", sets: 3, reps: "8 each side", rest: 75, note: "Unilateral pulling" },

          { name: "Diamond push-up to plank jack", sets: 3, reps: 10, rest: 60, note: "Combo movement" }

        ]},

      day2: { name: "Lower Body Elite", focus: "Maximum bodyweight difficulty",

        exercises: [

          { name: "Bulgarian split squat (weighted backpack)", sets: 5, reps: "10 each", rest: 120, note: "Add household weight" },

          { name: "Pistol squat progression", sets: 4, reps: "6-8 each", rest: 120, note: "Use support as needed" },

          { name: "Jump lunge", sets: 4, reps: "10 each", rest: 90, note: "Explosive, controlled landing" },

          { name: "Single leg glute bridge (elevated)", sets: 3, reps: "15 each", rest: 75, note: "Foot on chair" },

          { name: "Side plank with leg lift", sets: 3, reps: "10 each side", rest: 60, note: "Advanced core + hip" }

        ]}}

  }

};
