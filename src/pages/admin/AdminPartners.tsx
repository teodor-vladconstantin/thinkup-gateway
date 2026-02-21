import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

type PartnerForm = { name: string; logo_url: string; website_url: string; order_index: number; visible: boolean };
const empty: PartnerForm = { name: "", logo_url: "", website_url: "", order_index: 0, visible: true };

export default function AdminPartners() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerForm>(empty);

  const { data: partners } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => { const { data } = await supabase.from("partners").select("*").order("order_index"); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) await supabase.from("partners").update(form).eq("id", editing);
      else await supabase.from("partners").insert([form]);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-partners"] }); setOpen(false); toast({ title: "Saved!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("partners").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-partners"] }); toast({ title: "Deleted" }); },
  });

  const toggleVis = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => { await supabase.from("partners").update({ visible }).eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-partners"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="bg-[hsl(263,91%,76%)] text-white"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Logo</TableHead><TableHead>Name</TableHead><TableHead>Website</TableHead><TableHead>Visible</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {partners?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.logo_url ? <img src={p.logo_url} className="h-8 object-contain" /> : "—"}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-sm">{p.website_url}</TableCell>
                <TableCell><Switch checked={p.visible} onCheckedChange={(v) => toggleVis.mutate({ id: p.id, visible: v })} /></TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p.id); setForm({ name: p.name, logo_url: p.logo_url ?? "", website_url: p.website_url ?? "", order_index: p.order_index, visible: p.visible }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Logo URL</Label><Input value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} /></div>
            <div><Label>Website URL</Label><Input value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} /></div>
            <div><Label>Order Index</Label><Input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.visible} onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))} /><Label>Visible</Label></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full bg-[hsl(263,91%,76%)] text-white">{save.isPending ? "Saving..." : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
