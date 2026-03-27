// app/settings/page.tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Ruler, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { useNotifications } from "@/hooks/useNotifications";
import { cmToFtIn, ftInToCm } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const entries = useStore((s) => s.entries);
  const streak = useStore((s) => s.streak);

  const {
    permission,
    isEnabled,
    time,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    setTime,
  } = useNotifications();

  const unit = profile?.unit ?? "metric";
  const height = profile?.height ?? 170;
  const { feet, inches } = cmToFtIn(height);

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    if (profile) {
      setProfile({ ...profile, unit: newUnit });
    }
  };

  const handleHeightChange = (value: number) => {
    if (profile) {
      setProfile({ ...profile, height: value });
    }
  };

  const handleExportJSON = () => {
    const data = {
      profile,
      entries,
      streak,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hamweight-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Time", "Weight (kg)", "Weight (lb)", "Time of Day", "Exercise Context", "Waist", "Hips", "Chest", "Arms", "Thighs"];
    const rows = entries.map((entry) => {
      const date = new Date(entry.timestamp);
      const weightLb = (entry.weight * 2.20462).toFixed(1);
      const m = entry.measurements;
      return [
        date.toISOString().slice(0, 10),
        date.toLocaleTimeString(),
        entry.weight.toFixed(1),
        weightLb,
        entry.timeOfDay ?? "",
        entry.exerciseContext ?? "",
        m?.waist ?? "",
        m?.hips ?? "",
        m?.chest ?? "",
        m?.arms ?? "",
        m?.thighs ?? "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hamweight-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
        <Hamster expression="happy" size="sm" />
      </header>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4" />
            Units & Height
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Measurement System</Label>
            <Select value={unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Height</Label>
            {unit === "metric" ? (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={feet}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(parseInt(e.target.value), inches))
                  }
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">ft</span>
                <Input
                  type="number"
                  value={inches}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(feet, parseInt(e.target.value)))
                  }
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Reminder</Label>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) =>
                checked ? enableNotifications() : disableNotifications()
              }
              disabled={permission === "denied"}
            />
          </div>

          {permission === "denied" && (
            <p className="text-xs text-muted-foreground">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}

          {isEnabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-28"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                className="w-full"
              >
                Send Test Notification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {entries.length} entries · {streak} day streak
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
