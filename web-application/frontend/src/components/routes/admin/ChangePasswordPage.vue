<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change password") }}</h2>
            <div class="form-group">
                <label>{{ $t("New password") }}:</label>
                <PasswordInput
                    :disabled="busy"
                    v-model:val="password"
                    name="password"
                    :is-new-password="true"
                    :auto-focus="true"
                ></PasswordInput>
                <div class="form-error" v-if="errorPassword">{{ errorPassword }}</div>
            </div>
            <div class="form-group">
                <label>{{ $t("Repeat the new password") }}:</label>
                <PasswordInput :disabled="busy" v-model:val="password2" name="password2" :is-new-password="true"></PasswordInput>
            </div>
            <div class="form-group">
                <button type="submit" :disabled="busy" class="btn btn-primary">
                    <i class="fas fa-key"></i> {{ $t("Change password") }}
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

import PasswordInput from "@/components/utils/PasswordInput.vue";
import { HOME_ROUTE } from "@/app-events-plugin";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";

export default defineComponent({
    components: {
        PasswordInput,
    },
    props: {
        userId: String,
    },
    name: "ChangePasswordPage",
    emits: ["mustReload"],
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            password: "",
            password2: "",
            errorPassword: "",

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

            Request.Pending(this.saveRequestId, ApiUsersAdmin.ChangePassword(this.userId, { password: this.password }))
                .onSuccess(() => {
                    this.busy = false;
                    this.password = "";
                    this.password2 = "";

                    this.$showSnackBar(this.$t("Password successfully changed"));
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
                        badRequestWeakPassword: () => {
                            this.errorPassword = this.$t("The provided password is too short");
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
