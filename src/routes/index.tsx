import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

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
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(192,57,43,0.6)]">
          <img src="/logo.png" alt="FortyStrong" className="h-14 md:h-16 w-auto object-contain" />
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
              <CtaButton href="#pricing" className="hidden sm:inline-flex !px-5 !py-2.5 !text-sm">
                Get My Free Plan
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
                  Get My Free Plan
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
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
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
            <CtaButton>Get My Free Plan</CtaButton>
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
    { t: "Mind Sharpens", d: "Resistance training reshapes the aging brain. Memory, focus, mood — measurably better." },
  ];
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>The Science</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          Strength is not vanity. <span className="text-primary">It's survival.</span>
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((s) => (
            <div key={s.t} className="p-6 bg-background border border-border rounded-lg">
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
            If you don't feel stronger in 30 days, email us. We'll refund every cent. No forms. No friction.
          </p>
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

function Testimonials() {
  const items = [
    {
      q: "I carried my granddaughter on my shoulders at the fair. I haven't done that in eight years.",
      n: "Mark, 58",
    },
    {
      q: "My morning stiffness is gone. Not better. Gone. I didn't know that was on the table.",
      n: "Lisa, 51",
    },
    {
      q: "Got off two of my prescriptions. Doctor asked what I changed. I said I started lifting.",
      n: "Eli, 62",
    },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionLabel>Real Outcomes</SectionLabel>
        <h2 className="mt-4 font-display uppercase text-4xl md:text-6xl max-w-3xl text-balance">
          Not before-and-afters. <span className="text-primary">Before-and-livings.</span>
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          {items.map((i) => (
            <figure key={i.n} className="p-8 bg-surface border border-border rounded-lg">
              <div className="text-primary font-display text-5xl leading-none">"</div>
              <blockquote className="mt-2 text-lg">{i.q}</blockquote>
              <figcaption className="mt-6 font-display tracking-widest uppercase text-sm text-muted-foreground">
                — {i.n}
              </figcaption>
            </figure>
          ))}
        </div>
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
      a: "A real founder, real coaches, and a lot of people who've been through their own forties. We answer our own emails.",
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


        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          {[
            { n: "94%", l: "Higher adherence when couples train together" },
            { n: "2.3x", l: "More likely to hit 90-day milestones" },
            { n: "1", l: "Plan. Two people. Two dashboards." },
          ].map((s) => (
            <div key={s.l} className="p-6 bg-surface border border-border rounded-lg">
              <div className="font-display text-5xl text-primary">{s.n}</div>
              <div className="mt-2 text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

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
    { t: "Single Plan", d: "30-day refund. Email us, we send it back. Plan stays yours either way." },
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
          <CtaButton>Get My Free Plan</CtaButton>
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
            <img src="/logo.png" alt="FortyStrong" className="h-11 w-auto object-contain" />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Reignite your prime. © FortyStrong.</div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <a href="#truth" className="hover:text-foreground">Truth</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#couples" className="hover:text-foreground">Couples</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </div>
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
        <HowItWorks />
        <Couples />
        <Pricing />
        <Testimonials />
        <Faq />
        <Cancellation />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
