"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getTranslations } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; icon: LucideIcon; labelKey: "home" | "history" | "goals" | "settings" }[] = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/history", icon: History, labelKey: "history" },
  { href: "/goals", icon: Target, labelKey: "goals" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const profile = useStore((s) => s.profile);
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
      <div className="mx-auto max-w-md px-4 pb-3 pt-2">
        <div className="flex min-h-[4.5rem] items-center justify-around rounded-full bg-background px-3 py-2 [box-shadow:var(--neo-shadow)]">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-all",
                isActive
                  ? "bg-primary px-5 py-2 text-primary-foreground [box-shadow:var(--neo-shadow-sm)]"
                  : "text-foreground/45 hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{t[labelKey]}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
