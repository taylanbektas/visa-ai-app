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
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import VisaChecker from "./pages/VisaChecker";
import Apply from "./pages/Apply";
import Track from "./pages/Track";
import Learn from "./pages/Learn";
import ArticlePage from "./pages/ArticlePage";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdvisorPanel from "./pages/AdvisorPanel";
import Login from "./pages/Login";
import Contact from "./pages/Contact";

import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ScrollToTop />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy-dark focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg"
            >
              Ana içeriğe geç
            </a>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/visa-checker" element={<VisaChecker />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/track" element={<Track />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:id" element={<ArticlePage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/advisor" element={<AdvisorPanel />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <MobileBottomNav />
            {/* <AIChatBot /> */}
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
