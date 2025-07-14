<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Two factor authentication") }}</h2>
            <p v-if="tfa">{{ $t("This user has two factor authentication enabled") }}</p>
            <p v-if="!tfa">{{ $t("This user has two factor authentication disabled") }}</p>
            <div class="form-group" v-if="tfa">
                <button type="submit" :disabled="busy" class="btn btn-danger">
                    <i class="fas fa-lock-open"></i> {{ $t("Disable two factor authentication") }}
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

import { HOME_ROUTE } from "@/app-events-plugin";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";

export default defineComponent({
    components: {},
    name: "DisableTwoFactorAuthenticationPage",
    emits: ["mustReload"],
    props: {
        userId: String,
        tfa: Boolean,
    },
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            error: "",
            busy: false,
        };
    },
    methods: {
        onAuthChanged: function () {
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
            }

            if (!AuthController.hasPermission("admin.users.manage")) {
                this.$showMessageModal(this.$t("Access denied"), this.$t("You lack the required permission to visit this page"));
                this.$router.push({ name: HOME_ROUTE });
                return;
            }

            this.$autoFocus();
        },

        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            this.$askUserConfirmation({
                title: this.$t("Disable two factor authentication"),
                message: this.$t("Do you want to disable two factor authentication for this user?"),
                danger: true,
                callback: () => {
                    this.disableTFA();
                },
            });
        },

        disableTFA: function () {
            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiUsersAdmin.DisableTFA(this.userId))
                .onSuccess(() => {
                    this.busy = false;
                    this.$showSnackBar(this.$t("Username successfully changed"));
                    this.$emit("mustReload");
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
                        notFound: () => {
                            this.error = this.$t("User not found");
                            this.$emit("mustReload");
                        },
                        forbidden: () => {
                            this.error = this.$t("Access denied");
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

        this.onAuthChanged();
    },
    beforeUnmount: function () {
        Request.Abort(this.saveRequestId);
    },
});
</script>

<style></style>
