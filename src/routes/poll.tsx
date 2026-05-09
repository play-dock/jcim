import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/poll")({
  head: () => ({
    meta: [
      { title: "জনমত — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "চলমান বিষয়ে আপনার মতামত প্রকাশ করুন।" },
    ],
  }),
  component: PollPage,
});

function getFingerprint() {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem("voter_fp");
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem("voter_fp", fp);
  }
  return fp;
}

function PollPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [voted, setVoted] = useState<Record<string, number>>({});
  const fp = typeof window !== "undefined" ? getFingerprint() : "";

  const load = async () => {
    const [{ data: p }, { data: v }] = await Promise.all([
      supabase.from("polls").select("*").eq("active", true).order("created_at", { ascending: false }),
      supabase.from("poll_votes").select("poll_id,option_index,voter_fingerprint"),
    ]);
    setPolls(p ?? []);
    setVotes(v ?? []);
    const local = JSON.parse(localStorage.getItem("voted_polls") || "{}");
    setVoted(local);
  };

  useEffect(() => { load(); }, []);

  const vote = async (pollId: string, idx: number) => {
    if (voted[pollId] !== undefined) return;
    const { error } = await supabase.from("poll_votes").insert({
      poll_id: pollId,
      option_index: idx,
      voter_fingerprint: fp,
    });
    if (error) {
      toast.error("ভোট দিতে সমস্যা হয়েছে");
      return;
    }
    const updated = { ...voted, [pollId]: idx };
    setVoted(updated);
    localStorage.setItem("voted_polls", JSON.stringify(updated));
    toast.success("আপনার ভোট গৃহীত হয়েছে");
    load();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-widest text-primary">
          <Vote className="size-3.5" /> জনমত জরিপ
        </div>
        <h1 className="mt-5 font-display text-5xl md:text-6xl font-black">
          আপনার <span className="text-gradient-red">মতামত</span> দিন
        </h1>
        <p className="mt-3 text-muted-foreground">প্রতিটি ভোট আমাদের সিদ্ধান্ত গঠনে গুরুত্বপূর্ণ।</p>
      </div>

      <div className="mt-12 space-y-6 max-w-3xl">
        {polls.length === 0 && (
          <div className="text-center py-20 border border-dashed border-border rounded-lg text-muted-foreground">
            এখনো কোনো সক্রিয় জরিপ নেই।
          </div>
        )}
        {polls.map((p) => {
          const opts: string[] = Array.isArray(p.options) ? p.options : [];
          const pollVotes = votes.filter((v) => v.poll_id === p.id);
          const total = pollVotes.length;
          const userVoted = voted[p.id] !== undefined;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg">{p.question}</h2>
              <div className="mt-4 space-y-2">
                {opts.map((opt, i) => {
                  const count = pollVotes.filter((v) => v.option_index === i).length;
                  const pct = total ? (count / total) * 100 : 0;
                  const selected = voted[p.id] === i;
                  return (
                    <button
                      key={i}
                      disabled={userVoted}
                      onClick={() => vote(p.id, i)}
                      className={`w-full text-left rounded-md border bg-background relative overflow-hidden transition ${
                        userVoted
                          ? "border-border cursor-default"
                          : "border-border hover:border-primary"
                      } ${selected ? "border-primary" : ""}`}
                    >
                      {userVoted && (
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/20"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <span className="font-medium flex items-center gap-2">
                          {selected && <CheckCircle2 className="size-4 text-primary" />}
                          {opt}
                        </span>
                        {userVoted && <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                মোট ভোট: {total.toLocaleString("bn-BD")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
