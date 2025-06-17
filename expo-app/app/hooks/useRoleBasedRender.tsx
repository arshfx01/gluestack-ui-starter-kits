import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { router } from "expo-router";

type Role = "student" | "teacher";

export const useRoleBasedRender = () => {
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/splash-screen");
      return;
    }

    if (userProfile) {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  const renderBasedOnRole = () => {
    if (isLoading) {
      return null; // or a loading component
    }

    if (!userProfile) {
      return null;
    }

    switch (userProfile.role) {
      case "student":
        return "StudentDashboard";
      case "teacher":
        return "TeacherDashboard";
      default:
        return null;
    }
  };

  return {
    isLoading,
    userRole: userProfile?.role as Role | undefined,
    renderBasedOnRole,
  };
};
