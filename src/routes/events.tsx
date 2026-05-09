import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "ইভেন্ট ও সমাবেশ — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "আসন্ন ইভেন্ট, র‍্যালি ও সমাবেশের তালিকা।" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const upcoming = items.filter((e) => new Date(e.event_date) >= new Date());
  const past = items.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="font-display text-5xl md:text-6xl font-black">
        ইভেন্ট ও <span className="text-gradient-red">সমাবেশ</span>
      </h1>
      <p className="mt-3 text-muted-foreground">আসন্ন র‍্যালি, সমাবেশ ও কর্মসূচিতে অংশ নিন।</p>

      <Section title="আসন্ন কর্মসূচি" items={upcoming} accent />
      <Section title="পূর্ববর্তী কর্মসূচি" items={past} />
    </div>
  );
}

function Section({ title, items, accent }: { title: string; items: any[]; accent?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-12">
      <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-2">
        <Calendar className="size-5 text-primary" /> {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <div
            key={e.id}
            className={`rounded-lg border bg-card p-5 transition ${
              accent ? "border-primary/40 shadow-glow" : "border-border opacity-70"
            }`}
          >
            <div className="text-xs uppercase tracking-widest text-primary font-semibold">
              {new Date(e.event_date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h3 className="mt-2 font-bold text-lg">{e.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.description}</p>
            {e.location && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {e.location}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
