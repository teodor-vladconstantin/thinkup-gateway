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
import { Badge } from "@/components/ui/badge";

export default function AdminPartners() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerForm>(empty);

  const { data: partners } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => { 
      const { data } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }); // Absolute stable sort
      return data ?? []; 
    },
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


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `partner-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `partners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setForm((f) => ({ ...f, logo_url: publicUrl }));
      toast({ title: "Logo uploaded successfully!" });
    } catch (error: any) {
      toast({ title: "Error uploading logo", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground">Partners</h1>
           <p className="text-muted-foreground mt-1">Manage strategic partnerships and supporters.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Partner
        </Button>
      </div>

      <div className="card-base overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners?.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="h-12 w-20 flex items-center justify-center bg-muted/50 rounded border p-1">
                    {p.logo_url ? <img src={p.logo_url} className="max-h-full max-w-full object-contain" alt={p.name} /> : <span className="text-xs text-muted-foreground">No logo</span>}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                <TableCell>
                   <a href={p.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm truncate max-w-[200px] block">
                    {p.website_url || "-"}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.visible} 
                      onCheckedChange={(v) => toggleVis.mutate({ id: p.id, visible: v })} 
                      className="data-[state=checked]:bg-primary"
                    />
                    <Badge variant={p.visible ? "default" : "secondary"} className={p.visible ? "bg-green-500 hover:bg-green-600" : ""}>
                      {p.visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditing(p.id); setForm({ name: p.name, logo_url: p.logo_url ?? "", website_url: p.website_url ?? "", order_index: p.order_index, visible: p.visible }); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Delete partner?")) del.mutate(p.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {partners?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>No partners added yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Partner" : "Add Partner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Partner Company Name" />
              </div>
              
              <div className="grid gap-2">
                <Label>Logo Image</Label>
                 <div className="flex gap-4 items-start">
                  <div className="shrink-0 h-16 w-16 border rounded bg-muted/50 flex items-center justify-center p-1">
                     {form.logo_url ? <img src={form.logo_url} alt="Preview" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground">Preview</span>}
                  </div>
                  <div className="w-full space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                     <div className="relative flex items-center py-1">
                        <div className="grow border-t border-muted"></div>
                        <span className="shrink-0 text-xs text-muted-foreground px-2 uppercase">OR URL</span>
                        <div className="grow border-t border-muted"></div>
                     </div>
                    <Input 
                      value={form.logo_url} 
                      onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} 
                      placeholder="Paste logo URL..." 
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
              </div>
              
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input id="order" type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
                  </div>
                   <div className="flex items-end pb-2">
                     <div className="flex items-center space-x-2">
                      <Switch id="visible" checked={form.visible} onCheckedChange={(v) => setForm((f) => ({ ...f, visible: v }))} />
                      <Label htmlFor="visible" className="cursor-pointer">Visible on site</Label>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending} className="min-w-[100px]">
                {save.isPending ? "Saving..." : "Save Partner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

