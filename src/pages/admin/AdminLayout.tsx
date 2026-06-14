import { useEffect, useState, createContext, useContext } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Building2, FileText, Handshake, Inbox, MessageSquare, Settings, LogOut, Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { canAccessBlog, canAccessFullAdmin, getAdminHomeRoute } from "./access";

type AdminCtx = { user: User; role: string | null; profile: any };
const AdminContext = createContext<AdminCtx | null>(null);
export const useAdmin = () => useContext(AdminContext)!;

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, access: "full_admin" },
  { label: "Members", to: "/admin/members", icon: Users, access: "full_admin" },
  { label: "Departments", to: "/admin/departments", icon: Building2, access: "full_admin" },
  { label: "Blog", to: "/admin/blog", icon: FileText, access: "blog" },
  { label: "Partners", to: "/admin/partners", icon: Handshake, access: "full_admin" },
  { label: "Applications", to: "/admin/applications", icon: Inbox, access: "full_admin" },
  { label: "Messages", to: "/admin/messages", icon: MessageSquare, access: "full_admin" },
  { label: "Settings", to: "/admin/settings", icon: Settings, access: "super_admin" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          navigate("/admin/login");
          return;
        }

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (rolesError) throw rolesError;

        const userRole = roles?.[0]?.role ?? null;
        
        // If not a full admin or blog editor, kick out
        if (!userRole || (!canAccessFullAdmin(userRole) && userRole !== "blog_editor")) {
          await supabase.auth.signOut();
          navigate("/admin/login");
          return;
        }

        setUser(session.user);
        setRole(userRole);

        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
          
        setProfile(prof);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setRole(null);
        setProfile(null);
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (loading || !role) return;

    if (role === "blog_editor") {
      const isBlogRoute = /^\/admin\/blog(\/|$)/.test(location.pathname);
      if (!isBlogRoute) {
        navigate("/admin/blog", { replace: true });
      }
      return;
    }

    if (location.pathname === "/admin") {
      navigate(getHomeRoute(role), { replace: true });
    }
  }, [loading, location.pathname, navigate, role]);

  const logout = async () => { await supabase.auth.signOut(); navigate("/admin/login"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!user) return null;

  return (
    <AdminContext.Provider value={{ user, role, profile }}>
      {/* Enforce light theme variables for the admin section */}
      <div 
        className="min-h-screen flex bg-gray-50 text-gray-900" 
        style={{
          // @ts-ignore
          "--background": "0 0% 100%",
          "--foreground": "240 10% 3.9%",
          "--card": "0 0% 100%",
          "--card-foreground": "240 10% 3.9%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "240 10% 3.9%",
          "--primary": "263 91% 76%",
          "--primary-foreground": "0 0% 100%",
          "--secondary": "240 4.8% 95.9%",
          "--secondary-foreground": "240 5.9% 10%",
          "--muted": "240 4.8% 95.9%",
          "--muted-foreground": "240 3.8% 46.1%",
          "--accent": "240 4.8% 95.9%",
          "--accent-foreground": "240 5.9% 10%",
          "--destructive": "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 98%",
          "--border": "240 5.9% 90%",
          "--input": "240 5.9% 90%",
          "--ring": "240 5.9% 10%",
        } as React.CSSProperties}
      >
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[hsl(240,33%,14%)] text-white transform transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>ThinkUp Admin</span>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              if (item.access === "super_admin" && role !== "super_admin") return null;
              if (item.access === "full_admin" && !canAccessFullAdmin(role)) return null;
              if (item.access === "blog" && !canAccessBlog(role)) return null;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-2">{profile?.full_name || user.email}</div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 bg-white border-b flex items-center px-4 gap-4">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5 text-gray-700" /></button>
            <span className="text-sm text-gray-500 capitalize">{role?.replace("_", " ")}</span>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
