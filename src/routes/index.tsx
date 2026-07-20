import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToFreePlan } from "@/lib/mailerlite.functions";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Logo } from "@/components/Logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import couplesTraining from "@/assets/couples-training.jpg.asset.json";
import couplesWalking from "@/assets/couples-walking.jpg.asset.json";
import couplesNight from "@/assets/couples-night.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FortyStrong — Reignite Your Prime" },
      {
        name: "description",
        content:
          "Strength-first fitness built for your 40s, 50s and beyond. Two workouts a week. 45 minutes. Six weeks to feel different.",
      },
      { property: "og:title", content: "FortyStrong — Reignite Your Prime" },
      {
        property: "og:description",
        content:
          "Strength-first fitness built for your 40s, 50s and beyond. Two workouts a week. 45 minutes. Six weeks to feel different.",
      },
    ],
  }),
  component: Landing,
});

/* ---------- shared bits ---------- */

function CtaButton({
  children,
  variant = "primary",
  href = "#pricing",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center font-display tracking-wider uppercase text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-sm transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] hover:shadow-[0_25px_70px_-15px_color-mix(in_oklab,var(--primary)_70%,transparent)] hover:-translate-y-0.5"
      : "border border-border text-foreground hover:border-primary hover:text-primary";
  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 text-primary font-display tracking-[0.3em] text-sm uppercase">
      <span className="h-px w-8 bg-primary" />
      {children}
    </div>
  );
}

/* ---------- sections ---------- */

function Nav() {
  const [open, setOpen] = useState(false);
  const { user } = useSupabaseSession();
  const links = [
    { href: "#truth", label: "Truth" },
    { href: "#how", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#couples", label: "Couples" },
    { href: "#faq", label: "FAQ" },
  ];
  const ctaClass =
    "inline-flex items-center justify-center font-display tracking-wider uppercase rounded-sm transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] hover:-translate-y-0.5";
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] md:h-[88px] flex items-center justify-between">
        <Link to="/" className="flex items-center transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(192,57,43,0.6)]">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display tracking-widest text-sm uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className={`${ctaClass} hidden sm:inline-flex px-5 py-2.5 text-sm`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:inline-flex font-display tracking-widest text-sm uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <CtaButton href="#pricing" className="hidden sm:inline-flex !px-3 !py-2 !text-xs">
                See Plans
              </CtaButton>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 text-foreground"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display tracking-widest uppercase text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className={`${ctaClass} px-6 py-3 text-base`}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="font-display tracking-widest uppercase text-muted-foreground"
                >
                  Log in
                </Link>
                <CtaButton href="#pricing" className="sm:hidden">
                  See Plans
                </CtaButton>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-20 md:pb-32 overflow-hidden">
      {/* Background photo — subject on right, negative space on left for text */}
      <style>{`
        .hero-bg { background-image: url('/hero.jpg'); background-repeat: no-repeat; background-size: cover; background-position: right center; }
        @media (max-width: 767px) { .hero-bg { background-position: 78% center; } }
      `}</style>
      <div className="hero-bg absolute inset-0 pointer-events-none" />

      {/* Left-to-right dark gradient overlay for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.9) 35%, hsl(var(--background) / 0.55) 60%, hsl(var(--background) / 0.2) 100%)",
        }}
      />
      {/* Existing red glow, reduced opacity to blend with photo */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none mix-blend-screen"
        style={{ background: "var(--gradient-radial-red)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionLabel>Reignite Your Prime</SectionLabel>
          <h1 className="mt-6 font-display uppercase text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-balance">
            They told you this is just{" "}
            <span className="text-primary">getting older.</span>{" "}
            They were wrong.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
            Strength-first training built for your 40s, 50s and beyond. Two days a week. Forty-five minutes. Real
            results you'll feel — not chase.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaButton>See Plans</CtaButton>
            <CtaButton variant="ghost" href="#how">
              How It Works
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}


function Stats() {
  const stats = [
    { n: "2", l: "Workouts / Week" },
    { n: "45", l: "Minutes / Session" },
    { n: "6", l: "Weeks To Feel It" },
    { n: "40+", l: "Your Strongest Decade" },
  ];
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-5xl md:text-6xl">{s.n}</div>
            <div className="mt-2 text-xs md:text-sm tracking-widest uppercase opacity-90">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Truth() {
  const scenes = [
    {
      t: "Trading health for prescriptions",
      d: "The pillbox has more compartments every year. You wonder which of these you actually need.",
    },
    {
      t: "Accepting decline as normal",
      d: "Tired. Stiff. Heavier. Slower. The doctor shrugged. You shrugged. That was the worst part.",
    },
    {
      t: "Doing the wrong exercise",
      d: "Cardio class three times a week. You're exhausted and you're still losing muscle. Nobody told you that part.",
    },
    {
      t: "Thinking you're out of time",
      d: "It's not too late. The decade between forty and seventy is where strength is built or surrendered.",
    },
  ];
  return (
    <section id="truth" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>The Truth</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          You didn't get weaker by accident. <span className="text-primary">You can reverse it.</span>
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {scenes.map((s, i) => (
            <div
              key={s.t}
              className="group p-6 md:p-8 bg-surface border border-border rounded-lg hover:border-primary/60 transition-colors"
            >
              <div className="font-display text-5xl text-primary/60 group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-display text-2xl uppercase">{s.t}</h3>
              <p className="mt-3 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Science() {
  const items = [
    { t: "Energy Returns", d: "Muscle is metabolic. More of it means waking up before the alarm — not after." },
    { t: "Joints Get Stronger", d: "Loaded tissue rebuilds. Your knees and hips aren't fragile. They're under-trained." },
    { t: "Disease Risk Drops", d: "Strong people live longer. The data on this stopped being a debate ten years ago." },
  ];
  return (
    <section className="bg-surface overflow-hidden">
      {/* Full-width image with headline overlay */}
      <div className="relative h-[520px] md:h-[680px] overflow-hidden">
        <img
          src="/science.jpg"
          alt="Man in a home gym with a power rack and dumbbells"
          className="absolute inset-0 w-full h-full object-contain object-center bg-black"
        />
        {/* Dark left-to-right fade for headline legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.35) 100%)",
          }}
        />
        {/* Subtle red glow accent */}
        <div
          className="absolute inset-0 opacity-15"
          style={{ background: "var(--gradient-radial-red)" }}
        />
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center">
          <SectionLabel>The Science</SectionLabel>
          <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
            Strength is not vanity. <span className="text-primary">It's survival.</span>
          </h2>
        </div>
      </div>

      {/* Benefit cards below the image, on dark background */}
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((s) => (
            <div key={s.t} className="p-6 bg-background/95 backdrop-blur-sm border border-border rounded-lg">
              <div className="h-1 w-10 bg-primary mb-5" />
              <h3 className="font-display text-2xl uppercase">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoProof() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>The Proof</SectionLabel>
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-[640px] rounded-lg border border-border overflow-hidden bg-surface">
            <div className="relative w-full aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/rv4w-oFrs6c"
                title="Mayo Clinic Minute: Aging and the benefits of exercising"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Source:{" "}
            <a
              href="https://newsnetwork.mayoclinic.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Mayo Clinic News Network
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Tell us where you are",
      d: "A three-question quiz. Activity level. Goal. Equipment. We assign your plan.",
    },
    {
      n: "02",
      t: "Train twice a week",
      d: "Forty-five minutes. Two compound-focused sessions. Walk on the days in between.",
    },
    {
      n: "03",
      t: "Track and progress",
      d: "Log your weights. Beat last week. The app tells you exactly when to add load.",
    },
  ];
  const week = [
    { d: "Mon", t: "Lift A", kind: "lift" },
    { d: "Tue", t: "Walk", kind: "walk" },
    { d: "Wed", t: "Rest", kind: "rest" },
    { d: "Thu", t: "Lift B", kind: "lift" },
    { d: "Fri", t: "Walk", kind: "walk" },
    { d: "Sat", t: "Walk", kind: "walk" },
    { d: "Sun", t: "Rest", kind: "rest" },
  ];
  return (
    <section id="how" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>How It Works</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          The prescription is simpler <span className="text-primary">than you think.</span>
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((s) => (
            <div key={s.n} className="p-8 bg-surface border border-border rounded-lg">
              <div className="font-display text-6xl text-primary">{s.n}</div>
              <h3 className="mt-4 font-display text-2xl uppercase">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 md:p-8 bg-surface border border-border rounded-lg">
          <div className="font-display tracking-widest uppercase text-sm text-muted-foreground">
            A typical week
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2 md:gap-3">
            {week.map((d) => (
              <div
                key={d.d}
                className={`p-3 md:p-4 rounded-md text-center border ${
                  d.kind === "lift"
                    ? "bg-primary border-primary text-primary-foreground"
                    : d.kind === "walk"
                    ? "bg-surface-elevated border-border"
                    : "bg-background border-border text-muted-foreground"
                }`}
              >
                <div className="font-display text-xs md:text-sm tracking-widest">{d.d}</div>
                <div className="mt-1 md:mt-2 font-display text-base md:text-xl uppercase">{d.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function ProgressionEngine() {
  const points = [
    { t: "No spreadsheets", d: "The math is done for you." },
    { t: "No plateaus", d: "A 3-week review keeps your plan evolving." },
    { t: "No guesswork", d: "Start weights are honest, built for a body over forty." },
  ];
  return (
    <section id="engine" className="py-20 md:py-28 bg-surface/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>The Progression Engine</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          The app that knows when you're <span className="text-primary">ready for more.</span>
        </h2>

        <div className="mt-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            After every set, you tell us one thing: Too Easy, Just Right, or Too Hard. That's it. FortyStrong calculates your next session's weights automatically — nudging you forward when you're ready, backing off when your body says so. Every three weeks, the app reviews your progress and adjusts your entire plan: leveling you up, swapping exercises, keeping you moving without guesswork.
          </p>

          <div className="p-6 md:p-8 bg-surface border border-border rounded-lg shadow-[var(--shadow-red)]">
            <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
              Today · Lift A
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <div className="font-display uppercase text-2xl md:text-3xl">Goblet Squat</div>
              <div className="font-display uppercase text-lg text-muted-foreground tabular-nums">
                35 lb × 10
              </div>
            </div>
            <div className="mt-6 font-display tracking-widest uppercase text-xs text-muted-foreground">
              How did that feel?
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 md:gap-3">
              <button
                type="button"
                className="py-3 rounded-md border border-border bg-background font-display tracking-wider uppercase text-sm hover:border-primary transition-colors"
              >
                Too Easy
              </button>
              <button
                type="button"
                className="py-3 rounded-md border border-primary bg-primary text-primary-foreground font-display tracking-wider uppercase text-sm shadow-[var(--shadow-red)]"
              >
                Just Right
              </button>
              <button
                type="button"
                className="py-3 rounded-md border border-border bg-background font-display tracking-wider uppercase text-sm hover:border-primary transition-colors"
              >
                Too Hard
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
              <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                Next session
              </div>
              <div className="font-display uppercase text-xl text-primary tabular-nums">
                40 lb
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-4 md:gap-6">
          {points.map((p) => (
            <div key={p.t} className="p-6 bg-surface border border-border rounded-lg">
              <div className="font-display uppercase text-xl text-primary">{p.t}</div>
              <p className="mt-2 text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const plans = [
    {
      name: "Single Plan",
      price: "$19",
      cadence: "one-time",
      desc: "One personalized plan. Yours forever. No subscription.",
      cta: "Start Single",
      priceId: "single_onetime",
      featured: false,
    },
    {
      name: "Monthly",
      price: "$29",
      cadence: "per month",
      desc: "Full app. New programming every cycle. Cancel anytime.",
      cta: "Go Monthly",
      priceId: "monthly_sub",
      featured: true,
    },
    {
      name: "Annual",
      price: "$199",
      cadence: "per year",
      desc: "Best value. Save $149 a year. Same full membership.",
      cta: "Go Annual",
      priceId: "annual_sub",
      featured: false,
    },
  ];

  const handleBuy = (priceId: string) => {
    openCheckout({
      priceId,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          Honest pricing. <span className="text-primary">No tricks.</span>
        </h2>

        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-8 rounded-lg border ${
                p.featured ? "bg-background border-primary shadow-[var(--shadow-red)]" : "bg-background border-border"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-display tracking-widest uppercase px-3 py-1 rounded-sm">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-3xl uppercase">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-6xl text-primary">{p.price}</div>
                <div className="text-muted-foreground text-sm">{p.cadence}</div>
              </div>
              {p.name === "Annual" && (
                <div className="mt-1 text-xs text-muted-foreground">Just $16.58/month, billed annually</div>
              )}
              <p className="mt-4 text-muted-foreground">{p.desc}</p>
              <button
                onClick={() => handleBuy(p.priceId)}
                className="mt-6 w-full inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-background border border-border rounded-md flex items-start sm:items-center gap-3">
          <span className="text-primary mt-0.5" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <p className="text-muted-foreground">
            Going through this with your partner? FortyStrong Couples gets you both a personalized plan, individual dashboards, and a better price — together.{" "}
            <a href="#couples" className="text-primary hover:underline font-medium">
              See Couples pricing →
            </a>
          </p>
        </div>

        <div className="mt-10 p-5 bg-background border-l-4 border-primary rounded-md flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="font-display text-2xl tracking-wider uppercase text-primary">30-Day Guarantee</div>
          <p className="text-muted-foreground">
            If you don't feel stronger in 30 days, email <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a>. We'll refund every cent. No forms. No friction.
          </p>
        </div>
        <p className="mt-6 text-xs text-muted-foreground max-w-3xl">
          FortyStrong provides general fitness and educational information only. It is not medical advice. Always
          consult your physician before beginning any exercise program, especially if you have an existing health
          condition, injury, or take medication. You participate at your own risk.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={(v) => !v && closeCheckout()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-display uppercase tracking-wider">Checkout</DialogTitle>
          </DialogHeader>
          <div className="p-4">{checkoutElement}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function FoundingMember() {
  const items = [
    {
      t: "Backed by science",
      d: "Built on peer-reviewed research in strength, aging, and longevity.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31" /><path d="M14 9.3V2" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
    },
    {
      t: "30-day guarantee",
      d: "Don't feel stronger in 30 days? Full refund. No forms, no friction.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      t: "Cancel anytime",
      d: "One click. No phone calls. No hoops.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
        </svg>
      ),
    },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>Be One Of The First</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          We're new. And that's <span className="text-primary">the best time to join.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          FortyStrong is built on published research, a method designed specifically for bodies over forty, and a
          simple promise: two focused workouts a week will change how you move through your life. We're building
          this community right now, one member at a time. Join as a founding member — and be one of the first to
          reignite your prime.
        </p>
        <div className="mt-12 grid sm:grid-cols-3 gap-4 md:gap-6">
          {items.map((i) => (
            <div key={i.t} className="p-6 md:p-8 bg-surface border border-border rounded-lg">
              <div className="text-primary">{i.icon}</div>
              <h3 className="mt-4 font-display text-2xl uppercase">{i.t}</h3>
              <p className="mt-2 text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyFortyStrong() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <SectionLabel>Why We Built FortyStrong</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl text-balance">
          We got tired of watching good people <span className="text-primary">give up on their own bodies.</span>
        </h2>
        <div className="mt-8 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Somewhere around forty, the world starts handing people a story: this is just how it goes now. The
            stiffness. The lost strength. The slow creep of "I can't do that anymore." A doctor shrugs. A friend
            nods. And little by little, people stop expecting more from a body that still has decades of life left
            in it.
          </p>
          <p>
            We built FortyStrong because that story is wrong — and the science says so.
          </p>
          <p>
            Strength isn't something you lose to age. It's something you lose to neglect — and it's something you
            can rebuild at forty, fifty, sixty, and beyond. Not with punishing workouts built for twenty-five-year-olds.
            Not with a program that leaves you sore, discouraged, and quitting by week three. But with two focused
            sessions a week, a few walks, and a plan that meets your body exactly where it is today.
          </p>
          <p>
            We're not here to sell you a six-pack. We're here to help you carry your own groceries at seventy. To
            get down on the floor with your grandkids and get back up without thinking about it. To walk into your
            sixties stronger than you left your forties.
          </p>
          <p>
            FortyStrong is new — and we're building this community right now, one member at a time. If that mission
            speaks to you, we'd be honored to have you as one of our first.
          </p>
        </div>
        <p className="mt-10 font-display uppercase text-3xl md:text-4xl text-balance">
          Your prime isn't behind you. <span className="text-primary">It's waiting.</span>
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "I've never lifted weights. Is this for me?",
      a: "Yes — most members start as beginners. Every exercise has a video, a regression, and an honest starting weight. The program assumes nothing.",
    },
    {
      q: "Is two days a week really enough?",
      a: "For strength and longevity in your 40s, 50s, and 60s, two well-programmed sessions outperform five rushed ones. Recovery is where the work lands.",
    },
    {
      q: "I have a bad knee / shoulder / back.",
      a: "Every workout offers swaps. We'll point you at the right path. If something hurts, we don't push through — we change the movement.",
    },
    {
      q: "Do I need a gym?",
      a: "No. Choose Gym, Home (dumbbells/bands), or Bodyweight when you sign up. The plan adapts to your equipment.",
    },
    {
      q: "What if I cancel?",
      a: "One click in your account. No call. No retention pitch. We'd rather you come back willingly than stay reluctantly.",
    },
    {
      q: "Who's behind this?",
      a: "FortyStrong was built by a team that watched too many people over forty accept decline as inevitable — and decided to build the honest, science-based alternative. Read our full story in the 'Why We Built FortyStrong' section above.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-surface">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl text-balance">
          The questions <span className="text-primary">we hear most.</span>
        </h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {items.map((it, i) => (
            <div key={it.q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-lg md:text-xl uppercase tracking-wide">{it.q}</span>
                <span className={`text-primary text-2xl transition-transform ${open === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              {open === i && <p className="pb-6 text-muted-foreground">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Couples() {
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const handleBuy = () => {
    openCheckout({
      priceId: "couples_monthly",
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });
  };
  return (
    <section id="couples" className="py-20 md:py-28">

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>Couples</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          Stronger <span className="text-primary">together.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Train alongside your partner. Two individual dashboards. Shared streaks, shared milestones, and the only
          friendly competition that ends in both of you winning.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              src: couplesTraining.url,
              alt: "Couple training together with a kettlebell",
              white: "Two workouts a week. ",
              red: "Together.",
            },
            {
              src: couplesWalking.url,
              alt: "Couple walking together at sunset",
              white: "Every walk feels easier when you're ",
              red: "not doing it alone.",
            },
            {
              src: couplesNight.url,
              alt: "Couple out together at night",
              white: "Strength isn't just for the gym. It's for showing up — ",
              red: "for each other, for life.",
            },
          ].map((img) => (
            <figure key={img.red} className="relative overflow-hidden rounded-lg border border-border aspect-[4/5]">
              <img src={img.src} alt={img.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-left">
                <span className="font-display text-xl md:text-2xl font-bold text-white leading-tight">
                  {img.white}
                  <span className="text-primary">{img.red}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>


        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          {[
            { n: "94%", l: "Couples who start together stay together — vs 57% who go it alone" },
            { n: "50%", l: "Of people who quit exercising cite lack of a support partner as the reason." },
            { n: "1", l: "Plan. Two people. Two dashboards." },
          ].map((s) => (
            <div key={s.l} className="p-6 bg-surface border border-border rounded-lg">
              <div className="font-display text-5xl text-primary">{s.n}</div>
              <div className="mt-2 text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Based on a 12-month study in the Journal of Sports Medicine and Physical Fitness (Wallace et al., 1995).
        </p>

        <div className="mt-12 max-w-md p-8 bg-surface border border-primary rounded-lg shadow-[var(--shadow-red)]">
          <div className="font-display tracking-widest uppercase text-sm text-primary">Couples Plan</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-display text-6xl">$40</div>
            <div className="text-muted-foreground">/ month for two</div>
          </div>
          <p className="mt-3 text-muted-foreground">
            Two full memberships. Linked dashboards. Cancel anytime.
          </p>
          <button
            onClick={handleBuy}
            className="mt-6 w-full inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
          >
            Start As A Couple
          </button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={(v) => !v && closeCheckout()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-display uppercase tracking-wider">Checkout</DialogTitle>
          </DialogHeader>
          <div className="p-4">{checkoutElement}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
}


function Cancellation() {
  const items = [
    { t: "Single Plan", d: <>30-day refund. <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">Email us</a>, we send it back. Plan stays yours either way.</> },
    { t: "Monthly", d: "Cancel any time. One click in account settings. No forms. No phone calls." },
    { t: "Annual", d: "Cancel any time. Pro-rated refund inside 30 days. Honor the spirit, not the loophole." },
    { t: "Couples", d: "One partner cancels, the other can stay on at the regular monthly rate." },
  ];
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>Cancellation</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          You can leave <span className="text-primary">any time.</span>
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((i) => (
            <div key={i.t} className="p-6 bg-background border border-border rounded-lg">
              <h3 className="font-display text-xl uppercase">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-radial-red)" }} />
      <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-display uppercase text-5xl sm:text-6xl md:text-7xl text-balance">
          Your prime isn't behind you.
          <br />
          <span className="text-primary">It's waiting.</span>
        </h2>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Two workouts a week. Forty-five minutes each. Six weeks until you feel different. Start today.
        </p>
        <div className="mt-10">
          <CtaButton>See Plans</CtaButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center">
            <img src="/logo.png" alt="FortyStrong" className="h-14 md:h-16 w-auto object-contain" />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Reignite your prime. © FortyStrong.</div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#truth" className="hover:text-foreground">Truth</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#couples" className="hover:text-foreground">Couples</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/terms" className="hover:text-foreground">Terms</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 text-sm text-muted-foreground">
        Questions? Email us at <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <p className="text-xs text-muted-foreground max-w-4xl">
          FortyStrong provides general fitness and educational information only. It is not medical advice. Always
          consult your physician before beginning any exercise program, especially if you have an existing health
          condition, injury, or take medication. You participate at your own risk.
        </p>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Truth />
        <Science />
        <WhyFortyStrong />
        <VideoProof />
        <HowItWorks />
        <ProgressionEngine />
        <Pricing />
        <Couples />
        <FoundingMember />
        <Faq />
        <Cancellation />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
