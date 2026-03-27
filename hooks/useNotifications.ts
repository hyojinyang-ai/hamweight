// hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { NOTIFICATION_MESSAGES } from "@/lib/constants";

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

  const sendTestNotification = useCallback(() => {
    if (permission === "granted") {
      const message =
        NOTIFICATION_MESSAGES[
          Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)
        ];
      new Notification("HamWeight", {
        body: message,
        icon: "/hamster-icon.png",
      });
    }
  }, [permission]);

  return {
    permission,
    isEnabled: notificationSettings.enabled,
    time: notificationSettings.time,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    setTime: (time: string) => updateNotificationSettings({ time }),
  };
}
