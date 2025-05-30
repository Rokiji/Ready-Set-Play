
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MusicPlayer from "./components/MusicPlayer";
import Index from "./pages/Index";
import GamesPage from "./pages/GamesPage";
import GamePage from "./pages/GamePage";
import MusicPage from "./pages/MusicPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="pb-32"> {/* Increased padding to match the space at the top of music player */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/game/:gameId" element={<GamePage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MusicPlayer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
