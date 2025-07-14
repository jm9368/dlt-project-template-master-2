// Global events manager

type CallbackFunctionVariadic = (...args: any[]) => void;

/**
 * Mapping of App events
 */
export type AppEventsMap = {
    /**
     * Event sent when AuthController changes its status
     */
    "auth-status-changed": () => void;

    /**
     * Event sent when AuthController changes its loading status
     * @param loading True if the auth status is being loaded
     */
    "auth-status-loading": (loading: boolean) => void;

    /**
     * Event sent when preferences are loaded
     */
    "preferences-loaded": () => void;

    /**
     * Event sent when an Unauthorized (401) status code is received
     * This may indicate the session has expired
     */
    unauthorized: () => void;

    /**
     * Event sent when a locale is selected
     * @param locale The locale identifier
     */
    "set-locale": (locale: string) => void;

    /**
     * Event sent when a locale is loaded
     * @param locale The locale identifier
     */
    "loaded-locale": (locale: string) => void;

    /**
     * Event sent when the wallets list changes
     * You can obtain it via WalletsController
     */
    "wallet-list-changed": () => void;

    /**
     * Event sent when the selected wallet changes
     * @param id The wallet ID
     * @param address The wallet address
     * @param name The wallet name
     */
    "current-wallet-changed": (id: string, address: string, name: string) => void;

    /**
     * Event sent when the theme changes
     * @param theme The theme name
     */
    "theme-changed": (theme: string) => void;
};

/**
 * Global events manager
 */
export class AppEvents {
    public static events: { [key: string]: CallbackFunctionVariadic[] } = {};

    /**
     * Listens for global event
     * @param eventName The event name
     * @param handler The event handler
     */
    public static AddEventListener<K extends keyof AppEventsMap>(eventName: K, handler: AppEventsMap[K]) {
        if (!AppEvents.events[eventName]) {
            AppEvents.events[eventName] = [];
        }
        AppEvents.events[eventName].push(handler);
    }

    /**
     * Emits global event
     * @param eventName The event name
     * @param args The event arguments
     */
    public static Emit<K extends keyof AppEventsMap>(eventName: K, ...args: Parameters<AppEventsMap[K]>) {
        if (AppEvents.events[eventName]) {
            for (const handler of AppEvents.events[eventName]) {
                try {
                    handler(...args);
                } catch (ex) {
                    console.error(ex);
                }
            }
        }
    }

    /**
     * Removes event listener
     * @param eventName The event name
     * @param handler The event handler
     */
    public static RemoveEventListener<K extends keyof AppEventsMap>(eventName: K, handler: AppEventsMap[K]) {
        if (!AppEvents.events[eventName]) {
            return;
        }
        const i = AppEvents.events[eventName].indexOf(handler);
        if (i >= 0) {
            AppEvents.events[eventName].splice(i, 1);
            if (AppEvents.events[eventName].length === 0) {
                delete AppEvents.events[eventName];
            }
        }
    }
}
