import React from "react";
import Svg, { G, Path } from "react-native-svg";

interface HomeIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const HomeIcon = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: HomeIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <Path d="M5 12H3l9-9l9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></Path>
        <Path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></Path>
      </G>
    </Svg>
  );
};
