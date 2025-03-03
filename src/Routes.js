import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeView from "./views/HomeView";
import SignInView from "./views/SignInView";
import SignUpView from "./views/SignUpView";
import ChatView from "./views/ChatView";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/signin" element={<SignInView />} />
      <Route path="/signup" element={<SignUpView />} />
      <Route path="/chat" element={<ChatView />} />
    </Routes>
  );
};

export default AppRoutes;
