export const requestPermission = () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
};

export const sendNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
  console.log("Notification sent");
};
