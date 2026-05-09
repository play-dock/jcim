import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Youtube, MessageCircle, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-red font-display text-lg font-black text-primary-foreground">
              জ
            </div>
            <div>
              <div className="font-display text-lg font-extrabold">জুলাই সনদ বাস্তবায়ন আন্দোলন</div>
              <div className="text-xs text-muted-foreground">সনদ চাই, অধিকার চাই</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            জনগণের অধিকার, ন্যায়বিচার এবং গণতান্ত্রিক সংস্কারের পক্ষে একটি গণআন্দোলন।
            আমরা এক নতুন বাংলাদেশ গড়তে প্রতিশ্রুতিবদ্ধ।
          </p>
          <div className="mt-5 flex gap-3">
            <SocialLink href="https://facebook.com" Icon={Facebook} />
            <SocialLink href="https://twitter.com" Icon={Twitter} />
            <SocialLink href="https://youtube.com" Icon={Youtube} />
            <SocialLink href="https://chat.whatsapp.com" Icon={MessageCircle} />
            <SocialLink href="mailto:contact@example.com" Icon={Mail} />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">আমাদের সম্পর্কে</Link></li>
            <li><Link to="/leadership" className="hover:text-primary">নেতৃত্ব</Link></li>
            <li><Link to="/news" className="hover:text-primary">সংবাদ</Link></li>
            <li><Link to="/events" className="hover:text-primary">ইভেন্ট</Link></li>
            <li><Link to="/join" className="hover:text-primary">যোগ দিন</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">যোগাযোগ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>ঢাকা, বাংলাদেশ</li>
            <li>contact@julycharter.org</li>
            <li>+৮৮০ ১৭০০-০০০০০০</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} জুলাই সনদ বাস্তবায়ন আন্দোলন। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

function SocialLink({ href, Icon }: { href: string; Icon: typeof Facebook }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary hover:bg-primary/10"
    >
      <Icon className="size-4" />
    </a>
  );
}
