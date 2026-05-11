import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Music, Trash2, Upload, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-dashboard/music")({
  component: MusicAdmin,
});

type Track = {
  id: string;
  title: string;
  audio_url: string;
  active: boolean;
  display_order: number;
  created_at: string;
};

function MusicAdmin() {
  const { user, isStaff, loading } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("background_tracks")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setTracks((data as Track[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-6 text-muted-foreground">লোড হচ্ছে...</div>;
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center">
          <ShieldCheck className="mx-auto size-12 text-destructive" />
          <h1 className="mt-3 text-2xl font-black">প্রবেশাধিকার নেই</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">হোম</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("টাইটেল ও অডিও ফাইল দিন");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp3";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("music")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("music").getPublicUrl(path);
      const { error: insErr } = await supabase.from("background_tracks").insert({
        title: title.trim(),
        audio_url: pub.publicUrl,
        active: true,
      });
      if (insErr) throw insErr;
      toast.success("ট্র্যাক যোগ হয়েছে");
      setTitle("");
      setFile(null);
      (document.getElementById("audio-file") as HTMLInputElement | null) && ((document.getElementById("audio-file") as HTMLInputElement).value = "");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (t: Track) => {
    const { error } = await supabase
      .from("background_tracks")
      .update({ active: !t.active })
      .eq("id", t.id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (t: Track) => {
    if (!confirm(`"${t.title}" মুছে ফেলবেন?`)) return;
    const { error } = await supabase.from("background_tracks").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    // best-effort delete from storage
    try {
      const url = new URL(t.audio_url);
      const idx = url.pathname.indexOf("/music/");
      if (idx >= 0) {
        const path = url.pathname.slice(idx + "/music/".length);
        await supabase.storage.from("music").remove([path]);
      }
    } catch {}
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Music className="size-6 text-primary" />
        <h1 className="font-display text-2xl md:text-3xl font-black">ব্যাকগ্রাউন্ড মিউজিক</h1>
      </div>

      <form onSubmit={handleUpload} className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4 mb-8">
        <div className="grid gap-2">
          <Label htmlFor="title">গানের নাম</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: দেশের গান"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="audio-file">অডিও ফাইল (mp3, ogg, wav)</Label>
          <Input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <Button type="submit" disabled={uploading} variant="hero">
          <Upload className="size-4 mr-1" />
          {uploading ? "আপলোড হচ্ছে..." : "যোগ করুন"}
        </Button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">সব ট্র্যাক ({tracks.length})</h2>
        {tracks.length === 0 ? (
          <p className="text-muted-foreground text-sm">কোনো ট্র্যাক নেই।</p>
        ) : (
          tracks.map((t) => (
            <div
              key={t.id}
              className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{t.title}</div>
                <audio src={t.audio_url} controls className="mt-2 w-full max-w-md" preload="none" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={t.active ? "default" : "outline"}
                  onClick={() => toggleActive(t)}
                >
                  {t.active ? "একটিভ" : "নিষ্ক্রিয়"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(t)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
