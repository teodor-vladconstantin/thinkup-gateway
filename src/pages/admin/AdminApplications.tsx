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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Applications</h1>
         <p className="text-gray-500 mt-1">Review incoming membership applications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps?.map((a) => (
              <TableRow key={a.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{a.first_name} {a.last_name}</span>
                    <span className="text-xs text-gray-500">{a.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{a.school}</TableCell>
                <TableCell className="max-w-xs truncate text-gray-500" title={a.reason}>{a.reason}</TableCell>
                <TableCell className="text-sm text-gray-500 font-medium">
                  {new Date(a.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setViewing(a)}>
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 border-red-200" onClick={() => { if (confirm("Delete application?")) del.mutate(a.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {apps?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No applications received yet.
                </TableCell>
              </TableRow>
            )}
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
