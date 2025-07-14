<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change email") }}</h2>
            <div class="form-group">
                <label>{{ $t("Current email") }}:</label>
                <input
                    type="text"
                    name="old-email"
                    readonly
                    v-model="email"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width"
                />
            </div>
            <div class="form-group">
                <label>{{ $t("New email") }}:</label>
                <input
                    type="text"
                    name="email"
                    v-model="newEmail"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width auto-focus"
                />
                <div class="form-error" v-if="errorEmail">{{ errorEmail }}</div>
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
                <button type="submit" :disabled="busy || !newEmail || email === newEmail" class="btn btn-primary">
                    <i class="fas fa-envelope"></i> {{ $t("Change email") }}
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
    name: "ChangeEmailPage",
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            email: AuthController.Email,
            newEmail: "",
            errorEmail: "",

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
            this.email = AuthController.Email;
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
            this.errorEmail = "";
            this.errorPassword = "";
            this.errorToken = "";

            this.busy = true;

            this.$getCaptcha("change_email").then((captcha) => {
                Request.Pending(
                    this.saveRequestId,
                    ApiAccount.ChangeEmail({ email: this.newEmail, tfa_token: this.token, password: this.password, captcha: captcha }),
                )
                    .onSuccess(() => {
                        this.busy = false;
                        this.password = "";
                        this.token = "";

                        AuthController.CheckAuthStatus();
                        this.$showMessageModal(
                            this.$t("Email change requested"),
                            this.$t(
                                "Check your inbox for an email we have sent to your new email in order to verify it and complete the change",
                            ),
                        );
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
                            badRequestEmailInvalid: () => {
                                this.errorEmail = this.$t("Invalid email provided");
                            },
                            badRequestEmailInUse: () => {
                                this.errorEmail = this.$t("The provided email is already in use");
                            },
                            badRequestCaptcha: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
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
