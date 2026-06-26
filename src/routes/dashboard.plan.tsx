import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/plan")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Plan — FortyStrong" }] }),
  component: () => <ComingSoon title="My Plan" />,
});

function ComingSoon({ title }: { title: string }) {
  return (
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-20 text-center">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        {title}
      </div>
      <h1 className="mt-4 font-display uppercase text-5xl md:text-6xl">Coming soon</h1>
      <p className="mt-6 text-muted-foreground text-lg">
        Your full training plan lands here next. Stay tuned.
      </p>
    </section>
  );
}
