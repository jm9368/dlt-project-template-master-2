<template>
    <div class="modal-container modal-container-signup modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <form @submit="submit" class="modal-dialog modal-md" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Create an account") }}</div>
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
                    <label>{{ $t("Email") }}:</label>
                    <input type="text" name="email" v-model="email" readonly maxlength="255" class="form-control form-control-full-width" />
                    <div class="form-error" v-if="errorEmail">{{ errorEmail }}</div>
                </div>
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
                    <div class="form-error" v-if="errorUsername">{{ errorUsername }}</div>
                </div>
                <div class="form-group">
                    <label>{{ $t("Password") }}:</label>
                    <PasswordInput :disabled="busy" v-model:val="password" name="password" :is-new-password="true"></PasswordInput>
                    <div class="form-error" v-if="errorPassword">{{ errorPassword }}</div>
                </div>
                <div class="form-group">
                    <label>{{ $t("Repeat your password") }}:</label>
                    <PasswordInput
                        :disabled="busy"
                        v-model:val="password2"
                        name="password2"
                        :is-new-password="true"
                        :is-repeated-password="true"
                    ></PasswordInput>
                </div>
            </div>
            <div class="modal-footer">
                <div class="form-group">
                    <button type="submit" :disabled="busy" class="btn btn-login">
                        {{ $t("Create account") }}
                    </button>
                </div>
                <div class="form-error" v-if="error">{{ error }}</div>
                <p>
                    <router-link :to="{ name: 'login' }">{{ $t("I already have an account") }}</router-link>
                </p>
                <p>
                    <router-link :to="{ name: 'home' }">{{ $t("Continue without an account") }}</router-link>
                </p>
            </div>
        </form>

        <ChangeLanguageModal v-if="displayLanguageModal" v-model:display="displayLanguageModal"></ChangeLanguageModal>
    </div>
</template>

<script lang="ts">
import { ApiAuth } from "@/api/api-group-auth";
import { ColorThemeName, getTheme, setTheme } from "@/control/app-preferences";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { defineComponent } from "vue";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";
import PasswordInput from "@/components/utils/PasswordInput.vue";
import { fetchFromLocalStorageCache, saveIntoLocalStorage } from "@/utils/local-storage";
import { getLanguage } from "@/i18n";

export default defineComponent({
    components: {
        ChangeLanguageModal,
        PasswordInput,
    },
    name: "ThirdPartySignupPage",
    data: function () {
        return {
            tpId: "",
            tpToken: "",

            username: "",
            errorUsername: "",

            password: "",
            errorPassword: "",
            password2: "",

            email: "",
            errorEmail: "",

            busy: false,
            error: "",

            theme: getTheme(),
            displayLanguageModal: false,
        };
    },
    methods: {
        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }
            if (this.busy) {
                return;
            }

            this.error = "";
            this.errorEmail = "";
            this.errorUsername = "";
            this.errorPassword = "";

            if (!this.password) {
                this.errorPassword = this.$t("You must specify a password");
                return;
            }

            if (this.password !== this.password2) {
                this.errorPassword = this.$t("The passwords do not match");
                return;
            }

            this.busy = true;

            Request.Do(
                ApiAuth.ThirdPartyRegister({
                    id: this.tpId,
                    token: this.tpToken,
                    username: this.username,
                    password: this.password,
                    locale: getLanguage(),
                }),
            )
                .onSuccess((response) => {
                    this.busy = false;
                    saveIntoLocalStorage("tp-register-token", "");
                    if (response.session_id) {
                        AuthController.SetSession(response.session_id);
                    } else {
                        this.$router.push({ name: "signup-success" });
                    }
                })
                .onCancel(() => {
                    this.busy = false;
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        badRequestIdInvalid: () => {
                            this.error = this.$t("This registration link is no longer valid. Go back to the sign up form and try again.");
                        },
                        badRequestTokenInvalid: () => {
                            this.error = this.$t("This registration link is no longer valid. Go back to the sign up form and try again.");
                        },
                        badRequestUsernameInvalid: () => {
                            this.errorUsername = this.$t("Invalid username provided");
                        },
                        badRequestUsernameInUse: () => {
                            this.errorUsername = this.$t("The provided username is already in use");
                        },
                        badRequestWeakPassword: () => {
                            this.errorPassword = this.$t("The provided password is too short");
                        },
                        badRequestEmailInUse: () => {
                            this.errorEmail = this.$t("The provided email is already in use");
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

        onAuthChanged: function () {
            if (AuthController.isAuthenticated()) {
                this.$goBackFromLogin();
            } else {
                this.loadQuery();
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

        loadQuery: function () {
            this.email = (this.$route.query.email || "") + "";
            this.tpId = (this.$route.query.id || "") + "";
            this.tpToken = fetchFromLocalStorageCache("tp-register-token", "");
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
