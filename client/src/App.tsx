import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import DailyLog from "@/pages/daily-log";
import Progress from "@/pages/progress";
import Syllabus from "@/pages/syllabus";
import Settings from "@/pages/settings";
import Navigation from "@/components/navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/daily-log" component={DailyLog} />
      <Route path="/progress" component={Progress} />
      <Route path="/syllabus" component={Syllabus} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            <Navigation />
            <main className="lg:ml-64 pb-20 lg:pb-6">
              <Router />
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
