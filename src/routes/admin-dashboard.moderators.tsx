import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ShieldCheck, UserMinus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-dashboard/moderators")({
  component: ModeratorsAdmin,
});

const ALL_PERMS: { key: string; label: string }[] = [
  { key: "manage_news", label: "সংবাদ ব্যবস্থাপনা" },
  { key: "manage_events", label: "ইভেন্ট ব্যবস্থাপনা" },
  { key: "manage_members", label: "সদস্য ব্যবস্থাপনা" },
  { key: "approve_registrations", label: "নিবন্ধন অনুমোদন" },
];

function ModeratorsAdmin() {
  const { isSuperAdmin } = useAuth();
  const [moderators, setModerators] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [perms, setPerms] = useState<string[]>([]);

  const load = async () => {
    // Get users with moderator role + their permissions + profile
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "moderator");

    const ids = (roles ?? []).map((r: any) => r.user_id);
    if (ids.length === 0) { setModerators([]); return; }

    const [{ data: profiles }, { data: permsData }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email").in("id", ids),
      supabase.from("moderator_permissions").select("user_id,permission").in("user_id", ids),
    ]);

    const list = (profiles ?? []).map((p: any) => ({
      ...p,
      permissions: (permsData ?? []).filter((x: any) => x.user_id === p.id).map((x: any) => x.permission),
    }));
    setModerators(list);
  };
  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const addModerator = async () => {
    if (!email) return toast.error("ইমেইল দিন");
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (pErr || !profile) {
      toast.error("এই ইমেইলে কোনো ব্যবহারকারী নেই। প্রথমে তাকে নিবন্ধন করতে বলুন।");
      return;
    }
    const userId = profile.id;

    // assign moderator role (if not already)
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "moderator" },
      { onConflict: "user_id,role" }
    );

    // grant permissions
    if (perms.length) {
      const rows = perms.map((p) => ({ user_id: userId, permission: p as any }));
      await supabase.from("moderator_permissions").upsert(rows, { onConflict: "user_id,permission" });
    }

    toast.success("মডারেটর যোগ হয়েছে");
    setOpen(false); setEmail(""); setPerms([]);
    load();
  };

  const togglePerm = async (userId: string, perm: string, has: boolean) => {
    if (has) {
      await supabase.from("moderator_permissions").delete().eq("user_id", userId).eq("permission", perm);
    } else {
      await supabase.from("moderator_permissions").insert({ user_id: userId, permission: perm as any });
    }
    load();
  };

  const removeModerator = async (userId: string) => {
    if (!confirm("মডারেটর মর্যাদা সরিয়ে নেবেন?")) return;
    await supabase.from("moderator_permissions").delete().eq("user_id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "moderator");
    toast.success("সরিয়ে নেওয়া হয়েছে");
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black flex items-center gap-2">
            <ShieldCheck className="size-7 text-primary" /> মডারেটর ব্যবস্থাপনা
          </h1>
          <p className="text-muted-foreground mt-1">মডারেটর যোগ করুন ও তাদের অনুমতি নির্ধারণ করুন।</p>
        </div>
        <Button onClick={() => setOpen(true)} variant="hero"><Plus className="size-4" /> মডারেটর যোগ</Button>
      </div>

      <div className="mt-6 space-y-3">
        {moderators.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-bold">{m.full_name || "(নামহীন)"}</div>
                <div className="text-sm text-muted-foreground">{m.email}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeModerator(m.id)} className="text-destructive">
                <UserMinus className="size-4 mr-1" /> সরান
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_PERMS.map((p) => {
                const has = m.permissions.includes(p.key);
                return (
                  <label key={p.key} className="flex items-center gap-2 text-sm rounded-md border border-border p-2.5 cursor-pointer hover:border-primary">
                    <Checkbox checked={has} onCheckedChange={() => togglePerm(m.id, p.key, has)} />
                    {p.label}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        {moderators.length === 0 && <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">কোনো মডারেটর নেই।</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>মডারেটর যোগ করুন</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ব্যবহারকারীর ইমেইল</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="moderator@example.com" className="mt-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">ব্যবহারকারীকে আগে সাইটে নিবন্ধন করতে বলুন।</p>
            </div>
            <div>
              <Label>অনুমতিসমূহ</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ALL_PERMS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm rounded-md border border-border p-2.5">
                    <Checkbox
                      checked={perms.includes(p.key)}
                      onCheckedChange={(v) => setPerms(v ? [...perms, p.key] : perms.filter((x) => x !== p.key))}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={addModerator} variant="hero" className="w-full">যোগ করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
