import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Departments from "./pages/Departments";
import JoinUs from "./pages/JoinUs";
import Apply from "./pages/Apply";
import Contact from "./pages/Contact";
import Contribute from "./pages/Contribute";
import Partners from "./pages/Partners";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminRecruitment from "./pages/admin/AdminRecruitment";
import AdminRecruitmentNew from "./pages/admin/AdminRecruitmentNew";
import AdminRecruitmentBuilder from "./pages/admin/AdminRecruitmentBuilder";
import AdminRecruitmentPreview from "./pages/admin/AdminRecruitmentPreview";
import AdminRecruitmentApplicants from "./pages/admin/AdminRecruitmentApplicants";
import AdminRecruitmentApplicantDetail from "./pages/admin/AdminRecruitmentApplicantDetail";
import AdminAmbassadorApplicants from "./pages/admin/AdminAmbassadorApplicants";
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
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/aplica/:slug" element={<Apply />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/:id" element={<AdminBlogEditor />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="recruitment" element={<AdminRecruitment />} />
            <Route path="recruitment/new" element={<AdminRecruitmentNew />} />
            <Route path="recruitment/:id/builder" element={<AdminRecruitmentBuilder />} />
            <Route path="recruitment/:id/preview" element={<AdminRecruitmentPreview />} />
            <Route path="recruitment/:id/applicants" element={<AdminRecruitmentApplicants />} />
            <Route path="recruitment/:id/applicants/:applicationId" element={<AdminRecruitmentApplicantDetail />} />
            <Route path="ambassador-applicants" element={<AdminAmbassadorApplicants />} />
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
