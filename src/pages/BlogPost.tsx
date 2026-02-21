import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("slug", slug!).eq("published", true).single();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Post not found</h1>
        <Link to="/blog" className="text-primary hover:underline">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-16 px-4">
      <Link to="/blog" className="inline-flex items-center gap-1 text-primary hover:underline mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-xl mb-8" />
      )}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">{post.title}</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
