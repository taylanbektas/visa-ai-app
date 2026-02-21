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
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdvisorPanel from "./pages/AdvisorPanel";
import AdvisorProfile from "./pages/AdvisorProfile";
import Login from "./pages/Login";
import JoinAdvisor from "./pages/JoinAdvisor";
import Contact from "./pages/Contact";
import StaffLogin from "./pages/StaffLogin";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
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
              <Route
                path="/pricing"
                element={
                  <PublicLayout>
                    <Pricing />
                  </PublicLayout>
                }
              />
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

              {/* Dashboard Layout (Usually has its own nav or uses public one? Assuming public for now based on user request "navbar ile iç içe durumda" implying admin shouldn't have it, but dashboard might) */}
              {/* User didn't explicitly say remove from Dashboard, but usually Dashboards have their own. For now, I'll keep Dashboard in PublicLayout as it was sharing it, but Admin/Advisor will have their own. */}
              {/* Actually, user said "admin panel navbar ile iç içe durumda bunu düzelt". So Admin/Advisor should NOT have it. Dashboard? Let's keep it in Public for now or give it a simple wrapper. The user complaint was specific to Admin Panel nesting. */}


              {/* Protected Dashboard Route */}
              <Route element={<RoleRoute allowedRoles={["user"]} />}>
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
              </Route>

              {/* Admin Routes - Strict Access */}
              <Route element={<RoleRoute allowedRoles={["admin"]} redirectTo="/dashboard" />}>
                <Route path="/admin" element={<Admin />} />
              </Route>

              {/* Advisor Routes - Strict Access */}
              <Route element={<RoleRoute allowedRoles={["moderator", "admin"]} redirectTo="/dashboard" />}>
                <Route path="/advisor" element={<AdvisorPanel />} />
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
            <MobileBottomNav />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
