import { createFileRoute } from "@tanstack/react-router";
import { Target, Heart, Globe, Scale } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "জুলাই সনদ বাস্তবায়ন আন্দোলনের লক্ষ্য, উদ্দেশ্য ও মূল্যবোধ।" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "লক্ষ্য", desc: "জুলাই সনদে উল্লেখিত প্রতিটি দাবি বাস্তবায়নের মাধ্যমে এক ন্যায়সঙ্গত রাষ্ট্র প্রতিষ্ঠা।" },
  { icon: Heart, title: "মূল্যবোধ", desc: "মানবতা, সততা, ন্যায়বিচার এবং জনগণের প্রতি অঙ্গীকার আমাদের ভিত্তি।" },
  { icon: Globe, title: "ভিশন", desc: "এক বাংলাদেশ যেখানে প্রতিটি নাগরিকের মর্যাদা, কণ্ঠস্বর ও অধিকার সুরক্ষিত।" },
  { icon: Scale, title: "ন্যায়বিচার", desc: "জুলাই বিপ্লবের শহীদদের জন্য ন্যায়বিচার এবং দায়মুক্তির অবসান।" },
];

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl">
        <h1 className="font-display text-5xl md:text-6xl font-black">
          আমাদের <span className="text-gradient-red">সম্পর্কে</span>
        </h1>
        <p className="mt-6 text-lg text-foreground/80 leading-relaxed">
          জুলাই সনদ বাস্তবায়ন আন্দোলন একটি অরাজনৈতিক, জনকেন্দ্রিক প্ল্যাটফর্ম যা জুলাই ২০২৪
          গণঅভ্যুত্থানে ঘোষিত সনদের প্রতিটি ধারা বাস্তবায়নের লক্ষ্যে গঠিত। শহীদদের রক্তের ঋণ
          শোধ করতে আমরা প্রতিশ্রুতিবদ্ধ।
        </p>
        <p className="mt-4 text-foreground/70 leading-relaxed">
          আমরা বিশ্বাস করি — গণতন্ত্র, মানবাধিকার, বাকস্বাধীনতা ও সুশাসন কোনো বিকল্প নয়,
          এগুলোই বাংলাদেশের ভবিষ্যৎ। আমাদের আন্দোলন সংঘাতের নয়, রূপান্তরের।
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-5">
        {values.map((v) => (
          <div key={v.title} className="rounded-lg border border-border bg-card p-6 hover:border-primary transition">
            <v.icon className="size-7 text-primary" />
            <h3 className="mt-4 font-display text-2xl font-bold">{v.title}</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-primary/30 bg-gradient-hero p-8 md:p-12">
        <h2 className="font-display text-3xl md:text-4xl font-black">আমাদের সনদ</h2>
        <ul className="mt-6 grid md:grid-cols-2 gap-4 text-foreground/85">
          {[
            "শহীদদের ন্যায়বিচার নিশ্চিত করা",
            "সংবিধানিক সংস্কার ও জবাবদিহিতা",
            "মানবাধিকার ও বাকস্বাধীনতা সুরক্ষা",
            "দুর্নীতির বিরুদ্ধে কঠোর অবস্থান",
            "বেকার যুবকদের কর্মসংস্থান",
            "নারীদের নিরাপত্তা ও মর্যাদা",
            "শিক্ষা ও স্বাস্থ্যখাতে আধুনিকায়ন",
            "প্রতিটি জেলায় গণতান্ত্রিক প্রতিনিধিত্ব",
          ].map((d, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
