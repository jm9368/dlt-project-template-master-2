<template>
    <div class="content-inner" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>
        <form @submit="submit" v-if="!loading">
            <h2>{{ $t("Two factor authentication") }}</h2>
            <div v-if="!tfa">
                <div class="form-group">
                    <label>{{ $t("Scan this QR code with your authentication app") }}:</label>
                </div>
                <div class="form-group tfa-code-container">
                    <qrcode-vue :value="uri" :size="300" level="H" />
                </div>
                <div class="form-group">
                    <label>{{ $t("Input your one-time password") }}:</label>
                    <input
                        type="text"
                        name="tfa-token"
                        autocomplete="off"
                        v-model="token"
                        :disabled="busy"
                        maxlength="6"
                        class="form-control form-control-full-width auto-focus"
                    />
                    <div class="form-error" v-if="errorToken">{{ errorToken }}</div>
                </div>
                <div class="form-group">
                    <label>{{ $t("This is the corresponding TOTP secret (for security backup)") }}:</label>
                    <input
                        type="text"
                        name="secret"
                        readonly
                        v-model="secret"
                        :disabled="busy"
                        maxlength="255"
                        class="form-control form-control-full-width"
                    />
                </div>
                <div class="form-group">
                    <label>{{ $t("Input your account password to confirm this action") }}:</label>
                    <PasswordInput :disabled="busy" v-model:val="password" name="password"></PasswordInput>
                    <div class="form-error" v-if="errorPassword">{{ errorPassword }}</div>
                </div>
                <div class="form-group">
                    <label>{{ $t("Warning: By enabling two factor authentication, all your sessions will be closed.") }}</label>
                </div>
                <div class="form-group">
                    <button type="submit" :disabled="busy" class="btn btn-primary">
                        <i class="fas fa-lock"></i> {{ $t("Enable two factor authentication") }}
                    </button>
                    <div class="form-error" v-if="error">{{ error }}</div>
                </div>
            </div>
            <div v-else>
                <div class="form-group">
                    <label>{{ $t("Two factor authentication is enabled for your account") }}</label>
                </div>
                <div class="form-group">
                    <label>{{ $t("Input your one-time password") }}:</label>
                    <input
                        type="text"
                        name="tfa-token"
                        autocomplete="off"
                        v-model="token"
                        :disabled="busy"
                        maxlength="6"
                        class="form-control form-control-full-width auto-focus"
                    />
                </div>
                <div class="form-group">
                    <button type="submit" :disabled="busy" class="btn btn-danger">
                        <i class="fas fa-lock-open"></i> {{ $t("Disable two factor authentication") }}
                    </button>
                    <div class="form-error" v-if="error">{{ error }}</div>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { getUniqueStringId } from "@/utils/unique-id";

import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { Timeouts } from "@/utils/timeout";
import { ApiAccount } from "@/api/api-group-account";

import PasswordInput from "@/components/utils/PasswordInput.vue";
import ComponentLoader from "@/components/utils/ComponentLoader.vue";

import QrcodeVue from "qrcode.vue";

export default defineComponent({
    components: {
        PasswordInput,
        ComponentLoader,
        QrcodeVue,
    },
    name: "TwoFactorAuthenticationPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,

            tfa: AuthController.RequiresTwoFactorAuthentication,

            secret: "",
            uri: "",

            token: "",
            errorToken: "",

            password: "",
            errorPassword: "",

            error: "",
            busy: false,
        };
    },
    methods: {
        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
                return;
            }

            this.tfa = AuthController.RequiresTwoFactorAuthentication;

            Request.Pending(this.loadRequestId, ApiAccount.GenerateTFA())
                .onSuccess((generatedTFA) => {
                    this.loading = false;
                    this.token = "";
                    this.secret = generatedTFA.secret;
                    this.uri = generatedTFA.uri;

                    this.$autoFocus();
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        temporalError: () => {
                            // Retry
                            Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    console.error(err);
                    // Retry
                    Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
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
            this.errorPassword = "";
            this.errorToken = "";

            this.busy = true;

            if (!this.tfa) {
                Request.Pending(
                    this.saveRequestId,
                    ApiAccount.SetupTFA({ secret: this.secret, password: this.password, token: this.token }),
                )
                    .onSuccess(() => {
                        this.busy = false;
                        this.password = "";
                        this.token = "";
                        this.tfa = true;

                        AuthController.CheckAuthStatus();

                        this.$showSnackBar(this.$t("Two factor authentication successfully enabled"));
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
                            badRequestWrongPassword: () => {
                                this.errorPassword = this.$t("Wrong password");
                            },
                            badRequestAlready: () => {
                                this.error = this.$t("Two factor authentication is already enabled for this account");
                                AuthController.CheckAuthStatus();
                            },
                            badRequestInvalid: () => {
                                this.errorToken = this.$t("Invalid one-time password");
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
            } else {
                Request.Pending(this.saveRequestId, ApiAccount.RemoveTFA({ token: this.token }))
                    .onSuccess(() => {
                        this.busy = false;
                        this.password = "";
                        this.token = "";
                        this.tfa = false;

                        AuthController.CheckAuthStatus();

                        this.$showSnackBar(this.$t("Two factor authentication successfully disabled"));
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
                            badRequestNotEnabled: () => {
                                this.error = this.$t("Two factor authentication is not enabled for this account");
                                AuthController.CheckAuthStatus();
                            },
                            badRequestInvalid: () => {
                                this.errorToken = this.$t("Invalid one-time password");
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
            }
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.load.bind(this));

        this.load();
    },
    beforeUnmount: function () {
        Request.Abort(this.saveRequestId);
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);
    },
});
</script>

<style scoped>
.dark-theme .tfa-code-container canvas {
    border: solid 4px white;
}
</style>
