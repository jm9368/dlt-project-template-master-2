// Theme interfaces

export interface ColorTheme {
    /**
     * Theme ID
     */
    id: string;

    /**
     * Default background color
     */
    background: string;

    /**
     * Default text color
     */
    text: string;

    /**
     * Border color
     */
    border: string;

    /**
     * Color for step button
     */
    stepButtonBackground: string;

    /**
     * Color for step button (the current one)
     */
    stepButtonCurrentBackground: string;

    /**
     * Background color for the modals
     */
    modalBackground: string;

    /**
     * Text input background color
     */
    inputBackground: string;

    /**
     * Text input border color
     */
    inputBorderColor: string;

    /**
     * Placeholder text color
     */
    inputPlaceholderColor: string;

    /**
     * Link color
     */
    links: string;

    /**
     * Success color
     */
    success: string;

    /**
     * Error color
     */
    error: string;

    /**
     * Warning color
     */
    warning: string;

    /**
     * Background for the home footer
     */
    homeFooterBackground: string;

    /**
     * Color to represent the current option selected
     */
    currentTextColor: string;

    /**
     * Background color to distinguish an area from the background
     */
    areaBackground: string;

    /**
     * Background color for the home header buttons
     */
    homeHeaderButtonBackground: string;

    /**
     * Color for the ActivityIndicator
     */
    activityIndicatorColor: string;

    /**
     * Color for line charts
     * The color of the line itself
     */
    chartLineColor: string;

    /**
     * Color for line charts
     * The color for the filling area under the line
     */
    chartLineAreaFillColor: string;

    /**
     * Color for the background of a transaction item
     */
    transactionItemBackground: string;

    /**
     * Background color of the icons for transaction list items
     */
    transactionItemIconBackgroundColor: string;

    /**
     * Color of the icons for transaction list items
     */
    transactionItemIconColor: string;

    /**
     * Color for the background of a device item
     */
    deviceItemBackground: string;

    /**
     * Color for the unread notifications mark
     */
    notificationsUnreadMarkColor: string;

    /**
     * Background color for the guide messages box
     */
    guideMessageBackground: string;

    /**
     * Background color for the guide box overlay
     */
    guideOverlayBackground: string;

    /**
     * Overlay background color
     */
    overlayBackground: string;

    /**
     * Navigation bar background
     */
    navigationBarBackground: string;

    /**
     * Navigation bar button style
     */
    navigationBarButtonStyle: "light" | "dark";
}
