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
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Members</h1>
          <p className="text-muted-foreground mt-1">Manage team members, roles, and visibility.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="w-[100px]">Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
               </TableRow>
            ) : filtered?.map((m) => (
              <TableRow key={m.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.full_name} className="w-10 h-10 rounded-full object-cover border shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground">{m.full_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-xs">
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{m.department}</TableCell>

                <TableCell>
                  <Switch
                    checked={m.visible}
                    onCheckedChange={(v) => toggleVis.mutate({ id: m.id, visible: v })}
                    className="data-[state=checked]:bg-primary"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Delete this member?")) del.mutate(m.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="h-8 w-8 opacity-20" />
                    <p>No members found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Member" : "Add New Member"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="e.g. John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
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

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger id="department">
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

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={form.order_index}
                onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end pb-2">
              <div className="flex items-center space-x-2">
                 <Switch
                  id="visible"
                  checked={form.visible}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))}
                />
                <Label htmlFor="visible" className="cursor-pointer">Visible on site</Label>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t">
              <Label>Profile Photo</Label>
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="Preview" className="w-20 h-20 rounded-full object-cover border shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-dashed">
                      <User className="h-8 w-8 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Upload Image</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or using URL</span>
                    </div>
                  </div>
                  <Input
                    value={form.photo_url}
                    onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <Button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="min-w-[120px]"
              >
                {save.isPending ? "Saving..." : "Save Member"}
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
