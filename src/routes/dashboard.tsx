import { createFileRoute, Link, Outlet, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Dumbbell, LineChart, LogOut, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — FortyStrong" }] }),
  component: DashboardLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/plan", label: "My Plan", icon: Dumbbell },
  { to: "/dashboard/progress", label: "Progress", icon: LineChart },
  { to: "/dashboard/account", label: "Account", icon: User },
] as const;

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] md:h-[88px] flex items-center justify-between">
          <Link to="/" className="flex items-center transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(192,57,43,0.6)]">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-4 py-2 rounded-sm font-display tracking-widest uppercase text-xs transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-sm font-display tracking-widest uppercase text-xs text-muted-foreground hover:text-primary transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-background/95 backdrop-blur z-50">
        <div className="grid grid-cols-4">
          {navItems.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-3 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-display tracking-wider uppercase text-[10px]">
                  {n.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
