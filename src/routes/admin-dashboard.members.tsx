import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin-dashboard/members")({
  component: MembersPage,
});

function MembersPage() {
  const { user, isSuperAdmin, hasPermission } = useAuth();
  const canApprove = hasPermission("approve_registrations") || hasPermission("manage_members");
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const districts = Array.from(new Set(items.map((i) => i.district))).sort();
  const filtered = items.filter((i) =>
    (status === "all" || i.status === status) &&
    (district === "all" || i.district === district) &&
    (!q || i.full_name.toLowerCase().includes(q.toLowerCase()) || i.phone.includes(q))
  );

  const setMemberStatus = async (id: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase
      .from("members")
      .update({ status: newStatus, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(newStatus === "approved" ? "অনুমোদিত হলো" : "প্রত্যাখ্যান করা হলো");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("মুছে ফেলা হয়েছে");
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl md:text-4xl font-black">সদস্য ব্যবস্থাপনা</h1>
      <p className="text-muted-foreground mt-1">নতুন আবেদন অনুমোদন করুন ও সদস্যদের তালিকা পরিচালনা করুন।</p>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম বা ফোন খুঁজুন..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            <SelectItem value="pending">অপেক্ষমান</SelectItem>
            <SelectItem value="approved">অনুমোদিত</SelectItem>
            <SelectItem value="rejected">প্রত্যাখ্যাত</SelectItem>
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব জেলা</SelectItem>
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">নাম</th>
                <th className="text-left p-3">যোগাযোগ</th>
                <th className="text-left p-3">জেলা/থানা</th>
                <th className="text-left p-3">পেশা</th>
                <th className="text-left p-3">স্ট্যাটাস</th>
                <th className="text-right p-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-card/50">
                  <td className="p-3 font-medium">{m.full_name}</td>
                  <td className="p-3 text-muted-foreground">
                    <div>{m.phone}</div>
                    {m.email && <div className="text-xs">{m.email}</div>}
                  </td>
                  <td className="p-3 text-muted-foreground">{m.district} / {m.thana}</td>
                  <td className="p-3 text-muted-foreground">{m.profession}</td>
                  <td className="p-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">বিস্তারিত</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle>{m.full_name}</DialogTitle></DialogHeader>
                          <Detail m={m} />
                        </DialogContent>
                      </Dialog>
                      {canApprove && m.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setMemberStatus(m.id, "approved")} className="text-green-500">
                            <Check className="size-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setMemberStatus(m.id, "rejected")} className="text-destructive">
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      {isSuperAdmin && (
                        <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">কোনো সদস্য পাওয়া যায়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending: { label: "অপেক্ষমান", cls: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
    approved: { label: "অনুমোদিত", cls: "bg-green-500/15 text-green-500 border-green-500/30" },
    rejected: { label: "প্রত্যাখ্যাত", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  const v = map[status] ?? map.pending;
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${v.cls}`}>{v.label}</span>;
}

function Detail({ m }: { m: any }) {
  return (
    <div className="space-y-3 text-sm">
      <Row label="ফোন" value={m.phone} />
      {m.email && <Row label="ইমেইল" value={m.email} />}
      <Row label="জেলা" value={m.district} />
      <Row label="থানা" value={m.thana} />
      <Row label="পেশা" value={m.profession} />
      {m.education && <Row label="শিক্ষা" value={m.education} />}
      {m.nid && <Row label="NID" value={m.nid} />}
      {m.statement && <Row label="বক্তব্য" value={m.statement} />}
      {m.facebook_url && <Row label="Facebook" value={m.facebook_url} />}
      {m.twitter_url && <Row label="Twitter" value={m.twitter_url} />}
      <Row label="আবেদনের তারিখ" value={new Date(m.created_at).toLocaleDateString("bn-BD")} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="col-span-2 break-words">{value}</div>
    </div>
  );
}
