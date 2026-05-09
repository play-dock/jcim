import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-dashboard/news")({
  component: NewsAdmin,
});

function NewsAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", cover_image: "", published: true });

  const load = async () => {
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", cover_image: "", published: true });
    setOpen(true);
  };
  const openEdit = (n: any) => {
    setEditing(n);
    setForm({ title: n.title, excerpt: n.excerpt ?? "", content: n.content, cover_image: n.cover_image ?? "", published: n.published });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.content) { toast.error("শিরোনাম ও বিবরণ আবশ্যক"); return; }
    const payload = { ...form, author_id: user?.id, updated_at: new Date().toISOString() };
    const { error } = editing
      ? await supabase.from("news").update(payload).eq("id", editing.id)
      : await supabase.from("news").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "আপডেট হয়েছে" : "যোগ করা হয়েছে");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("নিশ্চিত?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black">সংবাদ ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1">সংবাদ যোগ, সম্পাদনা ও প্রকাশ করুন।</p>
        </div>
        <Button onClick={openNew} variant="hero"><Plus className="size-4" /> নতুন সংবাদ</Button>
      </div>

      <div className="mt-6 grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="rounded-lg border border-border bg-card p-4 flex gap-4 items-center">
            {n.cover_image && <img src={n.cover_image} alt="" className="h-16 w-24 object-cover rounded-md" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{n.title}</h3>
                {!n.published && <span className="text-xs bg-yellow-500/15 text-yellow-500 px-2 py-0.5 rounded-full">খসড়া</span>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{n.excerpt}</p>
              <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString("bn-BD")}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => openEdit(n)}><Pencil className="size-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => remove(n.id)} className="text-destructive"><Trash2 className="size-4" /></Button>
          </div>
        ))}
        {items.length === 0 && <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো সংবাদ নেই।</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "সংবাদ সম্পাদনা" : "নতুন সংবাদ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
            <div><Label>সংক্ষিপ্ত বিবরণ</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="mt-1.5" /></div>
            <div><Label>বিবরণ *</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5" /></div>
            <div><Label>কভার ছবি URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." className="mt-1.5" /></div>
            <div className="flex items-center gap-3"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label>প্রকাশ করুন</Label></div>
            <Button onClick={save} variant="hero" className="w-full">সংরক্ষণ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
