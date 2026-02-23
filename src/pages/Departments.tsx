import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users } from "lucide-react";

export default function Departments() {
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("order_index");
      return data ?? [];
    },
  });

  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members-public"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").eq("visible", true).order("order_index");
      return data ?? [];
    },
  });

  const isLoading = isDepartmentsLoading || isMembersLoading;

  const grouped = departments?.map((dept) => ({
    ...dept,
    members: members?.filter((m) => m.department === dept.name) ?? [],
  }));

  return (
    <div className="min-h-screen bg-[#1a0b2e] font-sans">
      <div className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-20 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              Departments of <span className="font-serif italic text-purple-300">ThinkUp Academy</span>
            </h1>
            <p className="text-purple-100/80 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Meet the talented individuals driving innovation and excellence across our diverse departments.
            </p>
          </header>

          {isLoading ? (
            <div className="space-y-16">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-8">
                  <Skeleton className="h-10 w-64 bg-white/10 rounded-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, j) => (
                      <Skeleton key={j} className="h-80 rounded-2xl bg-white/5" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-24">
              {grouped?.map((dept) => (
                <div key={dept.id} className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Users className="w-6 h-6 text-purple-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-wide">
                      {dept.name}
                    </h2>
                  </div>
                  
                  {dept.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {dept.members.map((m) => (
                        <div 
                          key={m.id} 
                          className="group relative bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                        >
                          <div className="relative mb-6 mx-auto w-32 h-32">
                             <div className="absolute inset-0 bg-purple-100 rounded-full scale-95 group-hover:scale-110 transition-transform duration-500" />
                             {m.photo_url ? (
                              <img 
                                src={m.photo_url} 
                                alt={m.full_name} 
                                className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-sm" 
                              />
                            ) : (
                              <div className="relative w-full h-full rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm text-slate-400">
                                <User className="h-12 w-12" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                            {m.full_name}
                          </h3>
                          <p className="text-sm font-medium text-purple-600 uppercase tracking-wider mb-4">
                            {m.role}
                          </p>
                          
                          <div className="w-12 h-1 bg-purple-100 mx-auto rounded-full group-hover:w-24 group-hover:bg-purple-300 transition-all duration-300" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center backdrop-blur-sm">
                      <p className="text-purple-200/60 text-lg">No members found in this department yet.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
