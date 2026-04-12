import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VisitorProvider } from "@/contexts/VisitorContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import OnboardingFlow from "@/components/OnboardingFlow";
import Home from "./pages/Home.tsx";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminReports from "./pages/AdminReports.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <OnboardingFlow>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/confessions" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </OnboardingFlow>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <VisitorProvider>
          <AppContent />
        </VisitorProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
