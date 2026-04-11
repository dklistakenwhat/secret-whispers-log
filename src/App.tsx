import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AgeGate from "@/components/AgeGate";
import { VisitorProvider, useVisitor } from "@/contexts/VisitorContext";
import NamePrompt from "@/components/NamePrompt";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AdminReports from "./pages/AdminReports.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const { visitor, loading } = useVisitor();

  if (loading) return null;
  if (!visitor) return <NamePrompt />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AgeGate>
        <VisitorProvider>
          <AppContent />
        </VisitorProvider>
      </AgeGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
