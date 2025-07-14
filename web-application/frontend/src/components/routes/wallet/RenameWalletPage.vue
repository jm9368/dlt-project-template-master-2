<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change wallet name") }}</h2>
            <div class="form-group">
                <label>{{ $t("Current wallet name") }}:</label>
                <input
                    type="text"
                    name="old-username"
                    readonly
                    :value="oldName"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width"
                />
            </div>
            <div class="form-group">
                <label>{{ $t("New wallet name") }}:</label>
                <input
                    type="text"
                    name="wallet-name"
                    v-model="name"
                    :disabled="busy"
                    maxlength="80"
                    class="form-control form-control-full-width auto-focus"
                />
            </div>
            <div class="form-group">
                <button type="submit" :disabled="busy || !name || name === oldName" class="btn btn-primary">
                    <i class="fas fa-pencil"></i> {{ $t("Change wallet name") }}
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
    emits: ["mustReload"],
    name: "RenameWalletPage",
    props: {
        walletId: String,
        oldName: String,
    },
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            name: "",
            errorName: "",

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

            if (this.busy) {
                return;
            }

            this.error = "";
            this.errorName = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiWallet.ModifyWallet(this.walletId, { name: this.name }))
                .onSuccess(() => {
                    this.busy = false;

                    this.$showSnackBar(this.$t("Wallet successfully renamed"));
                    this.$emit("mustReload");

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
                        badRequestInvalidName: () => {
                            this.errorName = this.$t("Invalid name provided");
                        },
                        badRequest: () => {
                            this.error = this.$t("Bad request");
                        },
                        notFound: () => {
                            this.error = this.$t("Wallet not found");
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
});
</script>

<style></style>
