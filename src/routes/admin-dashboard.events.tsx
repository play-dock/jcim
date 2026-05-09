import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-dashboard/events")({
  component: EventsAdmin,
});

function EventsAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", cover_image: "" });

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", location: "", event_date: "", cover_image: "" });
    setOpen(true);
  };
  const openEdit = (n: any) => {
    setEditing(n);
    setForm({
      title: n.title, description: n.description, location: n.location ?? "",
      event_date: new Date(n.event_date).toISOString().slice(0, 16),
      cover_image: n.cover_image ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.description || !form.event_date) { toast.error("সব আবশ্যক ফিল্ড পূরণ করুন"); return; }
    const payload = {
      ...form,
      event_date: new Date(form.event_date).toISOString(),
      author_id: user?.id,
    };
    const { error } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "আপডেট হয়েছে" : "যোগ করা হয়েছে");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("নিশ্চিত?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black">ইভেন্ট ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1">র‍্যালি, সমাবেশ ও কর্মসূচি যোগ করুন।</p>
        </div>
        <Button onClick={openNew} variant="hero"><Plus className="size-4" /> নতুন ইভেন্ট</Button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <div key={e.id} className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-primary">{new Date(e.event_date).toLocaleDateString("bn-BD")}</div>
            <h3 className="mt-1.5 font-bold">{e.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
            {e.location && <div className="mt-2 text-xs text-muted-foreground">📍 {e.location}</div>}
            <div className="mt-3 flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(e.id)} className="text-destructive"><Trash2 className="size-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো ইভেন্ট নেই।</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "সম্পাদনা" : "নতুন ইভেন্ট"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>শিরোনাম *</Label><Input value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} className="mt-1.5" /></div>
            <div><Label>তারিখ ও সময় *</Label><Input type="datetime-local" value={form.event_date} onChange={(ev) => setForm({ ...form, event_date: ev.target.value })} className="mt-1.5" /></div>
            <div><Label>স্থান</Label><Input value={form.location} onChange={(ev) => setForm({ ...form, location: ev.target.value })} className="mt-1.5" /></div>
            <div><Label>বিবরণ *</Label><Textarea rows={5} value={form.description} onChange={(ev) => setForm({ ...form, description: ev.target.value })} className="mt-1.5" /></div>
            <div><Label>কভার ছবি URL</Label><Input value={form.cover_image} onChange={(ev) => setForm({ ...form, cover_image: ev.target.value })} className="mt-1.5" /></div>
            <Button onClick={save} variant="hero" className="w-full">সংরক্ষণ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
