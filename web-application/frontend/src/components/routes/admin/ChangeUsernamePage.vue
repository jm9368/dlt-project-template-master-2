<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change username") }}</h2>
            <div class="form-group">
                <label>{{ $t("Current username") }}:</label>
                <input
                    type="text"
                    name="old-username"
                    readonly
                    :value="username"
                    :disabled="busy"
                    maxlength="255"
                    class="form-control form-control-full-width"
                />
            </div>
            <div class="form-group">
                <label>{{ $t("New username") }}:</label>
                <input
                    type="text"
                    name="username"
                    v-model="newUsername"
                    :disabled="busy"
                    maxlength="80"
                    class="form-control form-control-full-width auto-focus"
                />
                <div class="form-error" v-if="errorUsername">{{ errorUsername }}</div>
            </div>
            <div class="form-group">
                <button type="submit" :disabled="busy || !newUsername || username === newUsername" class="btn btn-primary">
                    <i class="fas fa-user-tag"></i> {{ $t("Change username") }}
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
    name: "ChangeUsernamePage",
    emits: ["mustReload"],
    props: {
        userId: String,
        username: String,
    },
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            newUsername: "",
            errorUsername: "",

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
            this.errorUsername = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiUsersAdmin.ChangeUsername(this.userId, { username: this.newUsername }))
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
                        badRequestUsernameInvalid: () => {
                            this.errorUsername = this.$t("Invalid username provided");
                        },
                        badRequestUsernameInUse: () => {
                            this.errorUsername = this.$t("The provided username is already in use");
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
