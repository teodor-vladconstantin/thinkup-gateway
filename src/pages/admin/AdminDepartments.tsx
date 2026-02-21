import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

type DeptForm = { name: string; slug: string; description: string; order_index: number };
const empty: DeptForm = { name: "", slug: "", description: "", order_index: 0 };

export default function AdminDepartments() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<DeptForm>(empty);

  const { data: departments } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => { const { data } = await supabase.from("departments").select("*").order("order_index"); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await supabase.from("departments").update(form).eq("id", editing);
      else await supabase.from("departments").insert([form]);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-departments"] }); setOpen(false); toast({ title: "Saved!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("departments").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-departments"] }); toast({ title: "Deleted" }); },
  });

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="bg-[hsl(263,91%,76%)] text-white"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Order</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {departments?.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.slug}</TableCell>
                <TableCell>{d.order_index}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(d.id); setForm({ name: d.name, slug: d.slug, description: d.description ?? "", order_index: d.order_index }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(d.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Order Index</Label><Input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} /></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full bg-[hsl(263,91%,76%)] text-white">{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
