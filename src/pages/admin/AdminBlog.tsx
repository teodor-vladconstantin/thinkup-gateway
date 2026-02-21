import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminBlog() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => { const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false }); return data ?? []; },
  });

  const togglePub = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => { await supabase.from("posts").update({ published }).eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("posts").delete().eq("id", id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-posts"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Button onClick={() => navigate("/admin/blog/new")} className="bg-[hsl(263,91%,76%)] text-white"><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Published</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {posts?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell><Switch checked={p.published} onCheckedChange={(v) => togglePub.mutate({ id: p.id, published: v })} /></TableCell>
                <TableCell className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/blog/${p.id}`)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
