import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "./AdminLayout";
import { Trash2 } from "lucide-react";

export default function AdminSettings() {
  const { role } = useAdmin();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("director");

  if (role !== "super_admin") return <p className="text-gray-500">Access denied.</p>;

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => { const { data } = await supabase.from("profiles").select("*"); return data ?? []; },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => { const { data } = await supabase.from("user_roles").select("*"); return data ?? []; },
  });

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
         <p className="text-gray-500 mt-1">Manage platform administrators and roles.</p>
      </div>

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
        Tip: To invite a new admin, they must first create an account on the public site. Once they are registered, they will appear in this list, and you can assign them a role.
      </div>
    </div>
  );
}
