import { database, storage } from "./firebaseConfig";
import {
  ref,
  set,
  remove,
  get,
  update,
  push,
  serverTimestamp,
} from "firebase/database";
import {
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import User from "../models/user";
import Message from "../models/message";
import { updateProfile } from "firebase/auth";
import { auth } from "./firebaseConfig";

const metadata = {
  contentType: "image/jpeg",
};

export const uploadAvatar = (userId, file) => {
  console.log("Uploading avatar for user:", userId, file);
  if (!file) {
    return Promise.reject("No file selected");
  }
  return new Promise((resolve, reject) => {
    const avatarRef = sRef(storage, `avatars/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(avatarRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);
          resolve(downloadURL);
        });
      }
    );
  });
};
const dbRef = (path) => ref(database, path);

export const createChat = async (userId, friendId) => {
  const chatId =
    userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;

  const chatRef = ref(database, `messages/${chatId}`);
  const snapshot = await get(chatRef);

  if (!snapshot.exists()) {
    await set(chatRef, {});
  }

  return chatId;
};

export const addFriend = async (userId, friendId) => {
  const updates = {};
  updates["/friends/" + userId + "/" + friendId] = true;
  updates["/friends/" + friendId + "/" + userId] = true;
  update(ref(database), updates);
  console.log(`Friend added: ${userId} <-> ${friendId} from chat service`);
};

export const removeFriend = async (userId, friendId) => {
  remove(ref(database, `friends/${userId}/${friendId}`));
  remove(ref(database, `friends/${friendId}/${userId}`));
  const chatId =
    userId < friendId ? `${userId}_${friendId}` : `${friendId}_${userId}`;
  remove(ref(database, `chats/${chatId}`));
  remove(ref(database, `messages/${chatId}`));
  console.log(`Friend removed: ${userId} <-> ${friendId} from chat service`);
};

export const fetchAllUsers = async (userId) => {
  console.log("Fetching all users from chat service");
  const snapshot = await get(ref(database, "users"));
  const usersData = snapshot.val() || [];
  return Object.keys(usersData)
    .filter((key) => key !== userId)
    .map(
      (key) =>
        new User(
          key,
          usersData[key].name,
          usersData[key].email,
          usersData[key].avatar
        )
    );
};

export const fetchFriends = async (userId) => {
  console.log("Fetching friends from chat service");
  const snapshot = await get(ref(database, `friends/${userId}`));
  const friendsIds = snapshot.val() || {};

  const friendsDetails = [];

  for (const friendId of Object.keys(friendsIds)) {
    const friendSnapshot = await get(ref(database, `users/${friendId}`));
    const friendData = friendSnapshot.val();
    if (friendData) {
      friendsDetails.push(
        new User(
          friendId,
          friendData.name,
          friendData.email,
          friendData.avatar,
          friendData.birthday,
          friendData.statusMessage
        )
      );
    }
  }
  return friendsDetails;
};

export const fetchMessages = async (chatId) => {
  console.log(`Fetching messages from chat service for chatId: ${chatId}`);
  const snapshot = await get(dbRef(`messages/${chatId}`));
  if (snapshot.exists()) {
    const messages = snapshot.val();
    return Object.keys(messages).map(
      (key) =>
        new Message(
          key,
          messages[key].from,
          messages[key].content,
          messages[key].sentTime,
          messages[key].isUnsent
        )
    );
  } else {
    return [];
  }
};

export const sendMessage = async (chatId, fromUserId, message) => {
  console.log(`Message sent to ${chatId}: ${message} from chat service`);
  const userRef = ref(database, `users/${fromUserId}`);
  const userData = await get(userRef).then((snapshot) => snapshot.val());

  const messageId = push(ref(database, `messages/${chatId}`)).key;
  const messageData = {
    from: fromUserId,
    senderName: userData.name,
    senderAvatar: userData.avatar || "default_avatar.png",
    content: message,
    sentTime: serverTimestamp(),
    isUnsent: false,
  };
  const updates = {};
  updates[`messages/${chatId}/` + messageId] = messageData;
  updates[`chats/${chatId}/lastMessage`] = {
    id: messageId,
    ...messageData,
  };

  await update(ref(database), updates);
  return messageId;
};

export const unsendMessage = async (chatId, messageId) => {
  const messageRef = ref(database, `messages/${chatId}/${messageId}`);
  const updates = {
    isUnsent: true,
    content: "This message has been unsent.",
  };

  await update(messageRef, updates);
};

export const updateUserProfile = async (
  userId,
  updatedProfile,
  originalProfile
) => {
  console.log("Attempting to update user profile", { userId, updatedProfile });
  const userRef = ref(database, `users/${userId}`);

  const updates = {};
  if (updatedProfile.name) {
    console.log("Updating name to:", updatedProfile.name);
    updates.name = updatedProfile.name;
    await updateProfile(auth.currentUser, { displayName: updatedProfile.name });
  }
  if (updatedProfile.email) {
    updates.email = updatedProfile.email;
  }
  if (updatedProfile.birthday) {
    console.log("Updating birthday to:", updatedProfile.birthday);
    updates.birthday = updatedProfile.birthday;
  }
  if (updatedProfile.statusMessage) {
    console.log("Updating status message to:", updatedProfile.statusMessage);
    updates.statusMessage = updatedProfile.statusMessage;
  }

  if (
    updatedProfile.avatar &&
    updatedProfile.avatar !== originalProfile.avatar
  ) {
    try {
      console.log("Uploading new avatar:", updatedProfile.avatar);
      const downloadURL = await uploadAvatar(userId, updatedProfile.avatar);
      updates.avatar = downloadURL;
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  } else {
    console.log("No new avatar to upload");
  }

  if (Object.keys(updates).length > 0) {
    await update(userRef, updates);
    console.log("Profile updated with:", updates);
  } else {
    console.log("No updates to perform");
  }
};

export const fetchUserProfile = async (userId) => {
  console.log("Fetching user profile from chat service");
  const snapshot = await get(ref(database, `users/${userId}`));
  if (snapshot.exists()) {
    const user = snapshot.val();
    return new User(
      userId,
      user.name,
      user.email,
      user.avatar,
      user.birthday,
      user.statusMessage
    );
  } else {
    return null;
  }
};
