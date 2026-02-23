import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts-public"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-[#1a0b2e] font-sans">
      <div className="relative pt-32 pb-20 px-4">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <header className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Our <span className="font-serif italic text-purple-300">Blog</span>
            </h1>
            <p className="text-purple-100/80 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Insights, updates, and stories from the ThinkUp Academy community.
            </p>
          </header>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg h-[400px]">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`} 
                  className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {post.cover_image_url ? (
                      <img 
                        src={post.cover_image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm tracking-widest uppercase">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow p-8">
                    <div className="flex items-center justify-between text-xs font-medium text-purple-600 mb-4 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-gray-100">
                      <span className="text-sm font-bold text-purple-700 flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read Story <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              
              {posts?.length === 0 && (
                <div className="col-span-full text-center py-24 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xl text-white/60 font-light">No articles published yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
