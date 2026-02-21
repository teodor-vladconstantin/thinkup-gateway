import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User } from "lucide-react";

type MemberForm = { full_name: string; role: string; department: string; order_index: number; visible: boolean; photo_url: string };
const empty: MemberForm = { full_name: "", role: "Mentor", department: "", order_index: 0, visible: true, photo_url: "" };

export default function AdminMembers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(empty);
  const [filter, setFilter] = useState("all");

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: async () => { const { data } = await supabase.from("departments").select("*").order("order_index"); return data ?? []; } });
  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => { const { data } = await supabase.from("members").select("*").order("order_index"); return data ?? []; },
  });

  const filtered = filter === "all" ? members : members?.filter((m) => m.department === filter);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) { await supabase.from("members").update(form).eq("id", editing); }
      else { await supabase.from("members").insert([form]); }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-members"] }); setOpen(false); toast({ title: "Saved!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("members").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-members"] }); toast({ title: "Deleted" }); },
  });

  const toggleVis = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => { await supabase.from("members").update({ visible }).eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-members"] }),
  });

  const openEdit = (m: any) => { setEditing(m.id); setForm({ full_name: m.full_name, role: m.role, department: m.department, order_index: m.order_index, visible: m.visible, photo_url: m.photo_url ?? "" }); setOpen(true); };
  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <Button onClick={openNew} className="bg-[hsl(263,91%,76%)] text-white"><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
      </div>

      <div className="mb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments?.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Photo</TableHead><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Visible</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered?.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.photo_url ? <img src={m.photo_url} className="w-8 h-8 rounded-full object-cover" /> : <User className="h-5 w-5 text-gray-400" />}</TableCell>
                <TableCell className="font-medium">{m.full_name}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell>{m.department}</TableCell>
                <TableCell><Switch checked={m.visible} onCheckedChange={(v) => toggleVis.mutate({ id: m.id, visible: v })} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this member?")) del.mutate(m.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
            <div><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Președinte", "CEO", "Vicepreședinte", "Director", "Mentor"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments?.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Order Index</Label><Input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label>Photo URL</Label><Input value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} placeholder="Upload via storage or paste URL" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.visible} onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))} /><Label>Visible</Label></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full bg-[hsl(263,91%,76%)] text-white">
              {save.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
