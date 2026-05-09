import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin-dashboard/leadership")({
  component: LeadershipAdmin,
});

type Leader = {
  id?: string;
  name: string;
  role: string;
  bio?: string;
  photo_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  email?: string;
  phone?: string;
  display_order?: number;
  active?: boolean;
};

const empty: Leader = { name: "", role: "", display_order: 0, active: true };

function LeadershipAdmin() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Leader>(empty);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("leadership").select("*").order("display_order");
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.role) return toast.error("নাম ও পদবি দরকার");
    const payload = { ...form };
    if (form.id) {
      const { error } = await supabase.from("leadership").update(payload).eq("id", form.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("leadership").insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("সংরক্ষিত হয়েছে");
    setOpen(false); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলবেন?")) return;
    await supabase.from("leadership").delete().eq("id", id);
    load();
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("leadership").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("leadership").getPublicUrl(path);
    setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    setUploading(false);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black flex items-center gap-2">
            <Crown className="size-7 text-primary" /> নেতৃত্ব ব্যবস্থাপনা
          </h1>
          <p className="text-muted-foreground mt-1">নেতৃবৃন্দের তালিকা যোগ, সম্পাদনা ও মুছে ফেলুন।</p>
        </div>
        <Button onClick={() => { setForm(empty); setOpen(true); }} variant="hero">
          <Plus className="size-4" /> নতুন যোগ
        </Button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((l) => (
          <div key={l.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="aspect-[4/3] bg-secondary">
              {l.photo_url ? <img src={l.photo_url} alt={l.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-4xl font-black text-muted-foreground">{l.name?.[0]}</div>}
            </div>
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-widest text-primary">{l.role}</div>
              <div className="font-bold">{l.name}</div>
              <div className="text-xs text-muted-foreground mt-1">ক্রম: {l.display_order} {l.active ? "• সক্রিয়" : "• নিষ্ক্রিয়"}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setForm(l); setOpen(true); }}><Pencil className="size-3.5" /> সম্পাদনা</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(l.id)}><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো নেতৃত্ব যোগ করা হয়নি।</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "সম্পাদনা" : "নতুন নেতৃত্ব যোগ"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>নাম *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
              <div><Label>পদবি *</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label>সংক্ষিপ্ত পরিচিতি</Label><Textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="mt-1.5" /></div>
            <div>
              <Label>ছবি</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {form.photo_url && <img src={form.photo_url} className="h-16 w-16 rounded object-cover" />}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border cursor-pointer hover:border-primary text-sm">
                  <Upload className="size-4" /> {uploading ? "আপলোড হচ্ছে..." : "ছবি আপলোড"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ফেসবুক</Label><Input value={form.facebook_url ?? ""} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} className="mt-1.5" /></div>
              <div><Label>টুইটার</Label><Input value={form.twitter_url ?? ""} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} className="mt-1.5" /></div>
              <div><Label>ইমেইল</Label><Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
              <div><Label>ফোন</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div><Label>প্রদর্শন ক্রম</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="mt-1.5" /></div>
              <label className="flex items-center gap-2 pb-2"><Switch checked={form.active ?? true} onCheckedChange={(v) => setForm({ ...form, active: v })} /> সক্রিয়</label>
            </div>
            <Button onClick={save} variant="hero" className="w-full">সংরক্ষণ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
