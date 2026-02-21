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
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{isNew ? "New Post" : "Edit Post"}</h1>
        </div>
        <div className="flex items-center gap-4">
           {!isNew && (
             <span className="text-sm text-muted-foreground mr-2">
               {form.slug}
             </span>
           )}
           <Button onClick={save} disabled={loading} className="min-w-[120px]">
             {loading ? "Saving..." : "Save Post"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card-base p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">Title</Label>
              <Input 
                id="title" 
                placeholder="Post title..." 
                className="text-lg py-6"
                value={form.title} 
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: isNew ? slugify(e.target.value) : f.slug }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-muted-foreground">Slug</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/blog/</span>
                <Input 
                  id="slug" 
                  value={form.slug} 
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} 
                  className="pl-14 font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea 
                id="excerpt" 
                placeholder="Short summary for preview cards..." 
                className="resize-none"
                rows={3}
                value={form.excerpt} 
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea 
                id="content" 
                placeholder="Write your post content here..." 
                className="font-mono text-sm leading-relaxed"
                value={form.content} 
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} 
                rows={20} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-base p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Published</Label>
                  <p className="text-xs text-muted-foreground">
                    Publicly visible on the blog
                  </p>
                </div>
                <Switch checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
             </div>
          </div>

          <div className="card-base p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                {form.cover_image_url ? (
                  <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>
              <Input 
                id="cover_image" 
                placeholder="https://..." 
                value={form.cover_image_url} 
                onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} 
              />
              <p className="text-xs text-muted-foreground">URL for the cover image.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
