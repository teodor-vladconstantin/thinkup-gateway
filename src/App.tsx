import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Departments from "./pages/Departments";
import JoinUs from "./pages/JoinUs";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/:id" element={<AdminBlogEditor />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
