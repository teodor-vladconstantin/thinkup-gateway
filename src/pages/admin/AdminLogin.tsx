import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import { getAdminHomeRoute } from "./access";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const redirectIfSignedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const role = roles?.[0]?.role ?? null;
      if (role) {
        navigate(getAdminHomeRoute(role), { replace: true });
      }
    };

    redirectIfSignedIn();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return;
    }

    const userId = data.user?.id ?? data.session?.user.id;
    if (!userId) {
      toast({ title: "Login failed", description: "Could not resolve your session.", variant: "destructive" });
      return;
    }

    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roleError) {
      toast({ title: "Login failed", description: roleError.message, variant: "destructive" });
      return;
    }

    const role = roles?.[0]?.role ?? null;
    if (!role) {
      await supabase.auth.signOut();
      toast({ title: "Access denied", description: "No admin role was assigned to this account.", variant: "destructive" });
      return;
    }

    navigate(getAdminHomeRoute(role), { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,33%,14%)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="h-7 w-7 text-[hsl(263,91%,76%)]" />
          <span className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>thinkup admin</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><Label className="text-gray-700">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label className="text-gray-700">Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-[hsl(263,91%,76%)] text-white hover:opacity-90">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
