import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

export function LegalHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <Link
          to="/"
          hash="pricing"
          className="font-display tracking-wider uppercase text-xs md:text-sm px-4 py-2 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow transition-colors"
        >
          See Plans
        </Link>
      </div>
    </header>
  );
}

export function LegalFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} FortyStrong. All rights reserved.</div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <a href="mailto:coach@fortystronghealth.com" className="hover:text-foreground">
            coach@fortystronghealth.com
          </a>
        </div>
      </div>
    </footer>
  );
}
