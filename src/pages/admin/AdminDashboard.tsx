import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Briefcase, Target, UserCheck, PenTool, Users } from "lucide-react";

const roleStats = [
  { label: "Super Admin", icon: Crown, key: "super_admin", color: "text-red-500" },
  { label: "Director", icon: Briefcase, key: "director", color: "text-blue-500" },
  { label: "CEO", icon: Target, key: "ceo", color: "text-purple-500" },
  { label: "Vice President", icon: UserCheck, key: "vicepresident", color: "text-green-500" },
  { label: "Blog Editor", icon: PenTool, key: "blog_editor", color: "text-orange-500" },
  { label: "Mentor", icon: Users, key: "mentor", color: "text-teal-500" },
];

export default function AdminDashboard() {
  const { data: roleCounts, isLoading } = useQuery({
    queryKey: ["admin-role-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role");
      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const stat of roleStats) {
        counts[stat.key] = 0;
      }
      for (const row of data ?? []) {
        if (counts[row.role] !== undefined) {
          counts[row.role]++;
        }
      }
      return counts;
    },
  });

  const totalUsers = roleCounts ? Object.values(roleCounts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of admin users by role.</p>
        {totalUsers > 0 && (
          <p className="text-sm text-muted-foreground mt-1">Total admin users: {totalUsers}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleStats.map((s) => (
          <div key={s.key} className="card-base p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-primary/10 rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className="text-4xl font-bold text-foreground mt-2">
                {isLoading ? "—" : roleCounts?.[s.key] ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
