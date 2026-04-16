// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, Ruler, Globe } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { resolvedTheme, setTheme } = useTheme();
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const [isMounted, setIsMounted] = useState(false);

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
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.settings}</h1>
          <p className="text-sm font-bold text-foreground/50">{t.settingsSubtitle}</p>
        </div>
      </header>

      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black">{t.appearance}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{t.darkMode}</Label>
            <Switch
              checked={isMounted ? isDarkMode : false}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label={t.darkMode}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
