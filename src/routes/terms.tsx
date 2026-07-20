import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalHeader, LegalFooter } from "@/components/LegalChrome";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — FortyStrong" },
      { name: "description", content: "The terms governing your use of FortyStrong." },
      { property: "og:title", content: "Terms of Service — FortyStrong" },
      { property: "og:description", content: "The terms governing your use of FortyStrong." },
      { property: "og:url", content: "https://fortystronghealth.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://fortystronghealth.com/terms" }],
  }),
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LegalHeader />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 py-16 md:py-24">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back home</Link>
        <h1 className="mt-6 font-display uppercase text-4xl md:text-5xl">FortyStrong Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 7/15/26</p>
        <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
          <p>By using FortyStrong, you agree to these terms.</p>
          <p><span className="text-foreground font-medium">The service:</span> FortyStrong provides personalized fitness programming and tracking tools. It is a general fitness product, not medical advice or treatment.</p>
          <p><span className="text-foreground font-medium">Eligibility:</span> You must be at least 18 years old and able to safely participate in physical exercise. You confirm you have consulted a physician if you have any condition that could make exercise unsafe.</p>
          <p><span className="text-foreground font-medium">Assumption of risk:</span> Exercise carries inherent risks. You participate voluntarily and at your own risk. To the fullest extent permitted by law, FortyStrong is not liable for any injury, loss, or damage arising from your use of the program.</p>
          <p><span className="text-foreground font-medium">Payments & billing:</span> Prices are listed on our site. Subscriptions renew automatically until cancelled. You may cancel anytime through your account settings.</p>
          <p><span className="text-foreground font-medium">Refunds:</span> We offer a 30-day money-back guarantee as described on our pricing page. Contact <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a> to request a refund.</p>
          <p><span className="text-foreground font-medium">Your account:</span> You are responsible for keeping your login secure and for all activity under your account.</p>
          <p><span className="text-foreground font-medium">Intellectual property:</span> All FortyStrong content, programming, and materials are our property and may not be copied or resold.</p>
          <p><span className="text-foreground font-medium">Changes:</span> We may update these terms; continued use means acceptance of the updated terms.</p>
          <p><span className="text-foreground font-medium">Contact:</span> <a href="mailto:coach@fortystronghealth.com" className="text-primary hover:underline">coach@fortystronghealth.com</a></p>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
}

