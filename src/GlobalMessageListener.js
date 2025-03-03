// src/context/GlobalMessageListener.js
import React, { useRef, useEffect, useState } from "react";
import { database } from "./services/firebaseConfig";
import { ref, onValue, onChildAdded } from "firebase/database";
import * as NotificationService from "./services/notificationService";
import { useAuth } from "./AuthContext";

const GlobalMessageListener = ({ children }) => {
  const { currentUser } = useAuth();
  const lastMessageTimestampsRef = useRef({});
  const firstLoadRef = useRef(true);
  const unsubscribeHandlersRef = useRef({});

  useEffect(() => {
    if (currentUser) {
      const chatsRef = ref(database, "chats");

      const unsubscribe = onValue(chatsRef, (snapshot) => {
        const chats = snapshot.val();
        Object.keys(chats).forEach((chatId) => {
          const chatParticipants = chatId.split("_");
          if (chatParticipants.includes(currentUser.id)) {
            setupChatListener(chatId);
          }
        });

        if (firstLoadRef.current) {
          Object.keys(chats).forEach((chatId) => {
            lastMessageTimestampsRef.current[chatId] = Date.now();
          });
          firstLoadRef.current = false;
        }
      });

      return () => {
        unsubscribe();
        Object.values(unsubscribeHandlersRef.current).forEach((unsub) =>
          unsub()
        );
      };
    }
  }, [currentUser, database]);

  const setupChatListener = (chatId) => {
    if (unsubscribeHandlersRef.current[chatId]) {
      unsubscribeHandlersRef.current[chatId]();
    }
    const chatRef = ref(database, `chats/${chatId}/lastMessage`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const lastMessage = snapshot.val();
      const lastTimestamp = lastMessageTimestampsRef.current[chatId];

      if (
        lastMessage &&
        lastMessage.from !== currentUser.id &&
        (!lastTimestamp || lastMessage.sentTime > lastTimestamp)
      ) {
        if (!firstLoadRef.current) {
          NotificationService.sendNotification(
            "New Message from " + lastMessage.senderName,
            {
              body: lastMessage.content,
              icon: lastMessage.senderAvatar || "default_icon.png",
            }
          );
          lastMessageTimestampsRef.current[chatId] = lastMessage.sentTime;
        }
      }
    });

    unsubscribeHandlersRef.current[chatId] = unsubscribe;
  };

  return <>{children}</>;
};

export default GlobalMessageListener;
