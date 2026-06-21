import type { Database } from "@/integrations/supabase/types";

export type AdminRole = Database["public"]["Enums"]["app_role"];
export type FullAdminRole = Exclude<AdminRole, "blog_editor" | "director" | "mentor">;

const fullAdminRoles: FullAdminRole[] = ["super_admin", "ceo", "vicepresident"];
const managementRoles: ("director" | "mentor")[] = ["director", "mentor"];

export const canAccessFullAdmin = (role: string | null): role is FullAdminRole =>
  !!role && (fullAdminRoles.includes(role as FullAdminRole) || managementRoles.includes(role as any));

export const canAccessBlog = (role: string | null) => canAccessFullAdmin(role) || role === "blog_editor";

export const canAccessSettings = (role: string | null) => role === "super_admin";

export const getAdminHomeRoute = (role: string | null) => (role === "blog_editor" ? "/admin/blog" : "/admin/dashboard");