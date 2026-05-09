import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "description", content: "আমাদের সাথে যোগাযোগ করুন।" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "নাম দিন").max(100),
  email: z.string().trim().email("সঠিক ইমেইল দিন").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "বার্তা লিখুন").max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("পাঠাতে সমস্যা হয়েছে");
      return;
    }
    toast.success("আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h1 className="font-display text-5xl md:text-6xl font-black">
            <span className="text-gradient-red">যোগাযোগ</span> করুন
          </h1>
          <p className="mt-4 text-muted-foreground">
            আপনার মতামত, প্রশ্ন বা পরামর্শ আমাদের জানান। আমরা যত দ্রুত সম্ভব উত্তর দেব।
          </p>

          <div className="mt-8 space-y-4">
            <ContactInfo icon={MapPin} label="অফিস" value="ঢাকা, বাংলাদেশ" />
            <ContactInfo icon={Mail} label="ইমেইল" value="contact@julycharter.org" />
            <ContactInfo icon={Phone} label="ফোন" value="+৮৮০ ১৭০০-০০০০০০" />
          </div>
        </div>

        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
          <div>
            <Label htmlFor="name">আপনার নাম *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="email">ইমেইল *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" required />
          </div>
          <div>
            <Label htmlFor="subject">বিষয়</Label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="message">বার্তা *</Label>
            <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5" required />
          </div>
          <Button type="submit" variant="hero" size="lg" disabled={submitting} className="w-full">
            {submitting ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}
