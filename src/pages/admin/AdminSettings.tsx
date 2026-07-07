import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "./AdminLayout";
import { canAccessSettings } from "./access";
import { Trash2, Plus, X } from "lucide-react";

const DEFAULT_CLOSED_MESSAGE = "Recruitările sunt momentan închise. Revino mai târziu pentru o nouă deschidere.";

export default function AdminSettings() {
  const { role } = useAdmin();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("director");

  // Create user form state
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>("director");

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => { const { data } = await supabase.from("profiles").select("*"); return data ?? []; },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => { const { data } = await supabase.from("user_roles").select("*"); return data ?? []; },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      return data;
    },
  });

  const applicationsOpen = siteSettings?.applications_open ?? true;
  const closedMessage = siteSettings?.applications_closed_message ?? DEFAULT_CLOSED_MESSAGE;

  const getRoleFor = (userId: string) => roles?.find((r) => r.user_id === userId)?.role ?? "none";

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      if (newRole !== "none") {
        await supabase.from("user_roles").insert([{ user_id: userId, role: newRole as any }]);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-user-roles"] }); toast({ title: "Role updated" }); },
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No active session");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: newEmail,
          full_name: newName,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-role-counts"] });
      toast({ title: "User created", description: `${newName} (${newEmail}) has been added.` });
      setNewEmail("");
      setNewName("");
      setNewPassword("");
      setNewRole("director");
      setCreateOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create user", description: err.message, variant: "destructive" });
    },
  });

  const toggleApplications = useMutation({
    mutationFn: async (applicationsOpen: boolean) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ applications_open: applicationsOpen })
        .eq("id", 1);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
      toast({ title: "Recruitment status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update recruitment status", description: err.message, variant: "destructive" });
    },
  });

  if (!canAccessSettings(role)) return <p className="text-gray-500">Access denied.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform administrators and roles.</p>
      </div>

      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Recruitment status</h2>
              <Badge variant={applicationsOpen ? "default" : "secondary"} className={applicationsOpen ? "bg-green-600 hover:bg-green-700 font-normal" : "font-normal"}>
                {applicationsOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 max-w-2xl">
              When closed, the Join Us page shows a notice and the database rejects new applications.
            </p>
            <p className="text-xs text-gray-400">Message shown to visitors: {closedMessage}</p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-3 bg-gray-50">
            <Switch
              checked={applicationsOpen}
              disabled={toggleApplications.isPending}
              onCheckedChange={(checked) => toggleApplications.mutate(checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              {applicationsOpen ? "Accepting applications" : "Not accepting applications"}
            </span>
          </div>
        </div>
      </div>

      {/* Create User Section */}
      <div className="mb-6">
        {!createOpen ? (
          <Button onClick={() => setCreateOpen(true)} className="bg-[hsl(263,91%,76%)] text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Create New User
          </Button>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New User</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Email</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700">Full Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700">Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="vicepresident">Vice President</SelectItem>
                    <SelectItem value="blog_editor">Blog Editor</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => createUser.mutate()}
                disabled={createUser.isPending || !newEmail || !newName || !newPassword || newPassword.length < 6}
                className="bg-[hsl(263,91%,76%)] text-white hover:opacity-90"
              >
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{p.full_name || "Unknown Name"}</span>
                    <span className="text-xs text-gray-500">{p.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={getRoleFor(p.user_id)} onValueChange={(v) => updateRole.mutate({ userId: p.user_id, newRole: v })}>
                    <SelectTrigger className="w-[180px] h-8 bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Role</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="vicepresident">Vice President</SelectItem>
                      <SelectItem value="blog_editor">Blog Editor</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {profiles?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        Users created here will have their email auto-confirmed and can log in immediately.
      </div>
    </div>
  );
}
