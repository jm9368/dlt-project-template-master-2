<template>
    <div class="content-inner" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>

        <div v-if="!loading">
            <h2>{{ $t("Active sessions") }}</h2>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>{{ $t("Date") }}</th>
                            <th>{{ $t("IP address") }}</th>
                            <th>{{ $t("Operating system") }}</th>
                            <th>{{ $t("Web browser") }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody v-if="loading">
                        <tr>
                            <td colspan="5">{{ $t("Loading") }}...</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr v-for="s in sessions" :key="s.session">
                            <td>{{ renderDate(s.created) }}</td>
                            <td>{{ s.remote }}</td>
                            <td>{{ s.os }}</td>
                            <td>{{ s.browser }}</td>
                            <td v-if="s.current" class="text-center">({{ $t("Current session") }})</td>
                            <td v-if="!s.current" class="text-center">
                                <button type="button" class="btn btn-danger btn-xs" @click="closeSession(s.session)">
                                    <i class="fas fa-trash-alt"></i> {{ $t("Close session") }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-danger" @click="closeAllSessions">
                    <i class="fas fa-trash-alt"></i> {{ $t("Close all sessions") }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";

import ComponentLoader from "@/components/utils/ComponentLoader.vue";
import { ApiAccount } from "@/api/api-group-account";
import { renderDateAndTime } from "@/utils/time-utils";
import { SessionListItem } from "@/api/definitions";

export default defineComponent({
    components: {
        ComponentLoader,
    },
    name: "ActiveSessionsPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
            closeSessionRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,

            sessions: [] as SessionListItem[],

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

            Request.Pending(this.loadRequestId, ApiAccount.GetSessions())
                .onSuccess((sessions) => {
                    this.sessions = sessions;
                    this.loading = false;

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

        renderDate: function (t: number): string {
            return renderDateAndTime(t, this.$t);
        },

        closeSession: function (s: string) {
            if (this.busy) {
                return;
            }

            this.busy = true;

            Request.Pending(this.closeSessionRequestId, ApiAccount.CloseSession(s))
                .onSuccess(() => {
                    this.busy = false;
                    this.sessions = this.sessions.filter((sessionData) => {
                        return sessionData.session !== s;
                    });
                    this.$showSnackBar(this.$t("Remote device session removed"));
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
                        serverError: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Internal server error"));
                        },
                        networkError: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Could not connect to the server"));
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.$showMessageModal(this.$t("Error"), err.message);
                    console.error(err);
                    this.busy = false;
                });
        },

        closeAllSessions: function () {
            this.$askUserConfirmation({
                title: this.$t("Close all sessions"),
                message: this.$t("Do you want to close all the active sessions?"),
                danger: true,
                callback: () => {
                    this.doCloseAllSessions();
                },
            });
        },

        doCloseAllSessions: function () {
            if (this.busy) {
                return;
            }

            this.busy = true;

            Request.Pending(this.closeSessionRequestId, ApiAccount.CloseAllSessions())
                .onSuccess(() => {
                    this.busy = false;
                    this.$showSnackBar(this.$t("All active sessions closed"));
                    this.load();
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
                        serverError: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Internal server error"));
                        },
                        networkError: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Could not connect to the server"));
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.$showMessageModal(this.$t("Error"), err.message);
                    console.error(err);
                    this.busy = false;
                });
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.load.bind(this));

        this.load();
        this.$autoFocus();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);

        Request.Abort(this.closeSessionRequestId);
    },
});
</script>

<style scoped></style>
