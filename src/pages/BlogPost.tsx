import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

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
      <div className="min-h-screen bg-[#1a0b2e] pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-8 bg-white rounded-2xl p-8 shadow-xl">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#1a0b2e] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-12 text-center max-w-md w-full shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-500 mb-8">The article you are looking for does not exist or has been removed.</p>
          <Link to="/blog" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#1a0b2e] font-sans">
      {/* Hero Header */}
      <div className="relative pt-32 pb-32 px-4 bg-gradient-to-b from-purple-900/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6 text-sm font-medium tracking-wide uppercase">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-purple-200/60 text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              5 min read
            </span>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4 pb-20 -mt-20 relative z-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {post.cover_image_url && (
            <div className="w-full aspect-video relative">
              <img 
                src={post.cover_image_url} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </div>
          )}
          
          <div className="p-8 md:p-12 lg:p-16">
            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 prose-img:rounded-xl">
              {post.content}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
