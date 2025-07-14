// Navigation callbacks manager

import { NavigationProp } from "@react-navigation/native";

/**
 * Navigation callbacks manager
 */
export class NavigationCallbacks {
    /**
     * Callback for the current confirmation
     */
    public static ConfirmationCallback: () => void = null;

    /**
     * Asks user confirmation, with a modal
     * @param navigation The navigation context
     * @param title The title
     * @param msg The message
     * @param callback The callback, called if confirmed
     */
    public static AskConfirmation(navigation: NavigationProp<any>, title: string, msg: string, callback: () => void) {
        NavigationCallbacks.ConfirmationCallback = callback;
        navigation.navigate("ConfirmationModal", {
            title,
            msg,
        });
    }

    /**
     * Show error message to the user, in a modal
     * @param navigation The navigation context
     * @param title The Error title
     * @param msg The error message
     */
    public static ShowErrorMessage(navigation: NavigationProp<any>, title: string, msg: string) {
        navigation.navigate("MessageModal", {
            kind: "error",
            title,
            msg,
        });
    }

    /**
     * Show success message to the user, in a modal
     * @param navigation The navigation context
     * @param title The message title
     * @param msg The message
     * @param nextScreen The name of the screen to continue. Set to undefined to go back to the same screen
     */
    public static ShowSuccessMessage(navigation: NavigationProp<any>, title: string, msg: string, nextScreen?: string) {
        navigation.navigate("MessageModal", {
            kind: "success",
            title,
            msg,
            back: nextScreen,
        });
    }

    /**
     * Function to call if a web view succeeds
     */
    public static WebViewSuccessCallback: (url: string) => void = null;

    /**
     * URL to check if the web view succeeded
     */
    public static WebViewSuccessURL: string | RegExp | ((url: string) => boolean) = "";

    /**
     * Opens a modal with a web view for the user to interact with an external service
     * Example: Stripe, PayPal, Binance
     * @param navigation The navigation context
     * @param url The initial URL
     * @param title The title for the modal
     * @param successURL The expected success URL (if the web view reaches this URL, the modal will auto close)
     * @param callback Function to call if the web view reaches the success URL
     */
    public static OpenWebView(
        navigation: NavigationProp<any>,
        url: string,
        title: string,
        successURL: string | RegExp | ((url: string) => boolean),
        callback: (url: string) => void,
    ) {
        NavigationCallbacks.WebViewSuccessURL = successURL;
        NavigationCallbacks.WebViewSuccessCallback = callback;
        navigation.navigate("WebViewModal", {
            title,
            src: url,
        });
    }

    /**
     * Callback for selecting an option
     */
    public static OptionSelectCallback: (opt: string) => void = null;

    /**
     * Prompts the user to choose an option
     * @param navigation The navigation context
     * @param title The modal title
     * @param options The list of available options
     * @param current The current selected option
     * @param callback The callback
     */
    public static ChooseAnOption(
        navigation: NavigationProp<any>,
        title: string,
        options: SelectableOption[],
        current: string,
        callback: (opt: string) => void,
    ) {
        NavigationCallbacks.OptionSelectCallback = callback;
        navigation.navigate("OptionSelectModal", {
            title,
            current,
            selectOptions: options,
        });
    }
}

/**
 * Selectable option
 */
export interface SelectableOption {
    /**
     * Option id
     */
    id: string;

    /**
     * Name to display
     */
    name: string;
}
