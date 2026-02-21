import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2 } from "lucide-react";

export default function AdminApplications() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [viewing, setViewing] = useState<any>(null);

  const { data: apps } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => { const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false }); return data ?? []; },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("applications").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-applications"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>School</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {apps?.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.first_name} {a.last_name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.school}</TableCell>
                <TableCell>{a.reason}</TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setViewing(a)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(a.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {viewing.first_name} {viewing.last_name}</p>
              <p><strong>Email:</strong> {viewing.email}</p>
              <p><strong>Date of Birth:</strong> {viewing.dob}</p>
              <p><strong>Phone:</strong> {viewing.phone}</p>
              <p><strong>Reason:</strong> {viewing.reason}</p>
              <p><strong>Source:</strong> {viewing.source}</p>
              <p><strong>School:</strong> {viewing.school}</p>
              <p><strong>Submitted:</strong> {new Date(viewing.created_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
