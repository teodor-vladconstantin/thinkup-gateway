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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.key} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <s.icon className="h-5 w-5 text-[hsl(263,91%,76%)]" />
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{counts?.[s.key as keyof typeof counts] ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
