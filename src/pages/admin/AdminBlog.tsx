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
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function AdminBlog() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

const { data: posts } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });
      return data ?? [];
    },
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Blog Posts</h1>
           <p className="text-gray-500 mt-1">Manage articles, news, and updates.</p>
        </div>
        <Button onClick={() => navigate("/admin/blog/new")} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[60%]">Title & Excerpt</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {posts?.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="font-semibold text-gray-900 text-base">{p.title}</span>
                    {p.excerpt && (
                      <span className="text-sm text-gray-500 line-clamp-1 max-w-md">{p.excerpt}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Switch checked={p.published} onCheckedChange={(v) => togglePub.mutate({ id: p.id, published: v })} />
                      <Badge variant={p.published ? "default" : "secondary"} className={p.published ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 font-medium">
                  {new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell>
                   <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/admin/blog/${p.id}`)}>
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 border-red-200" onClick={() => { if (confirm("Delete?")) del.mutate(p.id); }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
             {posts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                  No blog posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
