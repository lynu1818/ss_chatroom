// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqFkGOBUjhPPSv8hpW_5RQ_vJ6D-0m1p4",
  authDomain: "chatroom-6f533.firebaseapp.com",
  projectId: "chatroom-6f533",
  storageBucket: "chatroom-6f533.appspot.com",
  messagingSenderId: "257531425170",
  appId: "1:257531425170:web:1723119830bb139dcf514b",
  measurementId: "G-1D4HMT80C3",
  databaseURL: "https://chatroom-6f533-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export default app;
export { analytics, auth, database, storage, provider };
