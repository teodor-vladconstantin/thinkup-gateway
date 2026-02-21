import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Departments</h1>
           <p className="text-gray-500 mt-1">Organize team structure and hierarchy.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Department
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[100px] text-center">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.map((d) => (
              <TableRow key={d.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-semibold text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    {d.name}
                  </div>
                </TableCell>
                <TableCell className="text-gray-500 font-mono text-sm">{d.slug}</TableCell>
                <TableCell className="text-center font-medium text-gray-600">{d.order_index}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditing(d.id); setForm({ name: d.name, slug: d.slug, description: d.description ?? "", order_index: d.order_index }); setOpen(true); }}>
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 border-red-200" onClick={() => { if (confirm("Delete department?")) del.mutate(d.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {departments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Order Index</Label><Input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} /></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full bg-primary hover:bg-primary/90 text-white mt-2">
              {save.isPending ? "Saving..." : "Save Department"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
