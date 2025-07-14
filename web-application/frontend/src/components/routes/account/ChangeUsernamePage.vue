<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change username") }}</h2>
            <div class="form-group">
                <label>{{ $t("Current username") }}:</label>
                <input
                    type="text"
                    name="old-username"
                    readonly
                    v-model="username"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width"
                />
            </div>
            <div class="form-group">
                <label>{{ $t("New username") }}:</label>
                <input
                    type="text"
                    name="username"
                    v-model="newUsername"
                    :disabled="busy"
                    maxlength="80"
                    class="form-control form-control-full-width auto-focus"
                />
                <div class="form-error" v-if="errorUsername">{{ errorUsername }}</div>
            </div>
            <div class="form-group">
                <label>{{ $t("Input your account password to confirm this action") }}:</label>
                <PasswordInput :disabled="busy" v-model:val="password" name="password"></PasswordInput>
                <div class="form-error" v-if="errorPassword">{{ errorPassword }}</div>
            </div>
            <div class="form-group" v-if="tfa">
                <label>{{ $t("Input your one-time password to confirm this action") }}:</label>
                <input
                    type="text"
                    name="tfa-token"
                    autocomplete="off"
                    v-model="token"
                    :disabled="busy"
                    maxlength="6"
                    placeholder="012345"
                    class="form-control form-control-full-width"
                />
            </div>
            <div class="form-group">
                <button type="submit" :disabled="busy || !newUsername || username === newUsername" class="btn btn-primary">
                    <i class="fas fa-user-tag"></i> {{ $t("Change username") }}
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
import { ApiAccount } from "@/api/api-group-account";

import PasswordInput from "@/components/utils/PasswordInput.vue";

export default defineComponent({
    components: {
        PasswordInput,
    },
    name: "ChangeUsernamePage",
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            username: AuthController.Username,
            newUsername: "",
            errorUsername: "",

            password: "",
            errorPassword: "",

            tfa: AuthController.RequiresTwoFactorAuthentication,
            token: "",
            errorToken: "",

            error: "",
            busy: false,
        };
    },
    methods: {
        onAuthChanged: function () {
            this.username = AuthController.Username;
            this.tfa = AuthController.RequiresTwoFactorAuthentication;
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
            this.errorUsername = "";
            this.errorPassword = "";
            this.errorToken = "";

            this.busy = true;

            Request.Pending(
                this.saveRequestId,
                ApiAccount.ChangeUsername({ username: this.newUsername, password: this.password, tfa_token: this.token }),
            )
                .onSuccess(() => {
                    this.busy = false;
                    this.password = "";
                    this.token = "";
                    AuthController.CheckAuthStatus();
                    this.$showSnackBar(this.$t("Username successfully changed"));
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
                        badRequestInvalidTfaCode: () => {
                            this.errorToken = this.$t("Invalid one-time password");
                        },
                        badRequestUsernameInvalid: () => {
                            this.errorUsername = this.$t("Invalid username provided");
                        },
                        badRequestUsernameInUse: () => {
                            this.errorUsername = this.$t("The provided username is already in use");
                        },
                        badRequestWrongPassword: () => {
                            this.errorPassword = this.$t("Wrong password");
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
