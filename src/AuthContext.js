import { auth } from "./services/firebaseConfig";
import { createContext, useContext, useEffect, useState } from "react";
import * as chatService from "./services/chatService";
import User from "./models/user";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed, user:", user);
      if (!user) return;

      const currentUserData = new User(
        user.uid,
        user.displayName || user.email,
        user.email,
        user.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/chatroom-6f533.appspot.com/o/avatars%2Fdefault.jpg?alt=media&token=ed673ad4-61ee-41a4-8877-e2d00bb9195f"
      );
      const currentUserProfile = await chatService.fetchUserProfile(
        currentUserData.id
      );

      console.log("Current user profile:", currentUserProfile);
      setCurrentUser(currentUserProfile);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
