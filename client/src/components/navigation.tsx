import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Bell, Home, Plus, TrendingUp, Book, Settings, Moon, Sun } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/daily-log", icon: Plus, label: "Log" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/syllabus", icon: Book, label: "Syllabus" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} href={path} className={`flex flex-col items-center justify-center space-y-1 ${
              isActive(path) 
                ? "text-primary border-t-2 border-primary" 
                : "text-gray-500 dark:text-gray-400"
            }`} data-testid={`nav-mobile-${label.toLowerCase()}`}>
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary">JEE Pulse</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Smart Study Tracker</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} href={path} className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium ${
              isActive(path)
                ? "bg-primary/10 text-primary"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`} data-testid={`nav-desktop-${label.toLowerCase()}`}>
              <Icon className="h-5 w-5" />
              <span>{label === "Home" ? "Dashboard" : label === "Log" ? "Daily Log" : label === "Progress" ? "Analytics" : label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Header */}
      <header className="lg:ml-64 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {location === "/" ? "Dashboard" :
               location === "/daily-log" ? "Daily Log" :
               location === "/progress" ? "Analytics" :
               location === "/syllabus" ? "Syllabus" :
               location === "/settings" ? "Settings" : "JEE Pulse"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Let's make today productive</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" data-testid="notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Action Button */}
      <Link href="/daily-log">
        <Button
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full shadow-lg z-40 animate-pulse-slow"
          data-testid="fab-daily-log"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </>
  );
}
