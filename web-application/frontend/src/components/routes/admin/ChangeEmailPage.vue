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
                    :value="email"
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

import { HOME_ROUTE } from "@/app-events-plugin";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";

export default defineComponent({
    components: {},
    name: "ChangeEmailPage",
    emits: ["mustReload"],
    props: {
        userId: String,
        email: String,
    },
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            newEmail: "",
            errorEmail: "",

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

            if (this.busy) {
                return;
            }

            this.error = "";
            this.errorEmail = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiUsersAdmin.ChangeEmail(this.userId, { email: this.newEmail }))
                .onSuccess(() => {
                    this.busy = false;
                    this.$showSnackBar(this.$t("Email successfully changed"));
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
                        badRequestEmailInvalid: () => {
                            this.errorEmail = this.$t("Invalid email provided");
                        },
                        badRequestEmailInUse: () => {
                            this.errorEmail = this.$t("The provided email is already in use");
                        },
                        badRequest: () => {
                            this.error = this.$t("Bad request");
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
