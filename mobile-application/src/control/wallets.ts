// Wallets controller

import { Request } from "@asanrom/request-browser";
import { AppEvents } from "./app-events";
import { AuthController } from "./auth";
import { AppPreferences } from "./app-preferences";
import { WalletInfo } from "../api/definitions";
import { Timeouts } from "../utils/timeout";
import { ApiWallet } from "../api/api-group-wallet";

export class WalletsController {
    public static Wallets: WalletInfo[] = [];

    public static GetWallets(): WalletInfo[] {
        return WalletsController.Wallets.map(w => {
            return {
                id: w.id,
                name: w.name,
                address: w.address,
            };
        });
    }

    public static CurrentWalletId = "";
    public static CurrentWalletAddress = "";
    public static CurrentWalletName = "";

    public static Initialize() {
        WalletsController.Load();
        AppEvents.AddEventListener("auth-status-changed", WalletsController.Load);
    }

    public static Load() {
        Timeouts.Abort("wallets-controller-load-list");
        Request.Abort("wallets-controller-load-list");

        if (!AuthController.isAuthenticated()) {
            WalletsController.CurrentWalletId = "";
            WalletsController.CurrentWalletAddress = "";
            WalletsController.CurrentWalletName = "";
            AppEvents.Emit(
                "current-wallet-changed",
                WalletsController.CurrentWalletId,
                WalletsController.CurrentWalletAddress,
                WalletsController.CurrentWalletName,
            );
            return; // Not logged in
        }

        Request.Pending("wallets-controller-load-list", ApiWallet.ListWallets())
            .onSuccess((result: WalletInfo[]) => {
                WalletsController.Wallets = result.slice();

                AppEvents.Emit("wallet-list-changed");

                const prefWalletId = AppPreferences.getDefaultWallet(AuthController.UID);
                const prefWallet = result.filter(w => {
                    return w.id === prefWalletId;
                });

                if (prefWallet.length > 0) {
                    WalletsController.CurrentWalletId = prefWallet[0].id;
                    WalletsController.CurrentWalletAddress = prefWallet[0].address;
                    WalletsController.CurrentWalletName = prefWallet[0].name;
                } else if (result.length > 0) {
                    WalletsController.CurrentWalletId = result[0].id;
                    WalletsController.CurrentWalletAddress = result[0].address;
                    WalletsController.CurrentWalletName = result[0].name;
                } else {
                    WalletsController.CurrentWalletId = "";
                    WalletsController.CurrentWalletAddress = "";
                    WalletsController.CurrentWalletName = "";
                }
                AppEvents.Emit(
                    "current-wallet-changed",
                    WalletsController.CurrentWalletId,
                    WalletsController.CurrentWalletAddress,
                    WalletsController.CurrentWalletName,
                );
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    unauthorized: () => {
                        AppEvents.Emit("unauthorized");
                    },
                    temporalError: () => {
                        // Retry
                        Timeouts.Set("wallets-controller-load-list", 1500, WalletsController.Load);
                    },
                });
            })
            .onUnexpectedError(err => {
                console.error(err);
                // Retry
                Timeouts.Set("wallets-controller-load-list", 1500, WalletsController.Load);
            });
    }

    public static SetDefaultWallet(wallet: WalletInfo) {
        AppPreferences.setDefaultWallet(AuthController.UID, wallet.id);
        WalletsController.CurrentWalletId = wallet.id;
        WalletsController.CurrentWalletAddress = wallet.address;
        WalletsController.CurrentWalletName = wallet.name;
        AppEvents.Emit(
            "current-wallet-changed",
            WalletsController.CurrentWalletId,
            WalletsController.CurrentWalletAddress,
            WalletsController.CurrentWalletName,
        );
    }
}
