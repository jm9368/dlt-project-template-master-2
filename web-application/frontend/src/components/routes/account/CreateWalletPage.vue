<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Create wallet") }}</h2>
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
                <div class="form-error" v-if="errorName">{{ errorName }}</div>
            </div>
            <div class="form-group">
                <label>{{ $t("Wallet password") }}:</label>
                <PasswordInput :disabled="busy" v-model:val="password" name="wallet-password" :is-new-password="true"></PasswordInput>
                <div class="form-error" v-if="errorPassword">{{ errorPassword }}</div>
            </div>
            <div class="form-group">
                <label>{{ $t("Repeat the password") }}:</label>
                <PasswordInput
                    :disabled="busy"
                    v-model:val="password2"
                    name="wallet-password-2"
                    :is-new-password="true"
                    :is-repeated-password="true"
                ></PasswordInput>
            </div>
            <div class="form-group">
                <label>{{ $t("Private key (Hexadecimal. If you leave it blank, it will generate a random one)") }}:</label>
                <textarea class="form-control form-control-full-width form-textarea" rows="3" v-model="privKey"></textarea>
                <div class="form-error" v-if="errorPrivKey">{{ errorPrivKey }}</div>
            </div>
            <div class="form-group">
                <button type="submit" :disabled="busy" class="btn btn-primary">
                    <i class="fas fa-plus"></i> {{ $t("Create wallet") }}
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

import PasswordInput from "@/components/utils/PasswordInput.vue";
import { ApiWallet } from "@/api/api-group-wallet";
import { WalletsController } from "@/control/wallets";

export default defineComponent({
    components: {
        PasswordInput,
    },
    name: "ChangeEmailPage",
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            name: "",
            errorName: "",

            privKey: "",
            errorPrivKey: "",

            password: "",
            password2: "",
            errorPassword: "",

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
            this.errorPassword = "";
            this.errorPrivKey = "";

            if (!this.name) {
                this.errorName = this.$t("You must specify a wallet name");
                return;
            }

            if (!this.password) {
                this.errorPassword = this.$t("You must specify a password");
                return;
            }

            if (this.password !== this.password2) {
                this.errorPassword = this.$t("The passwords do not match");
                return;
            }

            this.busy = true;

            Request.Pending(
                this.saveRequestId,
                ApiWallet.CreateWallet({ name: this.name, password: this.password, private_key: this.privKey }),
            )
                .onSuccess((w) => {
                    this.busy = false;
                    this.name = "";
                    this.password = "";
                    this.privKey = "";

                    this.$showSnackBar(this.$t("Wallet successfully created!"));
                    WalletsController.Load();
                    WalletsController.SetDefaultWallet(w);

                    this.$router.push({ name: "wallet", params: { id: w.id } });
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
                        badRequestWeakPassword: () => {
                            this.errorPassword = this.$t("The provided password is too short");
                        },
                        badRequestInvalidPrivateKey: () => {
                            this.errorPrivKey = this.$t("Invalid private key provided");
                        },
                        badRequestTooManyWallets: () => {
                            this.error = this.$t(
                                "You already have too many wallets registered for your account. Please delete some before creating more.",
                            );
                        },
                        badRequest: () => {
                            this.error = this.$t("Bad request");
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
