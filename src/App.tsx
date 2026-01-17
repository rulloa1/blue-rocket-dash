import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Leads from "./pages/Leads";
import Outreach from "./pages/Outreach";
import Pipeline from "./pages/Pipeline";
import Proposals from "./pages/Proposals";
import Settings from "./pages/Settings";
import PublicWebsite from "./pages/PublicWebsite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/site/:publicId" element={<PublicWebsite />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
