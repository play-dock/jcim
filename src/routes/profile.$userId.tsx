import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Globe, Facebook, Twitter, Mail, Phone, Cake, Pencil, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile/$userId")({
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      setProfile(p);
      setRoles((r ?? []).map((x: any) => x.role));
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="container mx-auto py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;
  if (!profile) return <div className="container mx-auto py-20 text-center">প্রোফাইল পাওয়া যায়নি।</div>;

  const isOwn = user?.id === userId;
  const initial = (profile.full_name || profile.email || "?")[0]?.toUpperCase();
  const isSuper = roles.includes("super_admin");
  const isMod = roles.includes("moderator");

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Cover */}
      <div className="relative h-56 md:h-80 bg-gradient-red overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 md:-mt-24 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="h-36 w-36 md:h-44 md:w-44 rounded-full border-4 border-background bg-card overflow-hidden shadow-glow">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-6xl font-display font-black bg-gradient-red text-primary-foreground">{initial}</div>
              )}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl md:text-4xl font-black">{profile.full_name || "(নামহীন)"}</h1>
              {isSuper && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider">সুপার অ্যাডমিন</span>}
              {!isSuper && isMod && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-bold uppercase tracking-wider">মডারেটর</span>}
            </div>
            {profile.profession && <p className="text-muted-foreground mt-1">{profile.profession}</p>}
            {profile.bio && <p className="mt-2 text-foreground/80 max-w-2xl">{profile.bio}</p>}
          </div>

          {isOwn && (
            <Button asChild variant="hero">
              <Link to="/profile/edit"><Pencil className="size-4 mr-1" /> প্রোফাইল সম্পাদনা</Link>
            </Button>
          )}
        </div>

        {/* Info grid */}
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="font-display text-lg font-black">পরিচিতি</h2>
            {profile.location && <Row icon={MapPin} text={profile.location} />}
            {profile.profession && <Row icon={Briefcase} text={profile.profession} />}
            {profile.website && <Row icon={Globe} text={profile.website} href={profile.website} />}
            {profile.phone && <Row icon={Phone} text={profile.phone} />}
            {profile.email && <Row icon={Mail} text={profile.email} />}
            {profile.date_of_birth && <Row icon={Cake} text={new Date(profile.date_of_birth).toLocaleDateString("bn-BD")} />}
            <div className="flex gap-3 pt-2">
              {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Facebook className="size-5" /></a>}
              {profile.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><Twitter className="size-5" /></a>}
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-black flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /> সদস্যতা ও ভূমিকা</h2>
            <div className="mt-3 text-sm text-muted-foreground">
              জুলাই সনদ বাস্তবায়ন আন্দোলনের সদস্য। যোগদানের তারিখ: {new Date(profile.created_at).toLocaleDateString("bn-BD")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, text, href }: any) {
  const inner = (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="size-4 text-primary shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer" className="hover:text-primary block">{inner}</a> : inner;
}
