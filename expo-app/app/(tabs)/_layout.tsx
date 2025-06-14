import { View, Text } from "react-native";
import React from "react";

type Layout = {
  children: React.ReactNode;
};

export const Layout = ({ children }: Layout) => {
  return <>{children}</>;
};
