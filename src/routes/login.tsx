import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "লগইন / নিবন্ধন — জুলাই সনদ বাস্তবায়ন আন্দোলন" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [busy, setBusy] = useState(false);

  const [li, setLi] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ email: "", password: "", full_name: "" });

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(li.email, li.password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("স্বাগতম!");
    navigate({ to: "/admin-dashboard" });
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (su.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    setBusy(true);
    const { error } = await signUp(su.email, su.password, su.full_name);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("নিবন্ধন সম্পন্ন! ইমেইল যাচাই করুন বা সরাসরি লগইন করুন।");
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-gradient-red font-display text-xl font-black text-primary-foreground">জ</div>
          <div className="text-left">
            <div className="font-display text-lg font-extrabold leading-tight">জুলাই সনদ</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">বাস্তবায়ন আন্দোলন</div>
          </div>
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
              <Flag className="size-3" /> নিরাপদ অ্যাক্সেস
            </div>
            <h1 className="mt-3 font-display text-2xl font-black">অ্যাকাউন্টে প্রবেশ</h1>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">লগইন</TabsTrigger>
              <TabsTrigger value="signup">নিবন্ধন</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-5">
              <form onSubmit={onLogin} className="space-y-4">
                <div>
                  <Label htmlFor="li-email">ইমেইল</Label>
                  <Input id="li-email" type="email" required value={li.email} onChange={(e) => setLi({ ...li, email: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="li-pw">পাসওয়ার্ড</Label>
                  <Input id="li-pw" type="password" required value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} className="mt-1.5" />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? "অপেক্ষা করুন..." : "লগইন করুন"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <form onSubmit={onSignup} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">পূর্ণ নাম</Label>
                  <Input id="su-name" required value={su.full_name} onChange={(e) => setSu({ ...su, full_name: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="su-email">ইমেইল</Label>
                  <Input id="su-email" type="email" required value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="su-pw">পাসওয়ার্ড</Label>
                  <Input id="su-pw" type="password" required minLength={6} value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} className="mt-1.5" />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={busy}>
                  {busy ? "অপেক্ষা করুন..." : "নিবন্ধন করুন"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  প্রথম নিবন্ধিত ব্যবহারকারী স্বয়ংক্রিয়ভাবে সুপার অ্যাডমিন হবেন।
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
