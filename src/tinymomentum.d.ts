declare module "@tinymomentum/liquid-glass-react" {
  import React, { ReactNode, CSSProperties } from "react";

  export type LiquidGlassBaseProps = {
    elementType?: "div" | "button" | "a" | "span" | "p";
    href?: string;
    target?: "_self" | "_blank" | "_parent" | "_top";
    rel?: string;
    download?: string | boolean;
    width?: number;
    height?: number;
    borderRadius?: number;
    innerShadowColor?: string;
    innerShadowBlur?: number;
    innerShadowSpread?: number;
    glassTintColor?: string;
    glassTintOpacity?: number;
    frostBlurRadius?: number;
    noiseFrequency?: number;
    noiseStrength?: number;
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
    disabled?: boolean;
  } & React.HTMLAttributes<HTMLElement>;

  export const LiquidGlassBase: React.ForwardRefExoticComponent<
    LiquidGlassBaseProps & React.RefAttributes<HTMLElement>
  >;

  export type LiquidGlassContainerProps = Omit<LiquidGlassBaseProps, "elementType">;
  export const LiquidGlassContainer: React.ForwardRefExoticComponent<
    LiquidGlassContainerProps & React.RefAttributes<HTMLElement>
  >;

  export type LiquidGlassButtonProps = Omit<LiquidGlassBaseProps, "elementType">;
  export const LiquidGlassButton: React.ForwardRefExoticComponent<
    LiquidGlassButtonProps & React.RefAttributes<HTMLElement>
  >;

  export type LiquidGlassLinkProps = Omit<LiquidGlassBaseProps, "elementType">;
  export const LiquidGlassLink: React.ForwardRefExoticComponent<
    LiquidGlassLinkProps & React.RefAttributes<HTMLElement>
  >;
}
