import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "Get Started — FortyStrong" }] }),
  component: OnboardingPage,
});

type FitnessLevel = "beginner" | "intermediate" | "advanced";
type EquipmentType = "gym" | "home" | "bodyweight";

const Q1: { label: string; value: FitnessLevel }[] = [
  { label: "Off the couch", value: "beginner" },
  { label: "Light activity", value: "beginner" },
  { label: "Some exercise", value: "intermediate" },
  { label: "Already active", value: "advanced" },
];

const Q2: string[] = ["More energy", "Build strength", "Lose weight", "All of the above"];

const Q3: { label: string; value: EquipmentType }[] = [
  { label: "Full gym", value: "gym" },
  { label: "Dumbbells at home", value: "home" },
  { label: "Bodyweight only", value: "bodyweight" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const [step, setStep] = useState(0);
  const [fitness, setFitness] = useState<FitnessLevel | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // Skip if already onboarded
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.onboarding_completed) navigate({ to: "/dashboard" });
      });
  }, [user, navigate]);

  const handleFinish = async (finalEquipment: EquipmentType) => {
    if (!user || !fitness || !goal) return;
    setSaving(true);
    setError(null);
    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        fitness_level: fitness,
        equipment_type: finalEquipment,
        goal,
        onboarding_completed: true,
      })
      .eq("id", user.id);
    if (upErr) {
      // Row may not exist yet if trigger didn't fire — upsert fallback
      const { error: insErr } = await supabase.from("profiles").upsert({
        id: user.id,
        fitness_level: fitness,
        equipment_type: finalEquipment,
        goal,
        onboarding_completed: true,
      });
      if (insErr) {
        setSaving(false);
        setError(insErr.message);
        return;
      }
    }
    navigate({ to: "/dashboard" });
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
          Loading…
        </div>
      </main>
    );
  }

  const progress = ((step + 1) / 3) * 100;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="FortyStrong" className="h-11 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display tracking-[0.3em] uppercase text-xs text-primary">
            Step {step + 1} of 3
          </span>
          <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
            Onboarding
          </span>
        </div>
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-12">
          {step === 0 && (
            <QuestionScreen
              title="How active are you right now?"
              options={Q1.map((o) => o.label)}
              onSelect={(label) => {
                const opt = Q1.find((o) => o.label === label)!;
                setFitness(opt.value);
                setStep(1);
              }}
            />
          )}
          {step === 1 && (
            <QuestionScreen
              title="What's your main goal?"
              options={Q2}
              onSelect={(label) => {
                setGoal(label);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <QuestionScreen
              title="What equipment do you have?"
              options={Q3.map((o) => o.label)}
              disabled={saving}
              onSelect={(label) => {
                const opt = Q3.find((o) => o.label === label)!;
                setEquipment(opt.value);
                handleFinish(opt.value);
              }}
            />
          )}

          {error && (
            <div className="mt-6 text-sm text-primary border border-primary/40 bg-primary/10 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          {step > 0 && !saving && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-10 font-display tracking-widest uppercase text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function QuestionScreen({
  title,
  options,
  onSelect,
  disabled,
}: {
  title: string;
  options: string[];
  onSelect: (label: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <h1 className="font-display uppercase text-4xl md:text-5xl leading-tight">{title}</h1>
      <div className="mt-10 grid gap-3">
        {options.map((label) => (
          <button
            key={label}
            disabled={disabled}
            onClick={() => onSelect(label)}
            className="text-left p-5 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-display uppercase tracking-wider text-lg disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
