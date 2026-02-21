import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

export default function Departments() {
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("order_index");
      return data ?? [];
    },
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["members-public"],
    queryFn: async () => {
      const { data } = await supabase.from("members").select("*").eq("visible", true).order("order_index");
      return data ?? [];
    },
  });

  const grouped = departments?.map((dept) => ({
    ...dept,
    members: members?.filter((m) => m.department === dept.name) ?? [],
  }));

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-foreground mb-10">Departments of ThinkUp Academy</h1>

        {isLoading ? (
          <div className="space-y-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-12">
            {grouped?.map((dept) => (
              <div key={dept.id}>
                <h2 className="text-2xl font-bold text-foreground mb-4 border-b border-border pb-2">{dept.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {dept.members.map((m) => (
                    <div key={m.id} className="bg-muted rounded-xl p-4 text-center">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.full_name} className="w-20 h-20 rounded-full mx-auto object-cover mb-3" />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto bg-primary/20 flex items-center justify-center mb-3">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-foreground">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
