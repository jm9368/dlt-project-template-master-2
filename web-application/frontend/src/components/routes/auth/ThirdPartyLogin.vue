<template>
    <div class="modal-container modal-container-signup modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-md" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Logging in") }}</div>
            </div>
            <div class="modal-body">
                <div class="">
                    <label><i class="fa fa-spinner fa-spin"></i> {{ $t("Logging in") }}...</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ApiAuth } from "@/api/api-group-auth";
import { AuthController } from "@/control/auth";
import { saveIntoLocalStorage } from "@/utils/local-storage";
import { Timeouts } from "@/utils/timeout";
import { getUniqueStringId } from "@/utils/unique-id";
import { Request } from "@asanrom/request-browser";
import { defineComponent } from "vue";

export default defineComponent({
    components: {},
    name: "ThirdPartyLogin",
    setup: function () {
        return {
            requestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            done: false,
        };
    },
    methods: {
        onAuthChanged: function () {
            if (AuthController.isAuthenticated()) {
                this.$goBackFromLogin();
            } else if (AuthController.isAskingForTwoFactor()) {
                this.$router.push({ name: "tfa-login" });
            } else if (AuthController.FirstTimeLoaded && !this.done) {
                this.done = true;
                const service = (this.$route.params.service || "") + "";
                const code = (this.$route.query.code || "") + "";

                if (service && code) {
                    this.doLogin(service, code);
                } else {
                    this.$goBackFromLogin();
                }
            }
        },

        doLogin: function (service: string, code: string) {
            Timeouts.Abort(this.requestId);
            Request.Abort(this.requestId);

            Request.Pending(this.requestId, ApiAuth.ThirdPartyLogin({ service: service, code: code }))
                .onSuccess((res) => {
                    if (res.result === "SESSION") {
                        AuthController.SetSession(res.session_id);
                    } else {
                        saveIntoLocalStorage("tp-register-token", res.token, true);
                        this.$router.push({ name: "tp-signup", query: { id: res.id, email: res.email } });
                    }
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        badRequestBanned: () => {
                            this.$showMessageModal(
                                this.$t("Error"),
                                this.$t("The user you are trying to log into is banned from the platform"),
                            );
                            this.$goBackFromLogin();
                        },
                        badRequestOauthError: () => {
                            this.$showMessageModal(
                                this.$t("Error"),
                                this.$t("Could not login with OAuth 2.0. Maybe the service is misconfigured?"),
                            );
                            this.$goBackFromLogin();
                        },
                        badRequestServiceInvalid: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Invalid login service provided in the URL"));
                            this.$goBackFromLogin();
                        },
                        badRequestNoCode: () => {
                            this.$goBackFromLogin();
                        },
                        badRequest: () => {
                            this.$goBackFromLogin();
                        },
                        temporalError: () => {
                            Timeouts.Set(this.requestId, 1500, () => {
                                this.doLogin(service, code);
                            });
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    console.error(err);
                    Timeouts.Set(this.requestId, 1500, () => {
                        this.doLogin(service, code);
                    });
                });
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));
        this.onAuthChanged();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.requestId);
        Request.Abort(this.requestId);
    },
});
</script>

<style></style>
