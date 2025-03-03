import { useState } from "react";
import * as notificationService from "../services/notificationService";

export const useNotificationViewModel = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const handleRequestPermission = () => {
    notificationService.requestPermission();
    setNotificationEnabled(Notification.permission === "granted");
  };

  return {
    notificationEnabled,
    handleRequestPermission,
  };
};
