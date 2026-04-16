// app/settings/page.tsx
"use client";

import { Bell, Ruler, Download, Globe } from "lucide-react";
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
import { useStore } from "@/lib/store";
import { useNotifications } from "@/hooks/useNotifications";
import { cmToFtIn, ftInToCm } from "@/lib/utils";
import { getTranslations, type Locale } from "@/lib/i18n";

export default function SettingsPage() {
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
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
  const height = profile?.height ?? 170;
  const { feet, inches } = cmToFtIn(height);

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    if (profile) {
      setProfile({ ...profile, unit: newUnit });
    }
  };

  const handleLanguageChange = (newLang: string) => {
    if (profile) {
      setProfile({ ...profile, language: newLang as Locale });
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
    a.download = `mywieght-export-${new Date().toISOString().slice(0, 10)}.json`;
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
    a.download = `mywieght-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.settings}</h1>
          <p className="text-sm font-bold text-foreground/50">{t.settingsSubtitle}</p>
        </div>
      </header>

      {/* Language */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <Globe className="h-4 w-4" />
            {t.language}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{t.language}</Label>
            <Select value={lang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t.english}</SelectItem>
                <SelectItem value="ko">{t.korean}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <Ruler className="h-4 w-4" />
            {t.unitsHeight}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t.measurementSystem}</Label>
            <Select value={unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">{t.metric}</SelectItem>
                <SelectItem value="imperial">{t.imperial}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-4">
            <Label className="pt-2">{t.height}</Label>
            {unit === "metric" ? (
              <div className="flex items-center justify-end gap-2">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm font-bold text-foreground/50">cm</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <Input
                  type="number"
                  value={feet}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(parseInt(e.target.value), inches))
                  }
                  className="w-16"
                />
                <span className="text-sm font-bold text-foreground/50">ft</span>
                <Input
                  type="number"
                  value={inches}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(feet, parseInt(e.target.value)))
                  }
                  className="w-16"
                />
                <span className="text-sm font-bold text-foreground/50">in</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <Bell className="h-4 w-4" />
            {t.reminders}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t.dailyReminder}</Label>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) =>
                checked ? enableNotifications() : disableNotifications()
              }
              disabled={permission === "denied"}
            />
          </div>

          {permission === "denied" && (
            <p className="text-xs font-bold text-foreground/50">
              {t.notificationsBlocked}
            </p>
          )}

          {isEnabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>{t.reminderTime}</Label>
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
                {t.sendTestNotification}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <Download className="h-4 w-4" />
            {t.yourData}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm font-bold text-foreground/50">
            {entries.length} {t.entries} · {streak} {t.dayStreak}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              {t.exportCSV}
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              {t.exportJSON}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
