import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Users, Calendar, Newspaper, Megaphone, Vote, Shield, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-rally.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "জুলাই সনদ বাস্তবায়ন আন্দোলন — সনদ চাই, অধিকার চাই" },
      { name: "description", content: "জনগণের অধিকার, ন্যায়বিচার ও গণতান্ত্রিক সংস্কারের পক্ষে একটি গণআন্দোলন। আজই যোগ দিন।" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Pillars />
      <LatestNews />
      <UpcomingEvents />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="বাংলাদেশের পতাকা হাতে সমাবেশ"
          className="h-full w-full object-cover object-center"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Flag className="size-3.5" /> জুলাই বিপ্লব ২০২৪
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
            সনদ চাই, <br />
            <span className="text-gradient-red">অধিকার চাই</span>
          </h1>

          <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
            জুলাই সনদ বাস্তবায়ন আন্দোলন — শহীদের রক্তে লেখা প্রতিশ্রুতি। আমরা গণতন্ত্র, ন্যায়বিচার এবং
            জনগণের অধিকারের পক্ষে এক ঐক্যবদ্ধ কণ্ঠস্বর। আজই আন্দোলনে যোগ দিন।
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/join">
                আন্দোলনে যোগ দিন <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">আমাদের সম্পর্কে জানুন</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" /> ৬৪ জেলায় কমিটি
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> হাজারো সক্রিয় সদস্য
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const [counts, setCounts] = useState({ members: 0, news: 0, events: 0 });
  useEffect(() => {
    (async () => {
      const [{ count: m }, { count: n }, { count: e }] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("news").select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ members: m ?? 0, news: n ?? 0, events: e ?? 0 });
    })();
  }, []);

  const items = [
    { label: "অনুমোদিত সদস্য", value: counts.members, icon: Users },
    { label: "জেলা কমিটি", value: 64, icon: Flag },
    { label: "প্রকাশিত সংবাদ", value: counts.news, icon: Newspaper },
    { label: "আয়োজিত ইভেন্ট", value: counts.events, icon: Calendar },
  ];
  return (
    <section className="border-y border-border bg-card/40 stripe-bg">
      <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="font-display text-3xl font-black">
                {value.toLocaleString("bn-BD")}<span className="text-primary">+</span>
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const pillars = [
  { icon: Megaphone, title: "গণআন্দোলন", desc: "জনগণের কণ্ঠস্বর হয়ে ন্যায়বিচার ও সংস্কারের দাবিতে রাজপথে।" },
  { icon: Shield, title: "অধিকার সুরক্ষা", desc: "মানবাধিকার, সংবিধান ও গণতান্ত্রিক মূল্যবোধের রক্ষাকবচ।" },
  { icon: Users, title: "তরুণ নেতৃত্ব", desc: "৬৪ জেলায় তরুণ সংগঠকদের নেতৃত্বে এক প্রজন্মের আন্দোলন।" },
  { icon: Vote, title: "জনমত", desc: "প্রতিটি সিদ্ধান্তে জনগণের মতামতই চূড়ান্ত — এক স্বচ্ছ গণতন্ত্র।" },
];

function Pillars() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight">
          আমাদের <span className="text-gradient-red">মূলনীতি</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          চারটি স্তম্ভের ওপর দাঁড়িয়ে আছে জুলাই সনদ বাস্তবায়ন আন্দোলন।
        </p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition hover:border-primary"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/30" />
            <p.icon className="size-7 text-primary" />
            <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestNews() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("news")
      .select("id,title,excerpt,cover_image,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setItems(data ?? []));
  }, []);

  if (items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-8">
        <h2 className="font-display text-4xl font-black">সর্বশেষ সংবাদ</h2>
        <Link to="/news" className="text-sm text-primary hover:underline">সব সংবাদ →</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((n) => (
          <article key={n.id} className="rounded-lg overflow-hidden border border-border bg-card transition hover:border-primary">
            {n.cover_image && (
              <img src={n.cover_image} alt="" className="h-44 w-full object-cover" loading="lazy" />
            )}
            <div className="p-5">
              <h3 className="font-bold leading-tight">{n.title}</h3>
              {n.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>}
              <div className="mt-3 text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleDateString("bn-BD")}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("events")
      .select("id,title,description,location,event_date")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3)
      .then(({ data }) => setItems(data ?? []));
  }, []);

  if (items.length === 0) return null;
  return (
    <section className="bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-4xl font-black">আসন্ন ইভেন্ট</h2>
          <Link to="/events" className="text-sm text-primary hover:underline">সব ইভেন্ট →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((e) => (
            <div key={e.id} className="rounded-lg border border-border bg-background p-5 hover:border-primary transition">
              <div className="text-xs uppercase tracking-widest text-primary">
                {new Date(e.event_date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <h3 className="mt-2 font-bold">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.description}</p>
              {e.location && <div className="mt-3 text-xs text-muted-foreground">📍 {e.location}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-hero p-10 md:p-16 text-center shadow-glow">
        <div className="absolute inset-0 stripe-bg opacity-50" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-6xl font-black">
            আপনার কণ্ঠস্বরই <br className="md:hidden" /> <span className="text-gradient-red">আমাদের শক্তি</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-foreground/80">
            একটি ন্যায়সঙ্গত বাংলাদেশ গড়তে আপনার সমর্থন অপরিহার্য। আজই আন্দোলনে যোগ দিন।
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" variant="hero">
              <Link to="/join">এখনই যোগ দিন <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/poll">জনমত দিন</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
