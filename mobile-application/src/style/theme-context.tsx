// Theme context

import React from "react";
import LightTheme from "./light";
import { ColorTheme } from "./theme-interfaces";
import * as NavigationBar from "expo-navigation-bar";

/**
 * Sets navigation bar theme style
 * @param theme The theme
 */
function setNavigationBarTheme(theme: ColorTheme) {
    NavigationBar.setBackgroundColorAsync(theme.navigationBarBackground).catch(err => {
        console.error(err);
    });
    NavigationBar.setButtonStyleAsync(theme.navigationBarButtonStyle).catch(err => {
        console.error(err);
    });
}

// Our context provider will provide this object shape
interface ProvidedValue {
    theme: ColorTheme;
    setTheme: (t: ColorTheme) => void;
}

// Creating our context
// Important: the defined object here is only received by the
// consumer components when there is no rendered context provider
// in the view hierarchy, so basically it will provide
// a fallback object
const Context = React.createContext<ProvidedValue>({
    theme: LightTheme,
    setTheme: () => {
        console.log("ThemeProvider is not rendered!");
    },
});

// Because our stateful context provider will be a React component
// we can define some props for it too
interface Props {
    initial: ColorTheme;
    children?: React.ReactNode;
}

// Creating our stateful context provider
// We are using React.memo for optimization
export const ThemeProvider = React.memo<Props>(props => {
    // Store the actual theme as an internal state of the provider
    const [theme, setTheme] = React.useState<ColorTheme>(props.initial);
    // Implement a method for toggling the Theme
    // We're using the React.useCallback hook for optimization
    const ToggleThemeCallback = React.useCallback((theme: ColorTheme) => {
        setTheme(theme);
        setNavigationBarTheme(theme);
    }, []);
    // Building up the provided object
    // We're using the React.useMemo hook for optimization
    const MemoizedValue = React.useMemo(() => {
        const value: ProvidedValue = {
            theme,
            setTheme: ToggleThemeCallback,
        };
        return value;
    }, [theme, ToggleThemeCallback]);
    setNavigationBarTheme(theme);
    // Render our context provider by passing it the value to provide
    return <Context.Provider value={MemoizedValue}>{props.children}</Context.Provider>;
});

// Creating a custom context consumer hook for function components
export const useTheme = () => React.useContext(Context);
