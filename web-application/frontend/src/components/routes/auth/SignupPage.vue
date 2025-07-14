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
                    <input
                        type="text"
                        name="email"
                        v-model="email"
                        :disabled="busy"
                        maxlength="255"
                        class="form-control form-control-full-width auto-focus"
                    />
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
                        <i class="fas fa-user-plus"></i> {{ $t("Create account") }}
                    </button>
                </div>
                <div class="form-error" v-if="error">{{ error }}</div>
                <div class="tp-services-group" v-if="tpServices.length > 0">
                    <p v-for="tp of tpServices" :key="tp.id">
                        <a :href="tp.url"> {{ $t("Sign up with") }} {{ tp.name }} </a>
                    </p>
                </div>
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
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { getLanguage } from "@/i18n";

export default defineComponent({
    components: {
        ChangeLanguageModal,
        PasswordInput,
    },
    name: "SignupPage",
    setup: function () {
        return {
            requestId: getUniqueStringId(),
            tpLoadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            username: "",
            errorUsername: "",

            password: "",
            password2: "",
            errorPassword: "",

            email: "",
            errorEmail: "",

            busy: false,
            error: "",

            theme: getTheme(),
            displayLanguageModal: false,

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

            this.$getCaptcha("signup").then((captcha) => {
                Request.Do(
                    ApiAuth.Signup({
                        email: this.email,
                        username: this.username,
                        password: this.password,
                        captcha: captcha,
                        locale: getLanguage(),
                    }),
                )
                    .onSuccess((response) => {
                        this.busy = false;
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
                            badRequestCaptcha: () => {
                                this.error = this.$t("Please, prove you are not a robot by solving the captcha");
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
                            badRequestEmailInvalid: () => {
                                this.errorEmail = this.$t("Invalid email provided");
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
