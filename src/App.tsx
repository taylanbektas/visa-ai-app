import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AIChatBot } from "@/components/AIChatBot";
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
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <LanguageProvider>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <AIChatBot />
        </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
