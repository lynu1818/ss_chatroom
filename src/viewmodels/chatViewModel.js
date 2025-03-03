import { useState, useEffect, useMemo, useCallback } from "react";
import * as chatService from "../services/chatService";
import { useAuth } from "../AuthContext";
import { ref, onValue } from "firebase/database";
import { database } from "../services/firebaseConfig";
import * as notificationService from "../services/notificationService";
import Swal from "sweetalert2";

export const useChatViewModel = () => {
  const { currentUser } = useAuth();
  const [activeKey, setActiveKey] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const [profileToShow, setProfileToShow] = useState({
    userData: null,
    visible: false,
    editable: false,
    isFriend: false,
  });
  const [showProfile, setShowProfile] = useState(false);

  const [userProfile, setUserProfile] = useState(currentUser);
  const [tempUserProfile, setTempUserProfile] = useState(userProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [messageIsLoading, setMessageIsLoading] = useState(true);

  const handleShowProfile = async (userId) => {
    const isCurrentUser = userId === currentUser.id;
    const userData = await chatService.fetchUserProfile(userId);
    setProfileToShow({
      userData: userData,
      visible: true,
      editable: isCurrentUser,
      isFriend: friends.some((friend) => friend.id === userId),
    });
  };

  const handleCloseProfile = () => {
    setProfileToShow({
      userData: null,
      visible: false,
      editable: false,
      isFriend: false,
    });
  };

  const nonFriends = useMemo(() => {
    console.log("Non friends recalculated");
    return allUsers.filter(
      (user) => !friends.some((friend) => friend.id === user.id)
    );
  }, [allUsers, friends]);

  const initializeData = async () => {
    try {
      const usersData = await chatService.fetchAllUsers(currentUser.id);
      const friendsData = await chatService.fetchFriends(currentUser.id);
      const userProfileData = await chatService.fetchUserProfile(
        currentUser.id
      );
      console.log("User profile data:", userProfileData);
      setUserProfile(userProfileData);
      setTempUserProfile(userProfileData);
      setAllUsers(usersData);
      setFriends(friendsData);
      setIsLoading(false);
      // if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
      // }
      // console.log("requestPermission called from chat view model");
      // console.log(
      //   "Initial data loaded from chat view model, tempuserprofile",
      //   tempUserProfile
      // );
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setError("Failed to load data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      initializeData(currentUser.id);

      const usersRef = ref(database, "users");
      const unsubscribeUsers = onValue(usersRef, async () => {
        const updatedUsers = await chatService.fetchAllUsers(currentUser.id);
        setAllUsers(updatedUsers);
        console.log("All users updated from chat view model");
      });

      const friendsRef = ref(database, `friends/${currentUser.id}`);
      const unsubscribeFriends = onValue(friendsRef, async () => {
        const updatedFriends = await chatService.fetchFriends(currentUser.id);
        setFriends(updatedFriends);
        console.log("Friends updated from chat view model", updatedFriends);
      });
      return () => {
        unsubscribeFriends();
        unsubscribeUsers();
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (chatId) {
      setMessageIsLoading(true);
      const messagesRef = ref(database, `messages/${chatId}`);
      const unsubscribe = onValue(messagesRef, async () => {
        try {
          const updatedMessages = await chatService.fetchMessages(chatId);
          setMessages(updatedMessages);
          console.log("Messages loaded from chat view model");
        } catch (error) {
          console.error("Failed to fetch messages:", error);
        } finally {
          setMessageIsLoading(false);
        }
      });

      return () => {
        unsubscribe();
      };
    } else {
      setMessages([]);
      setMessageIsLoading(false);
    }
  }, [chatId]);

  const handleSelectFriend = useCallback(
    async (friend) => {
      try {
        const chatId = await chatService.createChat(currentUser.id, friend.id);
        setChatId(chatId);
        setSelectedFriend(friend);
      } catch (error) {
        setError(error.message);
      }
    },
    [currentUser, chatService]
  );

  const handleRemoveFriend = useCallback(
    async (friendId) => {
      try {
        console.log("remove friend id", friendId);
        console.log(
          "selected friend id",
          selectedFriend ? selectedFriend.id : "none"
        );
        if (selectedFriend && selectedFriend.id === friendId) {
          setChatId(null);
          setSelectedFriend(null);
        }
        await chatService.removeFriend(currentUser.id, friendId);
      } catch (error) {
        setError(error.message);
      }
    },
    [currentUser, selectedFriend, chatService]
  );

  const handleAddFriend = useCallback(
    async (friendId) => {
      try {
        await chatService.addFriend(currentUser.id, friendId);
      } catch (error) {
        setError(error.message);
      }
    },
    [currentUser, chatService]
  );

  const handleMessageSend = useCallback(async () => {
    setError("");
    try {
      if (message && chatId && selectedFriend) {
        await chatService.sendMessage(chatId, currentUser.id, message);
        setMessage("");
        console.log("Message sent from chat view model");
      }
    } catch (error) {
      setError(error.message);
    }
  }, [message, chatId, currentUser, chatService]);

  const handleMessageUnsend = useCallback(
    async (messageId) => {
      try {
        await chatService.unsendMessage(chatId, messageId);
        console.log("Message has been unsent.");
      } catch (error) {
        console.error("Failed to unsend message:", error);
      }
    },
    [chatId]
  );

  const handleUpdateUserProfile = useCallback(async () => {
    await chatService.updateUserProfile(
      currentUser.id,
      tempUserProfile,
      userProfile
    );
    const updatedProfile = await chatService.fetchUserProfile(currentUser.id);
    setUserProfile(updatedProfile);
    handleCloseProfile();

    if (updatedProfile) {
      Swal.fire({
        title: "Success!",
        text: "Your profile has been updated.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#6096ba",
      });
    } else {
      Swal.fire({
        title: "No Changes",
        text: "No changes to update.",
        icon: "info",
        confirmButtonText: "OK",
        confirmButtonColor: "#6096ba",
      });
    }
  }, [tempUserProfile]);

  const handleChangeUserProfile = useCallback((e) => {
    console.log(
      "handleChangeUserProfile",
      e.target.name,
      e.target.value,
      e.target.files
    );
    const { name, value, files } = e.target;
    setTempUserProfile((prev) => {
      const newProfile = { ...prev };

      if (name === "avatar") {
        const file = files[0];
        if (file) {
          newProfile.avatar = file;
        } else {
          newProfile.avatar = null;
        }
      } else {
        newProfile[name] = value;
      }

      return newProfile;
    });
  }, []);

  return {
    chatId,
    friends,
    nonFriends,
    selectedFriend,
    messages,
    message,
    activeKey,
    profileToShow,
    tempUserProfile,
    isLoading,
    userProfile,
    messageIsLoading,
    setProfileToShow,
    setUserProfile,
    setTempUserProfile,
    setShowProfile,
    setActiveKey,
    setMessage,
    handleSelectFriend,
    handleRemoveFriend,
    handleAddFriend,
    handleMessageSend,
    handleUpdateUserProfile,
    handleChangeUserProfile,
    handleMessageUnsend,
    handleShowProfile,
    handleCloseProfile,
    error,
  };
};
