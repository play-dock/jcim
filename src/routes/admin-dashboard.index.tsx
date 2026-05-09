import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Newspaper, Calendar, MessageSquare, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin-dashboard/")({
  component: Overview,
});

function Overview() {
  const [stats, setStats] = useState({ membersAll: 0, membersPending: 0, membersApproved: 0, news: 0, events: 0, msgs: 0, msgsUnread: 0 });

  useEffect(() => {
    (async () => {
      const [a, p, ap, n, e, m, mu] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
      ]);
      setStats({
        membersAll: a.count ?? 0,
        membersPending: p.count ?? 0,
        membersApproved: ap.count ?? 0,
        news: n.count ?? 0,
        events: e.count ?? 0,
        msgs: m.count ?? 0,
        msgsUnread: mu.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "মোট সদস্য", value: stats.membersAll, icon: Users, color: "text-primary", to: "/admin-dashboard/members" },
    { label: "অপেক্ষমান অনুমোদন", value: stats.membersPending, icon: Clock, color: "text-yellow-500", to: "/admin-dashboard/members" },
    { label: "অনুমোদিত", value: stats.membersApproved, icon: CheckCircle2, color: "text-green-500", to: "/admin-dashboard/members" },
    { label: "প্রকাশিত সংবাদ", value: stats.news, icon: Newspaper, color: "text-primary", to: "/admin-dashboard/news" },
    { label: "ইভেন্ট", value: stats.events, icon: Calendar, color: "text-primary", to: "/admin-dashboard/events" },
    { label: "অপঠিত বার্তা", value: stats.msgsUnread, icon: MessageSquare, color: "text-primary", to: "/admin-dashboard/messages" },
  ];

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl md:text-4xl font-black">ওভারভিউ</h1>
      <p className="text-muted-foreground mt-1">সিস্টেমের সারসংক্ষেপ</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary transition group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="mt-2 font-display text-4xl font-black">
                  {c.value.toLocaleString("bn-BD")}
                </div>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-md bg-primary/10 ${c.color} group-hover:scale-110 transition`}>
                <c.icon className="size-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
