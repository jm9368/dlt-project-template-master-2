// Wallet details hook

"use strict";

import { useEffect, useState } from "react";
import { getUniqueStringId } from "../utils/unique-id";
import { Timeouts } from "../utils/timeout";
import { Request } from "@asanrom/request-browser";
import { ApiWallet } from "../api/api-group-wallet";
import { AppEvents } from "../control/app-events";
import { NavigationProp } from "@react-navigation/native";

/**
 * Wallet details hook result
 */
interface WalletDetailsHookResult {
    /**
     * True if loading the wallet details
     */
    loading: boolean;

    /**
     * Load function
     */
    load: () => void;

    /**
     * True if the wallet was not found
     */
    notFound: boolean;

    /**
     * Name of the wallet
     */
    walletName: string;

    /**
     * Address of the wallet
     */
    walletAddress: string;
}

/**
 * Hook to load wallet details
 * @param navigation The navigation context
 * @param walletId The wallet id
 */
export const useWalletDetails: (navigation: NavigationProp<any>, walletId: string) => WalletDetailsHookResult = (navigation, walletId) => {
    const [loadRequestId] = useState(getUniqueStringId());

    const [loading, setLoading] = useState(true);

    const [notFound, setNotFound] = useState(false);

    const [walletName, setWalletName] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const load = () => {
        setLoading(true);

        Timeouts.Abort(loadRequestId);

        Request.Pending(loadRequestId, ApiWallet.GetWallet(walletId))
            .onSuccess(response => {
                setLoading(false);
                setNotFound(false);
                setWalletName(response.name);
                setWalletAddress(response.address);
            })
            .onRequestError((err, handleErr) => {
                handleErr(err, {
                    unauthorized: () => {
                        AppEvents.Emit("unauthorized");
                        if (navigation.isFocused()) {
                            navigation.navigate("LoginScreen");
                        }
                    },
                    notFound: () => {
                        setLoading(false);
                        setNotFound(true);
                    },
                    temporalError: () => {
                        Timeouts.Set(loadRequestId, 1500, load);
                    },
                });
            })
            .onUnexpectedError(err => {
                console.error(err);
                Timeouts.Set(loadRequestId, 1500, load);
            });
    };

    useEffect(() => {
        load();

        AppEvents.AddEventListener("wallet-list-changed", load);

        return () => {
            AppEvents.RemoveEventListener("wallet-list-changed", load);
            Timeouts.Abort(loadRequestId);
            Request.Abort(loadRequestId);
        };
    }, [walletId]);

    return {
        loading,
        load,
        notFound,
        walletName,
        walletAddress,
    };
};
