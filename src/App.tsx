import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import Index from "./pages/Index";
import NetworkPage from "./pages/NetworkPage";
import AnomalyDetectionPage from "./pages/AnomalyDetectionPage";
import ThreatIntelPage from "./pages/ThreatIntelPage";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import AlertsPage from "./pages/AlertsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <div className="flex h-screen w-full overflow-hidden scanline">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto cyber-scrollbar">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/anomaly-detection" element={<AnomalyDetectionPage />} />
                <Route path="/threat-intel" element={<ThreatIntelPage />} />
                <Route path="/ai-analysis" element={<AIAnalysisPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
