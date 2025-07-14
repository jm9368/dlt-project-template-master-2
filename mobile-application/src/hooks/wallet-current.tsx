// Current wallet hook

"use strict";

import { useEffect, useState } from "react";
import { WalletInfo } from "../api/definitions";
import { WalletsController } from "../control/wallets";
import { AppEvents } from "../control/app-events";

/**
 * Current wallet hook result
 */
interface CurrentWalletHookResult {
    /**
     * Current wallet ID
     */
    currentWalletId: string;

    /**
     * Current wallet name
     */
    currentWalletName: string;

    /**
     * Current wallet address
     */
    currentWalletAddress: string;

    /**
     * List of account wallets
     */
    wallets: WalletInfo[];
}

/**
 * Hook to get the current wallet and the wallet list
 */
export const useCurrentWallet: () => CurrentWalletHookResult = () => {
    const [currentWalletId, setCurrentWalletId] = useState(WalletsController.CurrentWalletId);
    const [currentWalletName, setCurrentWalletName] = useState(WalletsController.CurrentWalletName);
    const [currentWalletAddress, setCurrentWalletAddress] = useState(WalletsController.CurrentWalletAddress);

    const [wallets, setWallets] = useState(WalletsController.GetWallets());

    const onCurrentWalletChanged = () => {
        setCurrentWalletId(WalletsController.CurrentWalletId);
        setCurrentWalletName(WalletsController.CurrentWalletName);
        setCurrentWalletAddress(WalletsController.CurrentWalletAddress);
    };

    const onWalletListChanged = () => {
        setWallets(WalletsController.GetWallets());
    };

    useEffect(() => {
        AppEvents.AddEventListener("current-wallet-changed", onCurrentWalletChanged);
        AppEvents.AddEventListener("wallet-list-changed", onWalletListChanged);

        return () => {
            AppEvents.RemoveEventListener("current-wallet-changed", onCurrentWalletChanged);
            AppEvents.RemoveEventListener("wallet-list-changed", onWalletListChanged);
        };
    }, []);

    return {
        currentWalletId,
        currentWalletName,
        currentWalletAddress,
        wallets,
    };
};
