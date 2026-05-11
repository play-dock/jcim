import { useEffect, useRef, useState } from "react";
import { Music, VolumeX, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "bg-music-enabled";
const FALLBACK_SRC = "/background-music.mp3";

type Track = { id: string; title: string; audio_url: string };

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Fetch active tracks from DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("background_tracks")
        .select("id,title,audio_url")
        .eq("active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      const list = (data as Track[]) ?? [];
      setTracks(list);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Create audio element once
  useEffect(() => {
    if (!ready) return;
    const src = tracks[0]?.audio_url ?? FALLBACK_SRC;
    const audio = new Audio(src);
    audio.loop = tracks.length <= 1;
    audio.volume = 0.35;
    audio.preload = "auto";
    audioRef.current = audio;

    const onEnded = () => {
      if (tracks.length > 1) {
        setIdx((i) => (i + 1) % tracks.length);
      }
    };
    audio.addEventListener("ended", onEnded);

    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const wantPlay = saved !== "false";

    if (wantPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => {
        const start = () => {
          audio.play().then(() => setPlaying(true)).catch(() => {});
          window.removeEventListener("pointerdown", start);
          window.removeEventListener("keydown", start);
        };
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
      });
    }

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Switch track when idx changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    const src = tracks[idx]?.audio_url;
    if (!src) return;
    audio.src = src;
    audio.loop = tracks.length <= 1;
    if (playing) {
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, tracks]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        setPlaying(true);
        localStorage.setItem(STORAGE_KEY, "true");
      }).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(STORAGE_KEY, "false");
    }
  };

  const next = () => {
    if (tracks.length > 1) setIdx((i) => (i + 1) % tracks.length);
  };

  if (!ready) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2">
      <button
        onClick={toggle}
        aria-label={playing ? "ব্যাকগ্রাউন্ড মিউজিক বন্ধ করুন" : "ব্যাকগ্রাউন্ড মিউজিক চালু করুন"}
        title={tracks[idx]?.title ?? (playing ? "মিউজিক বন্ধ" : "মিউজিক চালু")}
        className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur shadow-glow transition hover:scale-105 hover:bg-primary hover:text-primary-foreground"
      >
        {playing ? <Music className="size-5 animate-pulse" /> : <VolumeX className="size-5" />}
      </button>
      {tracks.length > 1 && (
        <button
          onClick={next}
          aria-label="পরবর্তী ট্র্যাক"
          title="পরবর্তী ট্র্যাক"
          className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur hover:bg-primary hover:text-primary-foreground transition"
        >
          <SkipForward className="size-4" />
        </button>
      )}
    </div>
  );
}
