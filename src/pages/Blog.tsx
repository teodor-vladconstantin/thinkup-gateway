import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts-public"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Our blog</h1>
        <p className="text-muted-foreground mb-10 text-lg">Discover our articles</p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                  {post.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>}
                  <span className="mt-3 inline-block text-sm text-primary font-medium">Learn more →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
