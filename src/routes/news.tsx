import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "সংবাদ ও আপডেট — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "আন্দোলনের সর্বশেষ সংবাদ, প্রেস বিজ্ঞপ্তি ও বিবৃতি।" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter(
    (i) => !q || i.title.toLowerCase().includes(q.toLowerCase()) || i.excerpt?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-5xl md:text-6xl font-black">
            সংবাদ ও <span className="text-gradient-red">আপডেট</span>
          </h1>
          <p className="mt-3 text-muted-foreground">আন্দোলনের সর্বশেষ খবর ও বিবৃতি।</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="সংবাদ খুঁজুন..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-20">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((n) => (
            <article key={n.id} className="rounded-lg overflow-hidden border border-border bg-card transition hover:border-primary group">
              {n.cover_image ? (
                <img src={n.cover_image} alt="" className="h-48 w-full object-cover group-hover:scale-105 transition" loading="lazy" />
              ) : (
                <div className="h-48 bg-gradient-hero stripe-bg" />
              )}
              <div className="p-5">
                <div className="text-xs uppercase tracking-widest text-primary">
                  {new Date(n.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h2 className="mt-2 font-bold text-lg leading-tight">{n.title}</h2>
                {n.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
