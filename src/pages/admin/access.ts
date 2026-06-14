import type { Database } from "@/integrations/supabase/types";

export type AdminRole = Database["public"]["Enums"]["app_role"];
export type FullAdminRole = Exclude<AdminRole, "blog_editor">;

const fullAdminRoles: FullAdminRole[] = ["super_admin", "director", "ceo", "vicepresident"];

export const canAccessFullAdmin = (role: string | null): role is FullAdminRole =>
  !!role && fullAdminRoles.includes(role as FullAdminRole);

export const canAccessBlog = (role: string | null) => canAccessFullAdmin(role) || role === "blog_editor";

export const getAdminHomeRoute = (role: string | null) => (role === "blog_editor" ? "/admin/blog" : "/admin/dashboard");