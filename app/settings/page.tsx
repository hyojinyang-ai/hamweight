// app/settings/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Ruler, Globe, Database, Download, Upload, Check, AlertCircle } from "lucide-react";
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
  const entries = useStore((s) => s.entries);
  const streak = useStore((s) => s.streak);
  const setProfile = useStore((s) => s.setProfile);
  const getExportData = useStore((s) => s.getExportData);
  const importData = useStore((s) => s.importData);
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const data = getExportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myweight-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", t.exportSuccess);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importData(json);
      showToast(success ? "success" : "error", success ? t.importSuccess : t.importError);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

      {/* Your Data */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-black">
            <Database className="h-4 w-4" />
            {t.yourData}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-foreground/60">{entries.length} {t.entries}</span>
            <span className="font-bold text-foreground/60">{streak} {t.dayStreak}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              {t.exportJSON}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {t.importJSON}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className={`flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold [border:var(--neo-border)] ${
            toast.type === "success"
              ? "bg-foreground text-background"
              : "bg-destructive text-destructive-foreground"
          }`}>
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
