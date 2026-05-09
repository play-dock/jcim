import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ShieldCheck, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "হোম" },
  { to: "/about", label: "আমাদের সম্পর্কে" },
  { to: "/leadership", label: "নেতৃত্ব" },
  { to: "/news", label: "সংবাদ" },
  { to: "/events", label: "ইভেন্ট" },
  { to: "/poll", label: "জনমত" },
  { to: "/contact", label: "যোগাযোগ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isStaff, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-red font-display text-lg font-black text-primary-foreground shadow-glow">
            জ
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-extrabold tracking-tight">
              জুলাই সনদ
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              বাস্তবায়ন আন্দোলন
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                path === it.to
                  ? "text-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-secondary",
              )}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/join">যোগ দিন</Link>
          </Button>
          {user ? (
            <>
              {isStaff && (
                <Button asChild size="sm" variant="secondary">
                  <Link to="/admin-dashboard">
                    <ShieldCheck className="size-4 mr-1" /> ড্যাশবোর্ড
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                <LogOut className="size-4 mr-1" /> লগআউট
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="hero">
              <Link to="/login">
                <LogIn className="size-4 mr-1" /> লগইন
              </Link>
            </Button>
          )}
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto flex flex-col gap-1 p-4">
            {navItems.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm",
                  path === it.to ? "bg-secondary text-primary" : "text-foreground/80",
                )}
              >
                {it.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/join" onClick={() => setOpen(false)}>যোগ দিন</Link>
              </Button>
              {user ? (
                <Button size="sm" variant="ghost" onClick={() => signOut()}>
                  লগআউট
                </Button>
              ) : (
                <Button asChild size="sm" variant="hero" className="flex-1">
                  <Link to="/login" onClick={() => setOpen(false)}>লগইন</Link>
                </Button>
              )}
            </div>
            {user && isStaff && (
              <Button asChild size="sm" variant="secondary">
                <Link to="/admin-dashboard" onClick={() => setOpen(false)}>
                  অ্যাডমিন ড্যাশবোর্ড
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
