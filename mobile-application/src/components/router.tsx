// Main router

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants from "expo-constants";

// Import views

import InitialScreen from "./screens/auth/InitialScreen";
import LanguageSelectModal from "./screens/modals/LanguageSelectModal";
import ThemeSelectModal from "./screens/modals/ThemeSelectModal";
import AuthLoadingScreen from "./screens/auth/AuthLoadingScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import TFALoginScreen from "./screens/auth/TFALoginScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import MessageModal from "./screens/modals/MessageModal";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import HomeScreen from "./screens/home/HomeScreen";
import WebViewModal from "./screens/modals/WebViewModal";
import UserSettingsModal from "./screens/modals/account/UserSettingsModal";
import MainMenuModal from "./screens/modals/MainMenuModal";
import ConfirmationModal from "./screens/modals/ConfirmationModal";
import ThirdPartySignUpScreen from "./screens/auth/ThirdPartySignUpScreen";
import AboutScreen from "./screens/home/AboutScreen";
import ProfileScreen from "./screens/profile/ProfileScreen";
import AccountSettingsMenu from "./screens/account/AccountSettingsMenu";
import EditProfileScreen from "./screens/account/EditProfileScreen";
import ChangeUsernameScreen from "./screens/account/ChangeUsernameScreen";
import SelectLanguageScreen from "./screens/account/SelectLanguageScreen";
import ChangeEmailScreen from "./screens/account/ChangeEmailScreen";
import ChangePasswordScreen from "./screens/account/ChangePasswordScreen";
import TwoFactorAuthenticationScreen from "./screens/account/TwoFactorAuthenticationScreen";
import ActiveSessionsScreen from "./screens/account/ActiveSessionsScreen";
import WalletsListScreen from "./screens/account/WalletsListScreen";
import CreateWalletScreen from "./screens/account/CreateWalletScreen";
import DeleteAccountScreen from "./screens/account/DeleteAccountScreen";
import OptionSelectModal from "./screens/modals/OptionSelectModal";
import WalletSettingsMenu from "./screens/wallet/WalletSettingsMenu";
import WalletDetailsScreen from "./screens/wallet/WalletDetailsScreen";
import WalletDeleteScreen from "./screens/wallet/WalletDeleteScreen";
import WalletExportKeyScreen from "./screens/wallet/WalletExportKeyScreen";
import WalletChangePasswordScreen from "./screens/wallet/WalletChangePasswordScreen";
import WalletChangeNameScreen from "./screens/wallet/WalletChangeNameScreen";
import WalletSelectModal from "./screens/modals/wallet/WalletSelectModal";

const Stack = createNativeStackNavigator();

// Router component

const wrapReCaptcha = child => {
    if (Constants.expoConfig.extra.reCaptchaKey) {
        return <GoogleReCaptchaProvider reCaptchaKey={Constants.expoConfig.extra.reCaptchaKey}>{child}</GoogleReCaptchaProvider>;
    } else {
        return child;
    }
};

export default function AppRouter() {
    return wrapReCaptcha(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="AuthLoadingScreen" screenOptions={{ headerShown: false, animation: "fade" }}>
                <Stack.Group>
                    <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} />

                    <Stack.Screen name="InitialScreen" component={InitialScreen} />

                    <Stack.Screen name="LoginScreen" component={LoginScreen as any} />
                    <Stack.Screen name="TFALoginScreen" component={TFALoginScreen as any} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen as any} />
                    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen as any} />
                    <Stack.Screen name="ThirdPartySignUpScreen" component={ThirdPartySignUpScreen as any} />

                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="AboutScreen" component={AboutScreen} />

                    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

                    <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
                    <Stack.Screen name="ChangeUsernameScreen" component={ChangeUsernameScreen} />
                    <Stack.Screen name="SelectLanguageScreen" component={SelectLanguageScreen} />
                    <Stack.Screen name="ChangeEmailScreen" component={ChangeEmailScreen} />
                    <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
                    <Stack.Screen name="TwoFactorAuthenticationScreen" component={TwoFactorAuthenticationScreen} />
                    <Stack.Screen name="ActiveSessionsScreen" component={ActiveSessionsScreen} />
                    <Stack.Screen name="WalletsListScreen" component={WalletsListScreen} />
                    <Stack.Screen name="CreateWalletScreen" component={CreateWalletScreen} />
                    <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />

                    <Stack.Screen name="WalletDetailsScreen" component={WalletDetailsScreen} />
                    <Stack.Screen name="WalletChangeNameScreen" component={WalletChangeNameScreen} />
                    <Stack.Screen name="WalletChangePasswordScreen" component={WalletChangePasswordScreen} />
                    <Stack.Screen name="WalletExportKeyScreen" component={WalletExportKeyScreen} />
                    <Stack.Screen name="WalletDeleteScreen" component={WalletDeleteScreen} />
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: "transparentModal" }}>
                    <Stack.Screen name="UserSettingsModal" component={UserSettingsModal} />
                    <Stack.Screen name="MainMenuModal" component={MainMenuModal} />

                    <Stack.Screen name="LanguageSelectModal" component={LanguageSelectModal} />
                    <Stack.Screen name="ThemeSelectModal" component={ThemeSelectModal} />

                    <Stack.Screen name="OptionSelectModal" component={OptionSelectModal} />

                    <Stack.Screen name="WebViewModal" component={WebViewModal} />
                    <Stack.Screen name="ConfirmationModal" component={ConfirmationModal} />
                    <Stack.Screen name="MessageModal" component={MessageModal} />

                    <Stack.Screen name="AccountSettingsMenu" component={AccountSettingsMenu} />

                    <Stack.Screen name="WalletSettingsMenu" component={WalletSettingsMenu} />

                    <Stack.Screen name="WalletSelectModal" component={WalletSelectModal} />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>,
    );
}
