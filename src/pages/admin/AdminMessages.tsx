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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Messages</h1>
         <p className="text-gray-500 mt-1">Inbox for contact form submissions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {msgs?.map((m) => (
              <TableRow key={m.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    <span className="text-xs text-gray-500">{m.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-700">{m.subject}</TableCell>
                <TableCell className="text-sm text-gray-500 font-medium">
                  {new Date(m.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setViewing(m)}>
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 border-red-200" onClick={() => { if (confirm("Delete message?")) del.mutate(m.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {msgs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                  No messages found.
                </TableCell>
              </TableRow>
            )}
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
