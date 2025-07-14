# Mobile application

This repository contains the mobile application project.

Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/) in order to use the same codebase for both Android and IOS.

## Requirements

-   [NodeJS](https://nodejs.org/en) - Latest stable version.
-   [Android studio](https://developer.android.com/studio) or an android phone, to test in Android.
-   An IOS phone, to test on IOS.

## Installation

To install the project dependencies:

```sh
npm install
```

Also, in your devices, or emulators, you will need to install the [Expo](https://expo.dev/) application, in order to test the application.

For android emulator, check this guide in order to set it up:

-   https://docs.expo.dev/workflow/android-studio-emulator/

## Configuration

Copy the file `app-example.json` into `app.json` and modify any parameters you consider.

| Section | Parameter name               | Description                                                                           |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| `extra` | `platform_name`              | Name of the platform.                                                                 |
| `extra` | `api_url`                    | API URL. By default use a demo URL: `http://10.0.2.2/api/v1`                          |
| `extra` | `frontend_base_url`          | Base URL of the frontend, to check for redirects. By default: `https://10.0.2.2:8080` |
| `extra` | `reCaptchaKey`               | Google reCaptcha key, to use the service, if enabled. Leave it blank by default.      |
| `extra` | `always_show_initial_screen` | True to always show the initial screen when starting the app. Disable in production.  |
| `extra` | `emulator_localhost_ip`      | Localhost IP address to access it from the emulator. By default `10.0.2.2`.           |

## Creating EAS account

In order to build the app, you will need to install the `eas` CLI utility:

```sh
npm install -g eas-cli
```

Also, you will need an Expo account: https://expo.dev/signup

First, login into your account with the CLI tool:

```sh
eas login
```

Second, configure the project:

```sh
eas build:configure
```

## Running

In order to test the application, run the following command:

```sh
npm start
```

Follow the instruction provided in the console output to run the application in your emulator or device.

## Building

Note: When building with Expo EAS, you will need to set up the definitive application configuration into [app.config.js](./app.config.js).

### Android

In order to build an APK for Android, in order to test it, run the following command:

```sh
eas build --platform android --profile preview
```

When ready, you can then build the AAB (Android App bundle) to publish the application to the Google Play Store:

```sh
eas build --platform android --profile production
```

### iOS

In order to build the APP for iOS, run the following command:

```sh
eas build --platform ios --profile production
```

You will need a paid developer Apple account.

Once your app is built, you can publish it to the App store and either:

 - Test it with TestFlight
 - Submit it for approval

## Development guide

This is a [React Native](https://reactnative.dev/docs/getting-started) and [Expo](https://docs.expo.dev/) project, so first check the documentation for both.

### Project structure

The [App.tsx](./App.tsx) file is the main component, loaded first. This component load the application.

The rest of the source code is located in the [src](./src/) folder. This folder has the following sub-folders:

-   [api](./src/api/) - Containing the API bindings. Same for the web frontend. These bindings define the interaction protocol with the server.
-   [components](./src/components/) - Containing all the React Native components.
-   [control](./src/control/) - Containing global controllers that manage the status of the application.
-   [hooks](./src/hooks/) - Reusable [React custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).
-   [locales](./src/locales/) - Containing language files for internationalization.
-   [style](./src/style/) - Containing all React Native stylesheets for components, and also theme management logic.
-   [utils](./src/utils/) - Containing utility functions and classes.

In order to add static assets, like images or fonts, place them in the [assets](./assets/) folder.

### Routing

The main router is located at [src/components/router.tsx](./src/components/router.tsx), every time you need to add an screen to the navigation, you must add it to that file.

Screen components will get the `navigation` context object from the component properties:

-   You can use `navigation.navigate("ScreenName")` to navigate to another screen.
-   Tou can use `navigation.goBack()` to navigate to the previous screen, useful for modals.

Check the [NavigationCallbacks](./src/control/navigation-callbacks.ts) control class for some standard navigation control flows, like showing a message modal, or asking for confirmation.

For more information, check the [official documentation](https://reactnavigation.org/docs/stack-navigator/).

### Theme and style

For every component you want to design, create a stylesheet and place it in a subfolder in the [src/style](./src/style/) folder.

Example of stylesheet:

```ts
import { StyleSheet } from "react-native";
import ThemeConstants from "../theme-consts";

const TouchableLinkStyles = (theme: ColorTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: "transparent",
        },
        text: {
            fontFamily: ThemeConstants.fonts.main,
            color: theme.links,
        },
        small: {
            fontSize: 11,
        },
        underline: {
            textDecorationLine: "underline",
        },
    });
};

export default TouchableLinkStyles;
```

Each stylesheet is a function taking the `ColorTheme` as a parameter and returning a `StyleSheet`, from React native.

The stylesheets are very similar to css, with some restrictions, and explicit set, instead of query selectors. Check more in the [official documentation](https://reactnative.dev/docs/style).

To import a stylesheet, you must use the `useThemedStyle` hook function, example:

```tsx
import { TouchableOpacity, Text } from "react-native";
import { useThemedStyle } from "../../style/themed-style";
import TouchableLinkStyles from "../../style/utils/touchable-link";

const TouchableLink = ({
    children,
    onPress,
    small,
    underline,
    size,
}: {
    children: string;
    onPress?: () => void;
    small?: boolean;
    underline?: boolean;
    size?: number;
}) => {
    const Styles = useThemedStyle(TouchableLinkStyles);

    const textStyles = [Styles.text, small && Styles.small, underline && Styles.underline, size && { fontSize: size }];

    return (
        <TouchableOpacity onPress={onPress} style={Styles.container}>
            <Text style={textStyles}>{children}</Text>
        </TouchableOpacity>
    );
};

export default TouchableLink;
```

You can then specify a single style, or an array of styles to each sub-component.

If you want to add or change a style content to use in your stylesheets, check the [ThemeConstants](./src/style/theme-consts.tsx) class.

Also, in order to add a property to the `ColorStyle` interface, check it in [src/style/theme-interfaces.tsx](./src/style/theme-interfaces.tsx).

When you add new properties, you must set its value for each theme:

-   [Dark theme definition](./src/style/dark.tsx)
-   [Light theme definition](./src/style/light.tsx)

### Making requests to the server

In order to make requests to the server, we use the [Request](./src/utils/request.ts) utility class, and the [API bindings](./src/api/).

You can see examples on any of the [authentication screens](./src/components/screens/auth/).

### Internationalization

You can use multi-language text inside components using the `t` method injected fro the [useTranslation](./src/hooks/translation.tsx) hook.

```tsx
<Text>{t("Example")}</Text>
```

It is usually recommended to write the text in english, and let the translation tool to translate to the appropriate language using the translation files.

The translation files are located inside [src/locales](./src/locales/). They are JSON files named like `locale-{LANG}.json`. The contain an object with the keys mapped to the corresponding translation.

This project has a script to scan the codebase and automatically update the translation files, leaving an empty string for the new found keys. Run it with:

```sh
npm run update-translations
```

Then go to the `.missing.txt` files and translate the missing keys.

After you translate the keys, update the `STATUS=PENDING` to `STATUS=READY` for the `.missing.txt` files that are fully translated. Then, run the following script to apply those missing translations and update the `.json` files with them:

```sh
npm run apply-missing-translations
```

**Important:** Do not update the translations while working with the missing translations files, since it may break the order. The best practice is translating all the added keys for a task as the last commit before making the pull request.

If you want to translate something to en empty string, use a single space instead: `" "`. Also remember that the translations are trimmed, so do not use spaces at the edges of the keys or values.

In case you want to add a new language, follow these steps:

-   Create a file in [src/locales](./src/locales/) named `locale-LANG.json`, being `LANG` the locale code, eg: `en`, `es`, etc.
-   Put inside the file an empty object: `{}` and save it.
-   Edit [src/control/i18n.ts](./src/control/i18n.ts). Search for `AVAILABLE_LANGUAGES` and add the entry to the array.
-   Run the command `npm run update-translations`
-   Translate all the keys in the `.missing.txt` file.
-   Set `STATUS=READY` in the `.missing.txt` file.
-   Run `npm run apply-missing-translations`
