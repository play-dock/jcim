import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen } from "lucide-react";

export const Route = createFileRoute("/admin-dashboard/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggleRead = async (m: any) => {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl md:text-4xl font-black">যোগাযোগ বার্তা</h1>
      <p className="text-muted-foreground mt-1">সাইট থেকে আসা সব বার্তা।</p>

      <div className="mt-6 space-y-3">
        {items.map((m) => (
          <div key={m.id} className={`rounded-lg border p-5 ${m.read ? "border-border bg-card/50" : "border-primary/40 bg-card shadow-glow"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <strong>{m.name}</strong>
                  <span className="text-xs text-muted-foreground">&lt;{m.email}&gt;</span>
                </div>
                {m.subject && <div className="text-sm font-medium mt-1">{m.subject}</div>}
                <p className="mt-2 text-sm text-foreground/85 whitespace-pre-wrap">{m.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("bn-BD")}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => toggleRead(m)}>
                {m.read ? <MailOpen className="size-4" /> : <Mail className="size-4 text-primary" />}
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো বার্তা নেই।</div>}
      </div>
    </div>
  );
}
