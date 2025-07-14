<template>
    <div class="modal-container modal-container-login modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <form @submit="submit" class="modal-dialog modal-md" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Two factor authentication") }}</div>
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
                    <label>{{ $t("Username") }}:</label>
                    <input
                        type="text"
                        name="username"
                        v-model="username"
                        :disabled="busy"
                        readonly
                        maxlength="255"
                        class="form-control form-control-full-width"
                    />
                </div>
                <div class="form-group">
                    <label>{{ $t("Input your one-time password") }}:</label>
                    <input
                        type="text"
                        name="tfa-token"
                        autocomplete="off"
                        v-model="token"
                        :disabled="busy"
                        maxlength="255"
                        class="form-control form-control-full-width auto-focus"
                    />
                </div>
            </div>
            <div class="modal-footer">
                <div class="form-group">
                    <button type="submit" :disabled="busy" class="btn btn-login">
                        {{ $t("Login") }}
                    </button>
                </div>
                <div class="form-error">{{ error }}</div>
                <p>
                    <router-link @click="logout" :to="{ name: 'login' }">{{ $t("Use a different account") }}</router-link>
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
import { defineComponent } from "vue";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { ApiAuth } from "@/api/api-group-auth";
import { ColorThemeName, getTheme, setTheme } from "@/control/app-preferences";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";

export default defineComponent({
    components: {
        ChangeLanguageModal,
    },
    name: "TwoFactorLoginPage",
    data: function () {
        return {
            username: AuthController.Username,

            token: "",

            busy: false,
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
            this.$getCaptcha("tfa").then((captcha) => {
                Request.Do(ApiAuth.LoginTFA({ captcha: captcha, token: this.token }))
                    .onSuccess(() => {
                        this.busy = false;
                        AuthController.CheckAuthStatus();
                    })
                    .onCancel(() => {
                        this.busy = false;
                    })
                    .onRequestError((err, handleErr) => {
                        this.busy = false;
                        handleErr(err, {
                            unauthorized: () => {
                                AuthController.Logout();
                            },
                            badRequestCaptcha: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
                            },
                            badRequest: () => {
                                this.error = this.$t("Invalid one-time password");
                            },
                            forbiddenInvalidCode: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
                            },
                            forbidden: () => {
                                this.error = this.$t("Invalid one-time password");
                            },
                            notFound: () => {
                                AuthController.Logout();
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
            this.username = AuthController.Username;
            if (AuthController.isAuthenticated()) {
                this.$goBackFromLogin();
            } else if (!AuthController.isAskingForTwoFactor()) {
                this.$router.push({ name: "login" });
            }
        },

        logout: function () {
            AuthController.Logout();
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
