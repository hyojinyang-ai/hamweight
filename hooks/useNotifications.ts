// hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { NOTIFICATION_MESSAGES } from "@/lib/constants";

const LAST_NOTIFICATION_DATE_KEY = "hamweight-last-notification-date";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const notificationSettings = useStore((s) => s.notificationSettings);
  const updateNotificationSettings = useStore((s) => s.updateNotificationSettings);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "denied";
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const enableNotifications = useCallback(async () => {
    const result = await requestPermission();
    if (result === "granted") {
      updateNotificationSettings({ enabled: true });
      return true;
    }
    return false;
  }, [requestPermission, updateNotificationSettings]);

  const disableNotifications = useCallback(() => {
    updateNotificationSettings({ enabled: false });
  }, [updateNotificationSettings]);

  const showNotification = useCallback((body: string) => {
    if (permission !== "granted" || !("Notification" in window)) {
      return false;
    }

    new Notification("MyWeight", {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "myweight-reminder",
    });

    return true;
  }, [permission]);

  const sendTestNotification = useCallback(() => {
    const message =
      NOTIFICATION_MESSAGES[
        Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)
      ];
    return showNotification(message);
  }, [showNotification]);

  useEffect(() => {
    if (
      permission !== "granted" ||
      !notificationSettings.enabled ||
      typeof window === "undefined"
    ) {
      return;
    }

    const [hours, minutes] = notificationSettings.time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }

    const now = new Date();
    const nextTrigger = new Date();
    nextTrigger.setHours(hours, minutes, 0, 0);

    if (nextTrigger <= now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1);
    }

    const timeoutMs = nextTrigger.getTime() - now.getTime();

    const timer = window.setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      const lastSent = window.localStorage.getItem(LAST_NOTIFICATION_DATE_KEY);

      if (lastSent !== today) {
        const message =
          NOTIFICATION_MESSAGES[
            Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)
          ];

        if (showNotification(message)) {
          window.localStorage.setItem(LAST_NOTIFICATION_DATE_KEY, today);
        }
      }
    }, timeoutMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notificationSettings.enabled, notificationSettings.time, permission, showNotification]);

  const setTime = useCallback((time: string) => {
    updateNotificationSettings({ time });
  }, [updateNotificationSettings]);

  return {
    permission,
    isEnabled: notificationSettings.enabled,
    time: notificationSettings.time,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    setTime,
  };
}
