import { useEffect, useState } from "react";
import { X, Play } from "lucide-react";
import { getExerciseMedia, hasExerciseMedia } from "@/lib/exercise-media";

export function WatchFormButton({ exerciseName }: { exerciseName: string }) {
  const [open, setOpen] = useState(false);
  if (!hasExerciseMedia(exerciseName)) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-widest text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label={`Watch form for ${exerciseName}`}
      >
        <Play className="h-3 w-3" fill="currentColor" />
        Watch form
      </button>
      {open && (
        <ExerciseDemoModal exerciseName={exerciseName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ExerciseDemoModal({
  exerciseName,
  onClose,
}: {
  exerciseName: string;
  onClose: () => void;
}) {
  const media = getExerciseMedia(exerciseName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!media) return null;
  const excerpt = media.instructions[0] ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border-2 border-primary/60 rounded-lg overflow-hidden relative shadow-[var(--shadow-red)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative w-full aspect-square bg-black flex items-center justify-center">
          <img
            src={media.gifUrl}
            alt={`${exerciseName} demonstration`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="p-4 border-t border-border">
          <div className="font-display uppercase tracking-[0.3em] text-primary text-[10px]">
            Form demo
          </div>
          <h3 className="mt-1 font-display uppercase text-lg leading-tight">
            {exerciseName}
          </h3>
          {excerpt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
          )}
        </div>
      </div>
    </div>
  );
}
