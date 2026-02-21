import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Building2, Handshake, Inbox, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Members", icon: Users, key: "members" },
    { label: "Published Posts", icon: FileText, key: "posts" },
    { label: "Departments", icon: Building2, key: "departments" },
    { label: "Partners", icon: Handshake, key: "partners" },
    { label: "Applications", icon: Inbox, key: "applications" },
    { label: "Messages", icon: MessageSquare, key: "messages" },
  ];

  const { data: counts } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [members, posts, departments, partners, applications, messages] = await Promise.all([
        supabase.from("members").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
        supabase.from("departments").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);
      return { members: members.count ?? 0, posts: posts.count ?? 0, departments: departments.count ?? 0, partners: partners.count ?? 0, applications: applications.count ?? 0, messages: messages.count ?? 0 };
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
         <p className="text-gray-500 mt-1">Overview of your organization's activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <s.icon className="h-6 w-6" />
               </div>
               {/* Could add a 'View' link here later */}
            </div>
            
             <div>
               <p className="text-sm font-medium text-gray-500">{s.label}</p>
               <p className="text-4xl font-bold text-gray-900 mt-2">{counts?.[s.key as keyof typeof counts] ?? "—"}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
