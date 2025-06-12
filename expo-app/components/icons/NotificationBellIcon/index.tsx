import React from "react";
import Svg, { G, Path, Circle } from "react-native-svg";

interface NotificationBellIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const NotificationBellIcon = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: NotificationBellIconProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <G fill="none">
        <Path
          fill="currentColor"
          d="M6 10v9h12v-9a6 6 0 0 0-12 0"
          opacity={0.16}
        ></Path>
        <Path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 19v-9a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v9M6 19h12M6 19H4m14 0h2m-9 3h2"
        ></Path>
        <Circle
          cx={12}
          cy={3}
          r={1}
          stroke="currentColor"
          strokeWidth={2}
        ></Circle>
      </G>
    </Svg>
  );
};
