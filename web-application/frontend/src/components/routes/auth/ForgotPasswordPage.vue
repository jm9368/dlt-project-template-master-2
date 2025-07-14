<template>
    <div class="modal-container modal-container-signup modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <form @submit="submit" class="modal-dialog modal-md" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Forgot your password?") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Select your language')" @click="selectLanguage">
                    <i class="fas fa-language"></i>
                </button>
                <button type="button" class="modal-close-btn" :title="$t('Change theme')" @click="invertTheme">
                    <i v-if="theme === 'dark'" class="fas fa-sun"></i>
                    <i v-else class="fas fa-moon"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>{{ $t("Input the email of your account and we will send you an email to reset your password.") }}</label>
                </div>
                <div class="form-group">
                    <label>{{ $t("Email") }}:</label>
                    <input
                        type="text"
                        name="email"
                        v-model="email"
                        :disabled="busy || success"
                        maxlength="255"
                        class="form-control form-control-full-width auto-focus"
                    />
                </div>
            </div>
            <div class="modal-footer">
                <div class="form-group" v-if="!success">
                    <button type="submit" :disabled="busy" class="btn btn-login">
                        {{ $t("Submit") }}
                    </button>
                </div>
                <div class="form-group" v-if="success">
                    <label> {{ $t("We have sent an email with the instructions in order to reset your password.") }}</label>
                </div>
                <div class="form-group" v-if="success">
                    <router-link :to="{ name: 'login' }">
                        <button type="button" :disabled="busy" class="btn btn-login"><i class="fas fa-check"></i> {{ $t("Done") }}</button>
                    </router-link>
                </div>
                <div class="form-error">{{ error }}</div>
                <p>
                    <router-link :to="{ name: 'login' }">{{ $t("Back to login form") }}</router-link>
                </p>
                <p>
                    <router-link :to="{ name: 'signup' }">{{ $t("Create an account") }}</router-link>
                </p>
            </div>
        </form>

        <ChangeLanguageModal v-if="displayLanguageModal" v-model:display="displayLanguageModal"></ChangeLanguageModal>
    </div>
</template>

<script lang="ts">
import { ApiAuth } from "@/api/api-group-auth";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { defineComponent } from "vue";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";
import { ColorThemeName, getTheme, setTheme } from "@/control/app-preferences";

export default defineComponent({
    components: {
        ChangeLanguageModal,
    },
    name: "ForgotPasswordPage",
    data: function () {
        return {
            email: "",

            busy: false,
            success: false,
            error: "",

            theme: getTheme(),
            displayLanguageModal: false,
        };
    },
    methods: {
        submit: function (e) {
            if (e) {
                e.preventDefault();
            }
            if (this.busy) {
                return;
            }
            this.busy = true;
            this.error = "";
            this.$getCaptcha("forgot_password").then((captcha) => {
                Request.Do(ApiAuth.RequestPasswordReset({ email: this.email, captcha: captcha }))
                    .onSuccess(() => {
                        this.busy = false;
                        this.success = true;
                    })
                    .onCancel(() => {
                        this.busy = false;
                    })
                    .onRequestError((err, handleErr) => {
                        this.busy = false;
                        handleErr(err, {
                            badRequestCaptcha: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
                            },
                            badRequestEmailInvalid: () => {
                                this.error = this.$t("Invalid email provided");
                            },
                            badRequest: () => {
                                this.error = this.$t("Invalid email provided");
                            },
                            notFound: () => {
                                this.error = this.$t("We did not find any account with the provided email");
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

        onAuthChanged: function () {
            if (AuthController.isAuthenticated()) {
                this.$goBackFromLogin();
            }
        },

        invertTheme: function () {
            setTheme(this.theme === "dark" ? "light" : "dark");
        },

        onThemeChanged: function (t: ColorThemeName) {
            this.theme = t;
        },

        selectLanguage: function () {
            this.displayLanguageModal = true;
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));
        this.$listenOnAppEvent("theme-changed", this.onThemeChanged.bind(this));
        this.onAuthChanged();
        this.$autoFocus();
    },
});
</script>

<style></style>
