import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalHeader, LegalFooter } from "@/components/LegalChrome";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — FortyStrong" },
      { name: "description", content: "How FortyStrong collects, uses, and protects your data." },
      { property: "og:title", content: "Privacy Policy — FortyStrong" },
      { property: "og:description", content: "How FortyStrong collects, uses, and protects your data." },
      { property: "og:url", content: "https://fortystronghealth.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://fortystronghealth.com/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LegalHeader />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-16 md:py-24">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back home</Link>
        <h1 className="mt-6 font-display uppercase text-4xl md:text-5xl">FortyStrong Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 7/15/26</p>
        <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
          <p>FortyStrong ("we," "us") respects your privacy. This policy explains what we collect and how we use it.</p>
          <p><span className="text-foreground font-medium">What we collect:</span> Your name and email; account and payment information (processed securely by Stripe — we never store card numbers); fitness information you provide (activity level, goals, equipment, workout logs); and basic usage data.</p>
          <p><span className="text-foreground font-medium">How we use it:</span> To create and personalize your training plan, process payments, send you service and marketing emails (which you can opt out of anytime), and improve our product.</p>
          <p><span className="text-foreground font-medium">Who we share it with:</span> Only the service providers who help us operate — including Stripe (payments), Supabase (secure data hosting), and MailerLite (email). We do not sell your personal information.</p>
          <p><span className="text-foreground font-medium">Your health information:</span> Fitness and health details you enter are used solely to deliver your program. We are not a healthcare provider and this data is not medical record information.</p>
          <p><span className="text-foreground font-medium">Your choices:</span> You can access, update, or delete your account data by contacting <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a>. You can unsubscribe from marketing emails at any time.</p>
          <p><span className="text-foreground font-medium">Data security:</span> We use industry-standard measures to protect your information, though no method is 100% secure.</p>
          <p><span className="text-foreground font-medium">Contact:</span> <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a></p>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

