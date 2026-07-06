import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, Play } from "lucide-react";
import {
  listExerciseMedia,
  type ExerciseMediaRow,
} from "@/lib/exercise-media-sync.functions";

// Module-level cache so we hit the DB once per page session, not per card.
let dbMediaPromise: Promise<Map<string, ExerciseMediaRow>> | null = null;
function loadDbMedia(fetcher: () => Promise<ExerciseMediaRow[]>) {
  if (!dbMediaPromise) {
    dbMediaPromise = fetcher()
      .then((rows) => {
        const map = new Map<string, ExerciseMediaRow>();
        for (const r of rows) map.set(r.exercise_name.toLowerCase(), r);
        return map;
      })
      .catch(() => new Map<string, ExerciseMediaRow>());
  }
  return dbMediaPromise;
}

function useDbMedia(name: string): ExerciseMediaRow | null {
  const fetcher = useServerFn(listExerciseMedia);
  const [row, setRow] = useState<ExerciseMediaRow | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadDbMedia(() => fetcher()).then((map) => {
      if (cancelled) return;
      setRow(map.get(name.toLowerCase()) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [name, fetcher]);
  return row;
}

export function WatchFormButton({ exerciseName }: { exerciseName: string }) {
  const [open, setOpen] = useState(false);
  const dbRow = useDbMedia(exerciseName);
  const videoUrl = dbRow?.video_url_front || dbRow?.video_url_side || null;
  if (!videoUrl) return null;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("[WatchForm] opening modal", { exerciseName, videoUrl });
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-widest text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label={`Watch form for ${exerciseName}`}
      >
        <Play className="h-3 w-3" fill="currentColor" />
        Watch form
      </button>
      {open && (
        <ExerciseDemoModal
          exerciseName={exerciseName}
          dbRow={dbRow!}
          videoUrl={videoUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function ExerciseDemoModal({
  exerciseName,
  dbRow,
  videoUrl,
  onClose,
}: {
  exerciseName: string;
  dbRow: ExerciseMediaRow;
  videoUrl: string;
  onClose: () => void;
}) {
  const [videoError, setVideoError] = useState(false);
  console.log("[WatchForm] modal render", { exerciseName, videoUrl });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const excerpt = (dbRow.instructions ?? "").split(/\n|\.\s/)[0]?.trim() || "";

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
        <div className="relative w-full bg-black flex items-center justify-center" style={{ minHeight: 200 }}>
          {videoError ? (
            <div className="p-6 text-center text-sm text-muted-foreground" style={{ width: "100%", maxWidth: 500 }}>
              Video unavailable — check the exercise instructions below.
            </div>
          ) : (
            <video
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls
              
              onError={(e) => {
                console.error("[WatchForm] video error", { exerciseName, videoUrl, event: e });
                setVideoError(true);
              }}
              style={{ width: "100%", maxWidth: 500 }}
              className="object-contain"
            />
          )}
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
          {(dbRow.muscle_group || dbRow.equipment) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {dbRow.muscle_group && (
                <span className="px-2 py-0.5 text-[10px] font-display uppercase tracking-widest border border-border rounded">
                  {dbRow.muscle_group}
                </span>
              )}
              {dbRow.equipment && (
                <span className="px-2 py-0.5 text-[10px] font-display uppercase tracking-widest border border-border rounded">
                  {dbRow.equipment}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

