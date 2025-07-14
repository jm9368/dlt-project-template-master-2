<template>
    <div class="modal-container modal-container-login modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <form @submit="submit" class="modal-dialog modal-md" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Login") }}</div>
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
                        maxlength="255"
                        class="form-control form-control-full-width auto-focus"
                    />
                </div>

                <div class="form-group">
                    <label>{{ $t("Password") }}:</label>
                    <PasswordInput :disabled="busy" v-model:val="password" name="password"></PasswordInput>
                    <div class="form-error" v-if="errorCredentials">{{ errorCredentials }}</div>
                </div>

                <div class="form-group">
                    <label>{{ $t("Remember me?") }}:</label>
                </div>
                <div class="form-group">
                    <ToggleSwitch v-model:val="remember"></ToggleSwitch>
                </div>
            </div>
            <div class="modal-footer">
                <div class="form-group">
                    <button type="submit" :disabled="busy" class="btn btn-login"><i class="fas fa-sign-in"></i> {{ $t("Login") }}</button>
                </div>
                <div class="form-error" v-if="error">{{ error }}</div>
                <div class="tp-services-group" v-if="tpServices.length > 0">
                    <p v-for="tp of tpServices" :key="tp.id">
                        <a :href="tp.url"> {{ $t("Login with") }} {{ tp.name }} </a>
                    </p>
                </div>
                <p>
                    <router-link :to="{ name: 'signup' }">{{ $t("Create an account") }}</router-link>
                </p>
                <p>
                    <router-link :to="{ name: 'forgot-password' }">{{ $t("Forgot your password?") }}</router-link>
                </p>
                <p>
                    <router-link :to="{ name: 'home' }">{{ $t("Continue without an account") }}</router-link>
                </p>
                <p>
                    <a href="javascript:;" @click="openCookiesModal">{{ $t("Change cookies preferences") }}</a>
                </p>
            </div>
        </form>

        <ChangeLanguageModal v-if="displayLanguageModal" v-model:display="displayLanguageModal"></ChangeLanguageModal>
        <CookiesModal v-if="displayCookiesModal" v-model:display="displayCookiesModal"></CookiesModal>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ToggleSwitch from "@/components/utils/ToggleSwitch.vue";
import PasswordInput from "@/components/utils/PasswordInput.vue";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { ApiAuth } from "@/api/api-group-auth";
import { ColorThemeName, getTheme, setTheme } from "@/control/app-preferences";
import CookiesModal from "@/components/modals/CookiesModal.vue";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";

export default defineComponent({
    components: {
        ToggleSwitch,
        ChangeLanguageModal,
        PasswordInput,
        CookiesModal,
    },
    name: "LoginPage",
    setup: function () {
        return {
            requestId: getUniqueStringId(),
            tpLoadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            username: "",
            password: "",

            errorCredentials: "",

            remember: true,

            busy: false,
            error: "",

            theme: getTheme(),
            displayLanguageModal: false,

            displayCookiesModal: false,

            tpServices: [],
        };
    },
    methods: {
        loadTp: function () {
            Timeouts.Abort(this.tpLoadRequestId);

            Request.Pending(this.tpLoadRequestId, ApiAuth.ThirdPartyLoginDetails())
                .onSuccess((tpServices) => {
                    this.tpServices = tpServices;
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        temporalError: () => {
                            Timeouts.Set(this.tpLoadRequestId, 1500, this.loadTp.bind(this));
                        },
                    });
                })
                .onUnexpectedError(() => {
                    Timeouts.Set(this.tpLoadRequestId, 1500, this.loadTp.bind(this));
                });
        },

        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }
            if (this.busy) {
                return;
            }
            this.busy = true;
            this.error = "";
            this.errorCredentials = "";
            this.$getCaptcha("login").then((captcha) => {
                Request.Pending(
                    this.requestId,
                    ApiAuth.Login({ username: this.username, password: this.password, captcha: captcha, remember: this.remember }),
                )
                    .onSuccess((response) => {
                        this.busy = false;
                        AuthController.SetSession(response.session_id);
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
                            badRequestInvalidCredentials: () => {
                                this.errorCredentials = this.$t("Invalid username or password");
                            },
                            badRequest: () => {
                                this.errorCredentials = this.$t("Invalid username or password");
                            },
                            forbiddenCaptcha: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
                            },
                            forbiddenInvalidCredentials: () => {
                                this.errorCredentials = this.$t("Invalid username or password");
                            },
                            forbiddenUserBanned: () => {
                                this.error = this.$t("The user you are trying to log into is banned from the platform");
                            },
                            forbidden: () => {
                                this.errorCredentials = this.$t("Invalid username or password");
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
            } else if (AuthController.isAskingForTwoFactor()) {
                this.$router.push({ name: "tfa-login" });
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

        openCookiesModal: function () {
            this.displayCookiesModal = true;
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));
        this.$listenOnAppEvent("theme-changed", this.onThemeChanged.bind(this));
        this.onAuthChanged();
        this.$autoFocus();
        this.loadTp();
    },
    beforeUnmount: function () {
        Request.Abort(this.requestId);
        Request.Abort(this.tpLoadRequestId);
        Timeouts.Abort(this.tpLoadRequestId);
    },
});
</script>

<style></style>
