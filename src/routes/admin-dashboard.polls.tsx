import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-dashboard/polls")({
  component: PollsAdmin,
});

function PollsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", options: ["", ""], active: true });

  const load = async () => {
    const { data } = await supabase.from("polls").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.question || form.options.filter((o) => o.trim()).length < 2) {
      toast.error("প্রশ্ন ও কমপক্ষে ২টি অপশন দিন"); return;
    }
    const { error } = await supabase.from("polls").insert({
      question: form.question,
      options: form.options.filter((o) => o.trim()),
      active: form.active,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("জরিপ যোগ হয়েছে");
    setOpen(false);
    setForm({ question: "", options: ["", ""], active: true });
    load();
  };

  const toggle = async (p: any) => {
    await supabase.from("polls").update({ active: !p.active }).eq("id", p.id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("নিশ্চিত?")) return;
    await supabase.from("polls").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black">জনমত জরিপ</h1>
          <p className="text-muted-foreground mt-1">জরিপ তৈরি ও পরিচালনা করুন।</p>
        </div>
        <Button onClick={() => setOpen(true)} variant="hero"><Plus className="size-4" /> নতুন জরিপ</Button>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold">{p.question}</h3>
              <div className="flex items-center gap-2">
                <Switch checked={p.active} onCheckedChange={() => toggle(p)} />
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {(p.options as string[]).map((o, i) => <li key={i}>• {o}</li>)}
            </ul>
          </div>
        ))}
        {items.length === 0 && <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো জরিপ নেই।</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন জরিপ</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>প্রশ্ন</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-1.5" /></div>
            <div className="space-y-2">
              <Label>অপশনসমূহ</Label>
              {form.options.map((o, i) => (
                <Input key={i} value={o} onChange={(e) => {
                  const next = [...form.options]; next[i] = e.target.value; setForm({ ...form, options: next });
                }} placeholder={`অপশন ${i + 1}`} />
              ))}
              <Button size="sm" variant="outline" onClick={() => setForm({ ...form, options: [...form.options, ""] })}>+ অপশন যোগ করুন</Button>
            </div>
            <div className="flex items-center gap-3"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>সক্রিয়</Label></div>
            <Button onClick={save} variant="hero" className="w-full">সংরক্ষণ</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
