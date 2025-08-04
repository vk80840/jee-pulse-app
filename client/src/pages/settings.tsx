import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { StorageManager } from "@/lib/storage";
import { 
  Moon, 
  Sun, 
  Download, 
  Trash2, 
  Bell, 
  Info, 
  Shield, 
  Mail, 
  RotateCcw,
  Calendar,
  Database
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleExportData = () => {
    try {
      const data = StorageManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jee-pulse-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ description: "Data exported successfully!" });
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to export data" });
    }
  };

  const handleResetTodayLog = () => {
    if (confirm("Are you sure you want to reset today's log? This cannot be undone.")) {
      StorageManager.resetTodayLog();
      toast({ description: "Today's log has been reset" });
    }
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear ALL data? This will permanently delete everything and cannot be undone.")) {
      if (confirm("This is your final warning. All your progress, goals, and data will be permanently lost. Continue?")) {
        StorageManager.clearAllData();
        toast({ description: "All data has been cleared" });
        window.location.reload();
      }
    }
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    // Note: In a real PWA, you would save this to localStorage and set up notifications
    toast({ description: "Reminder time updated!" });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast({ description: "Notifications enabled!" });
      } else {
        toast({ variant: "destructive", description: "Notification permission denied" });
      }
    } else {
      toast({ variant: "destructive", description: "Notifications not supported in this browser" });
    }
  };

  const userStats = StorageManager.getUserStats();
  const lifetimeData = StorageManager.getLifetimeProgress();

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your app preferences and data</p>
      </div>

      {/* App Statistics */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>App Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{lifetimeData.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Days Logged</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{userStats.totalQuestions}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{userStats.currentStreak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{userStats.totalStudyTime}h</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme-toggle">Dark Mode</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              data-testid="theme-toggle-switch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-toggle">Enable Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get reminders for daily goals and study sessions
              </p>
            </div>
            <Switch
              id="notifications-toggle"
              checked={notificationsEnabled}
              onCheckedChange={requestNotificationPermission}
              data-testid="notifications-toggle"
            />
          </div>
          
          {notificationsEnabled && (
            <>
              <Separator />
              <div>
                <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleReminderTimeChange(e.target.value)}
                  className="mt-2 w-full md:w-40"
                  data-testid="reminder-time"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleExportData} 
              className="flex-1"
              data-testid="export-data"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetTodayLog}
              className="flex-1"
              data-testid="reset-today"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Today's Log
            </Button>
          </div>
          
          <Separator />
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
              This action will permanently delete all your data and cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearAllData}
              data-testid="clear-all-data"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="neumorphic">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Version</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
            </div>
            <div>
              <Label>Last Updated</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Focused
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Offline First
            </Badge>
            <Badge variant="outline">
              PWA Ready
            </Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Info className="h-4 w-4 mr-2" />
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
