// Themed style

import React from "react";
import { useTheme } from "./theme-context";
import { ColorTheme } from "./theme-interfaces";
import { ScaledSize, useWindowDimensions } from "react-native";
import { useActualHeight } from "./actual-height";

// Create a type alias for our generator function
// Notice that it's matching the form of the 'createStyles'
// function which we've used previously
type Generator<T extends object> = (theme: ColorTheme, windowDimensions?: ScaledSize, actualHeight?: number) => T;
// Creating our custom hook
const useThemedStyle = <T extends object>(fn: Generator<T>) => {
    const dimensions = useWindowDimensions();
    const actualHeight = useActualHeight();
    // Consume the provided value of our theme context
    const { theme } = useTheme();
    // Generate the object based on the current theme
    // We're using the React.useMemo hook for optimization,
    // the object will be re-generated if the theme changes
    // or the generator function reference changes
    const ThemeAwareObject = React.useMemo(() => fn(theme, dimensions, actualHeight), [fn, theme, dimensions, actualHeight]);
    return ThemeAwareObject;
};

export { useThemedStyle };
