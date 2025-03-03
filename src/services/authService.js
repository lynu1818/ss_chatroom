// src/services/AuthService.js
import { auth, database, provider } from "./firebaseConfig";
import { ref, set, get } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, provider);
    console.log("user signed in with Google", userCredential);
    const userRef = ref(database, "users/" + userCredential.user.uid);

    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      console.log("User already exists in database.");
      return snapshot.val();
    } else {
      const userProfileData = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || "Unnamed User",
        email: userCredential.user.email,
        avatar:
          userCredential.user.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/chatroom-6f533.appspot.com/o/avatars%2Fdefault.jpg?alt=media&token=ed673ad4-61ee-41a4-8877-e2d00bb9195f",
      };

      await set(userRef, userProfileData);
      console.log("New user profile created:", userProfileData);
      return userProfileData;
    }
  } catch (error) {
    console.log("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    console.log("user signed out");
  } catch (error) {
    console.log("error sign out", error);
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await set(ref(database, "users/" + userCredential.user.uid), {
      id: userCredential.user.uid,
      name: email,
      email: email,
      avatar:
        "https://firebasestorage.googleapis.com/v0/b/chatroom-6f533.appspot.com/o/avatars%2Fdefault.jpg?alt=media&token=ed673ad4-61ee-41a4-8877-e2d00bb9195f",
    });
    console.log("user signed up", userCredential);
    return userCredential;
  } catch (error) {
    console.log("error sign up", error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("user signed in", userCredential);
    return userCredential;
  } catch (error) {
    console.log("error sign in", error);
    throw error;
  }
};
