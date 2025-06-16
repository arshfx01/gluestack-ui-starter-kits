import React from "react";

import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { Text as RNText } from "react-native";
import { textStyle } from "./styles";

type ITextProps = React.ComponentProps<typeof RNText> &
  VariantProps<typeof textStyle> & {
    fontWeight?: "medium" | "semibold" | "bold";
  };

const Text = React.forwardRef<React.ElementRef<typeof RNText>, ITextProps>(
  (
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = "md",
      sub,
      italic,
      highlight,
      fontWeight = "semibold", // <- Default to medium
      children,
      ...props
    },
    ref
  ) => {
    // Mapping fontWeight to fontFamily
    const fontFamilyMap = {
      medium: "InterMedium",
      semibold: "InterSemiBold",
      bold: "InterBold",
    } as const;

    return (
      <RNText
        style={{ fontFamily: fontFamilyMap[fontWeight] }}
        className={textStyle({
          isTruncated,
          bold,
          underline,
          strikeThrough,
          size,
          sub,
          italic,
          highlight,
          class: className,
        })}
        ref={ref}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = "Text";

export { Text };
