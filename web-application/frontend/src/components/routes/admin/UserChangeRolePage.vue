<template>
    <div class="content-inner" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>

        <div v-if="!loading">
            <h2>{{ $t("Change role") }}</h2>
            <form @submit="submit">
                <div class="form-group">
                    <label>{{ $t("User role") }}:</label>
                    <select class="form-control form-select form-control-full-width" v-model="newRole" @change="updateCurrentRole">
                        <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.id || "(" + $t("Default role") + ")" }}</option>
                    </select>
                </div>
                <div class="form-group" v-if="!!currentRole">
                    <div class="role-item">
                        <div class="role-header">
                            <div class="role-header-details">
                                <div class="role-id">
                                    <span class="role-id-label">{{ $t("Role") }}: </span>
                                    <span class="role-id-span">{{ currentRole.id || "(" + $t("Default role") + ")" }}</span>
                                </div>
                                <div class="role-permissions" v-if="filterPermissions(currentRole.permissions).length > 0">
                                    <span
                                        v-for="p in filterPermissions(currentRole.permissions)"
                                        :key="p.id"
                                        class="role-permission-span"
                                        >{{ p.id }}</span
                                    >
                                </div>
                                <div class="role-permissions" v-else>
                                    <span class="role-permissions-label">{{ $t("No permissions granted") }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit" :disabled="busy || role === newRole" class="btn btn-primary">
                        <i class="fas fa-user-cog"></i> {{ $t("Change role") }}
                    </button>
                    <div class="form-error" v-if="error">{{ error }}</div>
                </div>
            </form>
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
import { GlobalRole, GlobalRolePermission } from "@/api/definitions";
import { ApiRolesAdmin } from "@/api/api-group-roles-admin";
import { HOME_ROUTE } from "@/app-events-plugin";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";

export default defineComponent({
    components: {
        ComponentLoader,
    },
    name: "UserChangeRolePage",
    emits: ["mustReload"],
    props: {
        userId: String,
        role: String,
    },
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,

            roles: [] as GlobalRole[],
            newRole: this.role,
            currentRole: null as GlobalRole,

            busy: false,
            error: "",
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

            Request.Pending(this.loadRequestId, ApiRolesAdmin.GetRoles())
                .onSuccess((roles) => {
                    this.roles = roles.map((r) => {
                        return {
                            id: r.id,
                            permissions: r.permissions,
                            dirty: false,
                            editing: false,
                        };
                    });
                    this.updateCurrentRole();
                    this.loading = false;

                    this.$autoFocus();
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        forbidden: () => {
                            this.$showMessageModal(
                                this.$t("Access denied"),
                                this.$t("You lack the required permission to visit this page"),
                            );
                            this.$router.push({ name: HOME_ROUTE });
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

        filterPermissions: function (list: GlobalRolePermission[]) {
            return list.filter((p) => p.granted);
        },

        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiUsersAdmin.SetRole(this.userId, { role: this.newRole }))
                .onSuccess(() => {
                    this.busy = false;
                    this.$showSnackBar(this.$t("User role successfully changed"));
                    this.$emit("mustReload");
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        badRequestInvalidRole: () => {
                            this.error = this.$t("Invalid role");
                        },
                        badRequestSelf: () => {
                            this.error = this.$t("You cannot change your own role");
                        },
                        badRequest: () => {
                            this.error = this.$t("Bad request");
                        },
                        forbidden: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Access denied"));
                            AuthController.CheckAuthStatus();
                        },
                        notFound: () => {
                            this.error = this.$t("User not found");
                            this.$emit("mustReload");
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
                    this.busy = false;
                    this.$showMessageModal(this.$t("Error"), err.message);
                });
        },

        updateCurrentRole: function () {
            this.currentRole =
                this.roles.filter((r) => {
                    return r.id === this.newRole;
                })[0] || null;
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

        Request.Abort(this.saveRequestId);
    },

    watch: {
        role: function () {
            this.newRole = "role";
        },
    },
});
</script>

<style scoped>
.roles-list {
    padding-bottom: 1rem;
    border-bottom: solid 1px var(--theme-border-color);
    margin-bottom: 1rem;

    display: flex;
    flex-direction: column;
}

.role-item {
    border: solid 1px var(--theme-border-color);
    border-radius: 12px;
    padding: 0.5rem;
}

.role-item.margin-top {
    margin-top: 0.75rem;
}

.role-header {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.role-header-details {
    flex: 1;
    min-width: 0;
}

.role-id {
    padding-bottom: 0.5rem;
    font-size: large;
}

.role-id-span {
    font-weight: bold;
}

.role-permissions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.role-permission-span {
    background: var(--selected-color);
    margin: 0.25rem;
    padding: 0.25rem;
    border-radius: 0.25rem;
}

.role-permission-span.no-margin {
    margin: 0;
}
</style>
