import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

const STORAGE_KEY = "bg-music-enabled";
const AUDIO_SRC = "/background-music.mp3"; // public/background-music.mp3

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    audioRef.current = audio;
    setReady(true);

    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const wantPlay = saved !== "false"; // default ON

    if (wantPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => {
        // Autoplay blocked — start on first user interaction
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
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

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

  if (!ready) return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "ব্যাকগ্রাউন্ড মিউজিক বন্ধ করুন" : "ব্যাকগ্রাউন্ড মিউজিক চালু করুন"}
      title={playing ? "মিউজিক বন্ধ করুন" : "মিউজিক চালু করুন"}
      className="fixed bottom-5 left-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur shadow-glow transition hover:scale-105 hover:bg-primary hover:text-primary-foreground"
    >
      {playing ? (
        <Music className="size-5 animate-pulse" />
      ) : (
        <VolumeX className="size-5" />
      )}
    </button>
  );
}
