import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return <Redirect href={user ? "/(tabs)" : "/auth/splash-screen"} />;
};

export default Index;
