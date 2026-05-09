import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Flag } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "আন্দোলনে যোগ দিন — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "আজই আন্দোলনে সদস্য হিসেবে যোগ দিন।" },
    ],
  }),
  component: JoinPage,
});

const districts = [
  "ঢাকা","চট্টগ্রাম","খুলনা","রাজশাহী","সিলেট","বরিশাল","রংপুর","ময়মনসিংহ",
  "কুমিল্লা","নারায়ণগঞ্জ","গাজীপুর","নরসিংদী","ফরিদপুর","মাদারীপুর","গোপালগঞ্জ",
  "কিশোরগঞ্জ","টাঙ্গাইল","জামালপুর","শেরপুর","নেত্রকোনা","সুনামগঞ্জ","হবিগঞ্জ",
  "মৌলভীবাজার","নোয়াখালী","ফেনী","লক্ষ্মীপুর","চাঁদপুর","কক্সবাজার","বান্দরবান",
  "রাঙামাটি","খাগড়াছড়ি","দিনাজপুর","পাবনা","বগুড়া","যশোর","কুষ্টিয়া","সাতক্ষীরা",
];

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().trim().min(2).max(100),
  profession: z.string().trim().min(2).max(100),
  education: z.string().trim().max(200).optional(),
  nid: z.string().trim().max(30).optional(),
  statement: z.string().trim().max(1000).optional(),
  facebook_url: z.string().trim().max(255).optional(),
  twitter_url: z.string().trim().max(255).optional(),
});

function JoinPage() {
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", district: "", thana: "",
    profession: "", education: "", nid: "", statement: "",
    facebook_url: "", twitter_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message || "সব ফিল্ড সঠিকভাবে পূরণ করুন");
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...parsed.data, user_id: user?.id ?? null };
    if (!payload.email) delete (payload as any).email;
    const { error } = await supabase.from("members").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("আবেদন জমা দিতে সমস্যা হয়েছে");
      return;
    }
    setDone(true);
    toast.success("আপনার আবেদন গৃহীত হয়েছে!");
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto size-16 text-primary" />
        <h1 className="mt-6 font-display text-4xl font-black">ধন্যবাদ!</h1>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          আপনার আবেদন গৃহীত হয়েছে। আমাদের কেন্দ্রীয় দল যাচাইয়ের পর আপনাকে যোগাযোগ করা হবে।
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-widest text-primary">
            <Flag className="size-3.5" /> সদস্য নিবন্ধন
          </div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-black">
            আন্দোলনে <span className="text-gradient-red">যোগ দিন</span>
          </h1>
          <p className="mt-3 text-muted-foreground">আজই সদস্য হোন। আপনার আবেদন কেন্দ্রীয় কমিটি অনুমোদন করবে।</p>
        </div>

        <form onSubmit={submit} className="mt-10 rounded-xl border border-border bg-card p-6 md:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="full_name" label="পূর্ণ নাম *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field id="phone" label="ফোন নম্বর *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          </div>
          <Field id="email" type="email" label="ইমেইল" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>জেলা *</Label>
              <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="জেলা নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field id="thana" label="থানা/উপজেলা *" value={form.thana} onChange={(v) => setForm({ ...form, thana: v })} required />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="profession" label="পেশা *" value={form.profession} onChange={(v) => setForm({ ...form, profession: v })} required />
            <Field id="education" label="শিক্ষাগত যোগ্যতা" value={form.education} onChange={(v) => setForm({ ...form, education: v })} />
          </div>

          <Field id="nid" label="জাতীয় পরিচয়পত্র (NID)" value={form.nid} onChange={(v) => setForm({ ...form, nid: v })} />

          <div>
            <Label htmlFor="statement">কেন আন্দোলনে যোগ দিতে চান?</Label>
            <Textarea
              id="statement"
              rows={4}
              value={form.statement}
              onChange={(e) => setForm({ ...form, statement: e.target.value })}
              className="mt-1.5"
              placeholder="আপনার অনুপ্রেরণা সংক্ষেপে লিখুন..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="facebook_url" label="Facebook প্রোফাইল" value={form.facebook_url} onChange={(v) => setForm({ ...form, facebook_url: v })} />
            <Field id="twitter_url" label="Twitter/X প্রোফাইল" value={form.twitter_url} onChange={(v) => setForm({ ...form, twitter_url: v })} />
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={submitting} className="w-full">
            {submitting ? "জমা হচ্ছে..." : "আবেদন জমা দিন"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            আবেদন জমা দিয়ে আপনি আমাদের নীতিমালার সাথে সম্মত হচ্ছেন।
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" required={required} />
    </div>
  );
}
