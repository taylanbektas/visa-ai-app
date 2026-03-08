import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatBot } from "@/components/AIChatBot";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleRoute } from "./components/RoleRoute"; // Fixed import
import Index from "./pages/Index";
// import VisaChecker from "./pages/VisaChecker";
import Apply from "./pages/Apply";
import Track from "./pages/Track";
import Learn from "./pages/Learn";
import ArticlePage from "./pages/ArticlePage";
// Pricing removed from public routes — now inside Dashboard
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminCustomerDetail from "./pages/AdminCustomerDetail";
import AdminAdvisorDetail from "./pages/AdminAdvisorDetail.tsx";
import AdvisorPanel from "./pages/AdvisorPanel";
import ApplicationDetail from "./pages/ApplicationDetail";
import AdvisorProfile from "./pages/AdvisorProfile";
import Login from "./pages/Login";
import JoinAdvisor from "./pages/JoinAdvisor";
import Contact from "./pages/Contact";
import StaffLogin from "./pages/StaffLogin";
import AgencyLogin from "./pages/AgencyLogin";
import AgencyPanel from "./pages/AgencyPanel";
import AgencyApplicationDetail from "./pages/AgencyApplicationDetail";

import Success from "./pages/Success";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Refund from "./pages/Refund";
import VideoGuides from "./pages/VideoGuides";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function SkipToContentLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy-dark focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main id="main-content">{children}</main>
    <Footer />
    <AIChatBot />
  </>
);

const AppContents = () => {
  const location = useLocation();
  const hideMobileNavPaths = ['/admin', '/advisor', '/agency'];
  const shouldHideMobileNav = hideMobileNavPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      <ScrollToTop />
      <SkipToContentLink />
      <Routes>
        {/* Public Routes with Navbar & Footer */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Index />
            </PublicLayout>
          }
        />
        <Route
          path="/apply"
          element={
            <PublicLayout>
              <Apply />
            </PublicLayout>
          }
        />
        <Route
          path="/track"
          element={
            <PublicLayout>
              <Track />
            </PublicLayout>
          }
        />
        <Route
          path="/learn"
          element={
            <PublicLayout>
              <Learn />
            </PublicLayout>
          }
        />
        <Route
          path="/learn/:id"
          element={
            <PublicLayout>
              <ArticlePage />
            </PublicLayout>
          }
        />
        {/* Pricing moved to Dashboard panel */}
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />
        <Route
          path="/staff-login"
          element={
            <StaffLogin />
          }
        />
        <Route
          path="/agency-login"
          element={
            <AgencyLogin />
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />
        <Route
          path="/join-advisor"
          element={
            <PublicLayout>
              <JoinAdvisor />
            </PublicLayout>
          }
        />
        <Route
          path="/success/:referenceId"
          element={
            <PublicLayout>
              <Success />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <Privacy />
            </PublicLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          }
        />
        <Route
          path="/cookies"
          element={
            <PublicLayout>
              <Cookies />
            </PublicLayout>
          }
        />
        <Route
          path="/refund"
          element={
            <PublicLayout>
              <Refund />
            </PublicLayout>
          }
        />
        <Route
          path="/video-guides"
          element={
            <PublicLayout>
              <VideoGuides />
            </PublicLayout>
          }
        />

        {/* Protected Dashboard Route - block agency from customer area */}
        <Route element={<RoleRoute allowedRoles={["user"]} blockedRoles={["agency"]} showInvalidCredentials />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Route>

        {/* Agency Routes - Strict Access */}
        <Route element={<RoleRoute allowedRoles={["agency"]} redirectTo="/agency-login" showInvalidCredentials />}>
          <Route
            path="/agency"
            element={
              <PublicLayout>
                <AgencyPanel />
              </PublicLayout>
            }
          />
          <Route
            path="/agency/application/:appId"
            element={
              <PublicLayout>
                <AgencyApplicationDetail />
              </PublicLayout>
            }
          />
        </Route>

        {/* Admin Routes - Strict Access */}
        <Route element={<RoleRoute allowedRoles={["admin"]} redirectTo="/dashboard" showInvalidCredentials />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/customer/:id" element={<AdminCustomerDetail />} />
          <Route path="/admin/advisor/:id" element={<AdminAdvisorDetail />} />
        </Route>

        {/* Advisor Routes - Strict Access */}
        <Route element={<RoleRoute allowedRoles={["moderator", "admin"]} redirectTo="/dashboard" showInvalidCredentials />}>
          <Route path="/advisor" element={<AdvisorPanel />} />
          <Route path="/advisor/customer/:id" element={<ApplicationDetail />} />
          <Route
            path="/advisor-profile/:id"
            element={
              <PublicLayout>
                <AdvisorProfile />
              </PublicLayout>
            }
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFound />
            </PublicLayout>
          }
        />
      </Routes>
      {!shouldHideMobileNav && <MobileBottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <AppContents />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
