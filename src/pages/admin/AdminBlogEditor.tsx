import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", published: false });

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("posts").select("*").eq("id", id).single().then(({ data }) => {
        if (data) setForm({ title: data.title, slug: data.slug, excerpt: data.excerpt ?? "", content: data.content ?? "", cover_image_url: data.cover_image_url ?? "", published: data.published });
      });
    }
  }, [id, isNew]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const save = async () => {
    setLoading(true);
    if (isNew) {
      const { error } = await supabase.from("posts").insert([form]);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("posts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", id!);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setLoading(false); return; }
    }
    setLoading(false);
    toast({ title: "Saved!" });
    navigate("/admin/blog");
  };

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate("/admin/blog")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isNew ? "New Post" : "Edit Post"}</h1>
      <div className="space-y-4 bg-white rounded-xl p-6 shadow-sm border">
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))} /></div>
        <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
        <div><Label>Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} /></div>
        <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={12} /></div>
        <div><Label>Cover Image URL</Label><Input value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} /></div>
        <div className="flex items-center gap-2"><Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} /><Label>Published</Label></div>
        <Button onClick={save} disabled={loading} className="bg-[hsl(263,91%,76%)] text-white">{loading ? "Saving..." : "Save Post"}</Button>
      </div>
    </div>
  );
}
