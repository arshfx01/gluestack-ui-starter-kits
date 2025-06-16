import { useState, useEffect, useMemo } from "react";
import { usePathname } from "expo-router";

export const useBottomBtns = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // Memoize the hidden paths pattern
  const hiddenPathsPattern = useMemo(() => {
    const hiddenPaths = [
      "/teacher/class/[id]/attendance",
      "/teacher/class/[id]",
      "/teacher/create-class",
      "/teacher/class/[id]/students",
      "/student/class/[id]/attendance",
    ];

    return hiddenPaths.map((path) => {
      const pattern = path.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`);
    });
  }, []); // Empty dependency array since patterns don't change

  useEffect(() => {
    const shouldHide = hiddenPathsPattern.some((pattern) =>
      pattern.test(pathname)
    );
    setIsVisible(!shouldHide);
  }, [pathname, hiddenPathsPattern]);

  return {
    isVisible,
    hide: () => setIsVisible(false),
    show: () => setIsVisible(true),
    toggle: () => setIsVisible((prev) => !prev),
  };
};
