import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, Newspaper, Calendar, ShieldCheck, MessageSquare,
  LogOut, Home, Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, isStaff, isSuperAdmin, hasPermission, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="text-center max-w-md">
          <ShieldCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 font-display text-3xl font-black">অনুমোদন প্রয়োজন</h1>
          <p className="mt-2 text-muted-foreground">এই পেজটি দেখতে আপনাকে লগইন করতে হবে।</p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/login">লগইন করুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="text-center max-w-md">
          <ShieldCheck className="mx-auto size-12 text-destructive" />
          <h1 className="mt-4 font-display text-3xl font-black">প্রবেশাধিকার নেই</h1>
          <p className="mt-2 text-muted-foreground">আপনার এই অংশে প্রবেশের অনুমতি নেই।</p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">হোমে ফিরুন</Link>
          </Button>
        </div>
      </div>
    );
  }

  const items = [
    { to: "/admin-dashboard", label: "ওভারভিউ", icon: LayoutDashboard, show: true, exact: true },
    { to: "/admin-dashboard/members", label: "সদস্য", icon: Users, show: hasPermission("manage_members") || hasPermission("approve_registrations") },
    { to: "/admin-dashboard/news", label: "সংবাদ", icon: Newspaper, show: hasPermission("manage_news") },
    { to: "/admin-dashboard/events", label: "ইভেন্ট", icon: Calendar, show: hasPermission("manage_events") },
    { to: "/admin-dashboard/polls", label: "জনমত", icon: Vote, show: isSuperAdmin },
    { to: "/admin-dashboard/messages", label: "বার্তা", icon: MessageSquare, show: true },
    { to: "/admin-dashboard/moderators", label: "মডারেটর", icon: ShieldCheck, show: isSuperAdmin },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-red font-display font-black text-primary-foreground">জ</div>
          <div className="leading-tight">
            <div className="font-display text-sm font-extrabold">জুলাই সনদ</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">অ্যাডমিন প্যানেল</div>
          </div>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {items.filter((i) => i.show).map((it) => {
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-glow"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <it.icon className="size-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-2 text-xs">
            <div className="font-semibold truncate">{user.email}</div>
            <div className="text-muted-foreground">
              {isSuperAdmin ? "সুপার অ্যাডমিন" : "মডারেটর"}
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/"><Home className="size-4 mr-1" /> ওয়েবসাইটে ফিরুন</Link>
          </Button>
          <Button onClick={() => signOut()} variant="ghost" size="sm" className="w-full">
            <LogOut className="size-4 mr-1" /> লগআউট
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* mobile top bar */}
        <div className="md:hidden border-b border-border bg-card flex items-center gap-2 overflow-x-auto p-2">
          {items.filter((i) => i.show).map((it) => {
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary",
                )}
              >
                <it.icon className="size-3.5" /> {it.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
