<template>
    <div class="content-inner" tabindex="-1">
        <div>
            <h2>{{ $t("Moderation") }}</h2>
            <div class="table-responsive">
                <table class="table">
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Username") }}:</td>
                        <td>
                            {{ username }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Role") }}:</td>
                        <td>
                            {{ role || "(" + $t("Default role") + ")" }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Email") }}:</td>
                        <td>
                            {{ email }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Language") }}:</td>
                        <td>
                            {{ renderLanguage(locale) }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Banned?") }}:</td>
                        <td>
                            {{ banned ? $t("Yes") : $t("No") }}
                        </td>
                    </tr>
                </table>
            </div>

            <div>
                <form @submit="banUser" v-if="!banned">
                    <div class="form-group">
                        <button type="submit" :disabled="busy" class="btn btn-danger">
                            <i class="fas fa-thumbs-down"></i> {{ $t("Ban user") }}
                        </button>
                        <div class="form-error" v-if="error">{{ error }}</div>
                    </div>
                </form>

                <form @submit="pardonUser" v-else>
                    <div class="form-group">
                        <button type="submit" :disabled="busy" class="btn btn-primary">
                            <i class="fas fa-thumbs-up"></i> {{ $t("Pardon user") }}
                        </button>
                        <div class="form-error" v-if="error">{{ error }}</div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AuthController } from "@/control/auth";
import { renderDateAndTime } from "@/utils/time-utils";
import { AVAILABLE_LANGUAGES } from "@/i18n";
import { Request } from "@asanrom/request-browser";
import { getUniqueStringId } from "@/utils/unique-id";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";
import { HOME_ROUTE } from "@/app-events-plugin";

export default defineComponent({
    components: {},
    name: "UserModerationPage",
    emits: ["mustReload"],
    props: {
        userId: String,
        username: String,
        role: String,
        email: String,
        locale: String,
        banned: Boolean,
        created: Number,
    },
    setup: function () {
        return {
            requestId: getUniqueStringId(),
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
                return;
            }

            if (!AuthController.hasPermission("mod.ban")) {
                this.$showMessageModal(this.$t("Access denied"), this.$t("You lack the required permission to visit this page"));
                this.$router.push({ name: HOME_ROUTE });
                return;
            }

            this.$autoFocus();
        },

        renderDate: function (ts: number) {
            return renderDateAndTime(ts, this.$t);
        },

        renderLanguage: function (locale: string) {
            for (const l of AVAILABLE_LANGUAGES) {
                if (l.id === locale) {
                    return l.name;
                }
            }

            return locale || "-";
        },

        banUser: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            this.$askUserConfirmation({
                title: this.$t("Ban user"),
                message: this.$t("Do you want to ban this user from the platform?"),
                danger: true,
                callback: () => {
                    this.doBanUser();
                },
            });
        },

        doBanUser: function () {
            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;

            Request.Pending(this.requestId, ApiUsersAdmin.Ban(this.userId))
                .onSuccess(() => {
                    this.busy = false;

                    this.$showSnackBar(this.$t("User banned"));
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
                        badRequest: () => {
                            this.error = this.$t("This user is immune to moderation");
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

        pardonUser: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            this.$askUserConfirmation({
                title: this.$t("Pardon user"),
                message: this.$t("Do you want to pardon this banned user?"),
                danger: false,
                callback: () => {
                    this.doPardonUser();
                },
            });
        },

        doPardonUser: function () {
            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;

            Request.Pending(this.requestId, ApiUsersAdmin.Pardon(this.userId))
                .onSuccess(() => {
                    this.busy = false;

                    this.$showSnackBar(this.$t("User pardoned"));
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
        Request.Abort(this.requestId);
    },
});
</script>

<style></style>
