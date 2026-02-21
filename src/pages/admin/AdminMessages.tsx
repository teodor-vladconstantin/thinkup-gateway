import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2 } from "lucide-react";

export default function AdminMessages() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [viewing, setViewing] = useState<any>(null);

  const { data: msgs } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => { const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }); return data ?? []; },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("messages").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-messages"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {msgs?.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.subject}</TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setViewing(m)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(m.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><strong>From:</strong> {viewing.name} ({viewing.email})</p>
              <p><strong>Subject:</strong> {viewing.subject}</p>
              <p><strong>Message:</strong></p>
              <p className="whitespace-pre-wrap">{viewing.message || "No message content."}</p>
              <p className="text-gray-500"><strong>Received:</strong> {new Date(viewing.created_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
