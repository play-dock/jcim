import { createFileRoute } from "@tanstack/react-router";
import { Crown, Users, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import founderImg from "@/assets/founder.jpg";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "নেতৃত্ব — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "প্রতিষ্ঠাতা ও কেন্দ্রীয় নেতৃবৃন্দ এবং জেলা কমিটি।" },
    ],
  }),
  component: LeadershipPage,
});

const districts = [
  "ঢাকা","চট্টগ্রাম","খুলনা","রাজশাহী","সিলেট","বরিশাল","রংপুর","ময়মনসিংহ",
  "কুমিল্লা","নারায়ণগঞ্জ","গাজীপুর","নরসিংদী","ফরিদপুর","মাদারীপুর","গোপালগঞ্জ","কিশোরগঞ্জ",
  "টাঙ্গাইল","জামালপুর","শেরপুর","নেত্রকোনা","সুনামগঞ্জ","হবিগঞ্জ","মৌলভীবাজার","নোয়াখালী",
  "ফেনী","লক্ষ্মীপুর","চাঁদপুর","কক্সবাজার","বান্দরবান","রাঙামাটি","খাগড়াছড়ি","দিনাজপুর",
];

function LeadershipPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("leadership").select("*").eq("active", true).order("display_order").then(({ data }) => {
      setLeaders(data ?? []);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-widest text-primary">
          <Crown className="size-3.5" /> কেন্দ্রীয় নেতৃত্ব
        </div>
        <h1 className="mt-5 font-display text-5xl md:text-6xl font-black">
          আমাদের <span className="text-gradient-red">নেতৃত্ব</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          তরুণ, সাহসী এবং প্রতিশ্রুতিবদ্ধ নেতৃত্বের পরিচয়।
        </p>
      </div>

      {/* Founder */}
      <div className="mt-14 grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-gradient-red opacity-30 blur-2xl" />
          <img
            src={founderImg}
            alt="রবিউল ইসলাম রিয়ান"
            className="relative rounded-2xl border-2 border-primary/40 shadow-glow w-full max-w-md mx-auto"
            width={800}
            height={1024}
            loading="lazy"
          />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">প্রতিষ্ঠাতা ও আহ্বায়ক</div>
          <h2 className="mt-2 font-display text-4xl md:text-5xl font-black">রবিউল ইসলাম রিয়ান</h2>
          <p className="mt-4 text-foreground/80 leading-relaxed">
            জুলাই সনদ বাস্তবায়ন আন্দোলনের প্রতিষ্ঠাতা ও প্রধান আহ্বায়ক। জুলাই বিপ্লবের সম্মুখসারির
            একজন সংগঠক হিসেবে দীর্ঘদিন ধরে গণতান্ত্রিক অধিকার ও সামাজিক ন্যায়বিচারের পক্ষে কাজ করছেন।
          </p>
          <blockquote className="mt-5 border-l-4 border-primary pl-4 italic text-foreground/90">
            "আমরা শুধু সনদ চাই না — আমরা চাই এমন এক বাংলাদেশ যেখানে প্রতিটি নাগরিকের কণ্ঠস্বর শোনা হবে।"
          </blockquote>
        </div>
      </div>

      {/* Dynamic leaders */}
      {leaders.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="size-6 text-primary" />
            <h2 className="font-display text-3xl md:text-4xl font-black">কেন্দ্রীয় নেতৃবৃন্দ</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leaders.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary transition group">
                <div className="aspect-[4/5] bg-secondary relative overflow-hidden">
                  {l.photo_url ? (
                    <img src={l.photo_url} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-6xl font-display font-black text-muted-foreground">
                      {l.name?.[0]}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-widest text-primary">{l.role}</div>
                  <h3 className="mt-1 font-display text-xl font-black">{l.name}</h3>
                  {l.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{l.bio}</p>}
                  <div className="mt-3 flex items-center gap-3 text-muted-foreground">
                    {l.facebook_url && <a href={l.facebook_url} target="_blank" rel="noreferrer" className="hover:text-primary"><Facebook className="size-4" /></a>}
                    {l.twitter_url && <a href={l.twitter_url} target="_blank" rel="noreferrer" className="hover:text-primary"><Twitter className="size-4" /></a>}
                    {l.email && <a href={`mailto:${l.email}`} className="hover:text-primary"><Mail className="size-4" /></a>}
                    {l.phone && <a href={`tel:${l.phone}`} className="hover:text-primary"><Phone className="size-4" /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Districts */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-6">
          <Users className="size-6 text-primary" />
          <h2 className="font-display text-3xl md:text-4xl font-black">জেলা কমিটি</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          আমাদের আন্দোলন বাংলাদেশের প্রতিটি জেলায় ছড়িয়ে রয়েছে।
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {districts.map((d) => (
            <div key={d} className="rounded-md border border-border bg-card px-3 py-2.5 text-sm font-medium hover:border-primary hover:bg-primary/5 transition">
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
