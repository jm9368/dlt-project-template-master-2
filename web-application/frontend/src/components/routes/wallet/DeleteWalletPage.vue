<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Delete wallet") }}</h2>
            <div class="form-group">
                <label>{{ $t("Wallet address") }}:</label>
                <input
                    type="text"
                    name="wallet-address"
                    readonly
                    :value="walletAddress"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width"
                />
            </div>

            <div class="form-group">
                <label>{{ $t("Input the wallet address to confirm this action") }}:</label>
                <input
                    type="text"
                    name="wallet-address-confirmation"
                    autocomplete="off"
                    v-model="confirmation"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width auto-focus"
                />
            </div>

            <div class="form-group">
                <button type="submit" :disabled="busy || confirmation !== walletAddress" class="btn btn-danger">
                    <i class="fas fa-trash-alt"></i> {{ $t("Delete wallet") }}
                </button>
                <div class="form-error" v-if="error">{{ error }}</div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { getUniqueStringId } from "@/utils/unique-id";

import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";

import { ApiWallet } from "@/api/api-group-wallet";
import { WalletsController } from "@/control/wallets";

export default defineComponent({
    components: {},
    name: "DeleteWalletPage",
    props: {
        walletId: String,
        walletAddress: String,
    },
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            confirmation: "",

            key: "",

            locked: true,

            error: "",
            busy: false,
        };
    },
    methods: {
        onAuthChanged: function () {
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
            }
        },

        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            this.$askUserConfirmation({
                title: this.$t("Delete wallet"),
                message: this.$t("Are you sure you want to delete the wallet from your account?"),
                danger: true,
                callback: () => {
                    this.doDeleteWallet();
                },
            });
        },

        doDeleteWallet: function () {
            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;
            Request.Pending(this.saveRequestId, ApiWallet.DeleteWallet(this.walletId))
                .onSuccess(() => {
                    this.busy = false;
                    this.confirmation = "";
                    this.locked = false;

                    this.$showSnackBar(this.$t("Wallet deleted successfully!"));
                    this.$router.push({ name: "account-settings", query: { tab: "wallets" } });
                    WalletsController.Load();
                })
                .onCancel(() => {
                    this.busy = false;
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        serverError: () => {
                            this.error = this.$t("Internal server error");
                        },
                        networkError: () => {
                            this.error = this.$t("Could not connect to the server");
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.error = err.message;
                    console.error(err);
                    this.busy = false;
                });
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));

        if (AuthController.isAuthenticated()) {
            this.$autoFocus();
        } else {
            this.$requireLogin();
        }
    },
    beforeUnmount: function () {
        Request.Abort(this.saveRequestId);
    },
    watch: {
        walletId: function () {
            this.key = "";
            this.locked = true;
        },
    },
});
</script>

<style></style>
