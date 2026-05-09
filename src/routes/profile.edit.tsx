import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfile,
});

function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setForm(data ?? {});
      setLoading(false);
    });
  }, [user]);

  if (authLoading || loading) return <div className="container mx-auto py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;
  if (!user) return (
    <div className="container mx-auto py-20 text-center">
      <p>লগইন প্রয়োজন।</p>
      <Button asChild variant="hero" className="mt-4"><Link to="/login">লগইন</Link></Button>
    </div>
  );

  const upload = async (file: File, bucket: "avatars" | "covers", field: "avatar_url" | "cover_url") => {
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setForm((f: any) => ({ ...f, [field]: data.publicUrl }));
  };

  const save = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...rest } = form;
    const { error } = await supabase.from("profiles").update(rest).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("সংরক্ষিত");
    navigate({ to: "/profile/$userId", params: { userId: user.id } });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-black">প্রোফাইল সম্পাদনা</h1>
      <p className="text-muted-foreground mt-1">আপনার তথ্য আপডেট করুন।</p>

      {/* Cover */}
      <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
        <div className="relative h-44 bg-gradient-red">
          {form.cover_url && <img src={form.cover_url} className="absolute inset-0 w-full h-full object-cover" />}
          <label className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/90 cursor-pointer text-xs hover:bg-background">
            <Upload className="size-3.5" /> কভার ফটো
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "covers", "cover_url")} />
          </label>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-secondary border-2 border-background overflow-hidden -mt-12 shadow">
            {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-2xl font-black bg-gradient-red text-primary-foreground">{(form.full_name || "?")[0]}</div>}
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border cursor-pointer text-xs hover:border-primary">
            <Upload className="size-3.5" /> প্রোফাইল ছবি
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "avatars", "avatar_url")} />
          </label>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Field label="পূর্ণ নাম" v={form.full_name} on={(v: string) => setForm({ ...form, full_name: v })} />
        <Field label="পেশা" v={form.profession} on={(v) => setForm({ ...form, profession: v })} />
        <Field label="ঠিকানা" v={form.location} on={(v) => setForm({ ...form, location: v })} />
        <Field label="ফোন" v={form.phone} on={(v) => setForm({ ...form, phone: v })} />
        <Field label="জন্ম তারিখ" type="date" v={form.date_of_birth} on={(v) => setForm({ ...form, date_of_birth: v })} />
        <Field label="লিঙ্গ" v={form.gender} on={(v) => setForm({ ...form, gender: v })} />
        <Field label="ওয়েবসাইট" v={form.website} on={(v) => setForm({ ...form, website: v })} />
        <Field label="ফেসবুক" v={form.facebook_url} on={(v) => setForm({ ...form, facebook_url: v })} />
        <Field label="টুইটার" v={form.twitter_url} on={(v) => setForm({ ...form, twitter_url: v })} />
      </div>

      <div className="mt-4">
        <Label>সংক্ষিপ্ত পরিচিতি (Bio)</Label>
        <Textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="mt-1.5" />
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={save} variant="hero" disabled={saving}><Save className="size-4 mr-1" /> {saving ? "সংরক্ষণ..." : "সংরক্ষণ"}</Button>
        <Button asChild variant="outline"><Link to="/profile/$userId" params={{ userId: user.id }}>বাতিল</Link></Button>
      </div>
    </div>
  );
}

function Field({ label, v, on, type = "text" }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={v ?? ""} onChange={(e) => on(e.target.value)} className="mt-1.5" />
    </div>
  );
}
