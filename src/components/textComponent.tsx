import React, { useEffect, useRef, useState } from "react";
import { globalStyles } from "../config";
import { Tooltip, Typography } from "@mui/material";
import "@fontsource/barlow";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/700.css";

interface TextProps {
  children?: React.ReactNode;
  variant?:
  | "body"
  | "heading"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline";
  color?: "light" | "dark" | "white" | string;
  text?: any;
  className?: string;
  styles?: React.CSSProperties | any;
  detectEllipsis?: boolean;
  [key: string]: any;
}

const Text: React.FC<TextProps> = ({
  children,
  variant = "body1",
  color = "dark",
  text,
  className,
  styles: additionalStyles,
  detectEllipsis = false,
  ...props
}) => {

  const content = text || children;
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (detectEllipsis && textRef.current) {
      const el = textRef.current;
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [content, detectEllipsis]);

  const getTextColor = (color: string) => {
    switch (color) {
      case "light":
        return globalStyles.colors.lightText;
      case "white":
        return "white";
      case "dark":
        return globalStyles.colors.darkText;
      default:
        return color || globalStyles.colors.darkText;
    }
  };

  const textColor = getTextColor(color);

  const typography = (
    <Typography
      ref={detectEllipsis ? textRef : undefined}
      className={className} // Added className prop
      style={{
        fontWeight:
          variant === "heading" ? "500" : variant === "body" ? "400" : "400",
        fontFamily:
          variant === "heading"
            ? globalStyles.fonts.heading
            : variant === "body"
              ? globalStyles.fonts.body
              : `"Open Sans", sans-serif`,
        color: textColor,
        textTransform: "none",
        overflow: detectEllipsis ? "hidden" : undefined,
        textOverflow: detectEllipsis ? "ellipsis" : undefined,
        whiteSpace: detectEllipsis ? "nowrap" : undefined,
        ...additionalStyles,
      }}
      variant={
        variant === "heading" ? "h6" : variant === "body" ? "body1" : variant
      }
      {...props}
    >
      {text || children}
    </Typography>
  );
  return detectEllipsis && isTruncated ? (
    <Tooltip title={content} placement="top" sx={{ fontSize: '2vh' }}>
      {typography}
    </Tooltip>
  ) : (
    typography
  );
};

export default Text;

