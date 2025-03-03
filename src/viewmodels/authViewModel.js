// src/viewmodels/authViewModel.js
import { useState } from "react";
import * as authService from "../services/authService";
import { useNavigate } from "react-router-dom";

export const useAuthViewModel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignInWithGoogle = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await authService.signInWithGoogle();
      window.location.href = "/chat";
    } catch (error) {
      console.log("set error", error.message);
      setError(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await authService.signUp(email, password);
      window.location.href = "/chat";
    } catch (error) {
      console.log("set error", error.message);
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await authService.signIn(email, password);
      navigate("/chat");
    } catch (error) {
      console.log("set error", error.message);
      setError(error.message);
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await authService.signOut();
      window.location.href = "/";
    } catch (error) {
      console.log("set error", error.message);
      setError(error.message);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleSignInWithGoogle,
    error,
  };
};
