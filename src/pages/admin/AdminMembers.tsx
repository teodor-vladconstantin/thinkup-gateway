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

type MemberForm = {
  full_name: string;
  role: string;
  department: string;
  order_index: number;
  visible: boolean;
  photo_url: string;
};

const empty: MemberForm = {
  full_name: "",
  role: "Mentor",
  department: "",
  order_index: 0,
  visible: true,
  photo_url: "",
};

import { Badge } from "@/components/ui/badge";

export default function AdminMembers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(empty);
  const [filter, setFilter] = useState("all");

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("order_index");
      return data ?? [];
    },
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });
      return data ?? [];
    },
  });

  const filtered = filter === "all" ? members : members?.filter((m) => m.department === filter);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        await supabase.from("members").update(form).eq("id", editing);
      } else {
        await supabase.from("members").insert([form]);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-members"] });
      setOpen(false);
      toast({ title: "Saved!" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("members").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-members"] });
      toast({ title: "Deleted" });
    },
  });

  const toggleVis = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      await supabase.from("members").update({ visible }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-members"] }),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `members/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setForm((f) => ({ ...f, photo_url: publicUrl }));
      toast({ title: "Photo uploaded successfully!" });
    } catch (error: any) {
      toast({ title: "Error uploading photo", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (m: any) => {
    setEditing(m.id);
    setForm({
      full_name: m.full_name,
      role: m.role,
      department: m.department,
      order_index: m.order_index,
      visible: m.visible,
      photo_url: m.photo_url ?? "",
    });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Members</h1>
          <p className="text-gray-500 mt-1">Manage team members, roles, and visibility.</p>
        </div>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map((m) => (
              <TableRow key={m.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-gray-900">{m.full_name}</TableCell>
                <TableCell className="text-gray-600 font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {m.role}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">{m.department}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={m.visible}
                      onCheckedChange={(v) => toggleVis.mutate({ id: m.id, visible: v })}
                    />
                    <Badge variant={m.visible ? "default" : "secondary"} className={m.visible ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}>
                      {m.visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 border-red-200"
                      onClick={() => {
                        if (confirm("Delete this member?")) del.mutate(m.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  No members found in this department.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>

            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Președinte", "CEO", "Vicepreședinte", "Director", "Mentor"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order Index</Label>
              <Input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-end pb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="visible-mode"
                  checked={form.visible}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))}
                />
                <Label htmlFor="visible-mode">Visible on site</Label>
              </div>
            </div>

            <div className="col-span-2 space-y-2 border-t pt-4 mt-2">
              <Label>Profile Photo</Label>
              <div className="flex gap-4 items-start">
                {form.photo_url && (
                  <img src={form.photo_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                )}
                <div className="w-full space-y-2">
                  <Input type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" />
                  <div className="text-xs text-gray-500 text-center uppercase tracking-wider font-semibold">OR</div>
                  <Input
                    value={form.photo_url}
                    onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                    placeholder="Paste image URL directly..."
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
          >
            {save.isPending ? "Saving..." : "Save Member"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
