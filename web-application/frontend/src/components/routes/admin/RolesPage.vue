<template>
    <div class="content-inner" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>

        <div v-if="!loading">
            <h2>{{ $t("Roles") }}</h2>

            <div class="roles-list">
                <div v-for="(role, i) in roles" :key="role.id" class="role-item" :class="{ 'margin-top': i > 0 }">
                    <div class="role-header">
                        <div class="role-header-details">
                            <div class="role-id">
                                <span class="role-id-label">{{ $t("Role") }}: </span>
                                <span class="role-id-span">{{ role.id || "(" + $t("Default role") + ")" }}</span>
                            </div>
                            <div class="role-permissions" v-if="filterPermissions(role.permissions).length > 0">
                                <span v-for="p in filterPermissions(role.permissions)" :key="p.id" class="role-permission-span">{{
                                    p.id
                                }}</span>
                            </div>
                            <div class="role-permissions" v-else>
                                <span class="role-permissions-label">{{ $t("No permissions granted") }}</span>
                            </div>
                        </div>

                        <div v-if="i > 0" class="role-buttons">
                            <button
                                v-if="!role.editing"
                                type="button"
                                :disabled="busy"
                                class="btn btn-primary btn-xs"
                                :class="{ 'btn-mr': !!role.id }"
                                @click="startEdit(role)"
                            >
                                <i class="fas fa-pencil"></i> {{ $t("Edit") }}
                            </button>
                            <button
                                v-if="!role.editing && !!role.id"
                                type="button"
                                :disabled="busy"
                                class="btn btn-danger btn-xs"
                                @click="deleteRole(role)"
                            >
                                <i class="fas fa-trash-alt"></i> {{ $t("Delete") }}
                            </button>
                            <button
                                v-if="role.editing"
                                type="button"
                                :disabled="busy"
                                class="btn btn-primary btn-xs"
                                @click="finishEdit(role)"
                            >
                                <i class="fas fa-save"></i> {{ $t("Save") }}
                            </button>
                        </div>
                    </div>

                    <div class="role-body table-responsive" v-if="role.editing">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>{{ $t("Permission") }}</th>
                                    <th>{{ $t("Granted?") }}</th>
                                    <th>{{ $t("Description") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in role.permissions" :key="p.id">
                                    <td>
                                        <span class="role-permission-span no-margin">{{ p.id }}</span>
                                    </td>
                                    <td>
                                        <ToggleSwitch v-model:val="p.granted" @update:val="markDirty(role)"></ToggleSwitch>
                                    </td>
                                    <td>{{ getPermissionDescription(p.id) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <form @submit="addRole">
                <div class="form-group">
                    <label>{{ $t("Input a name for a new role") }}:</label>
                    <input
                        type="text"
                        name="role-name"
                        v-model="roleToCreate"
                        :disabled="busy"
                        maxlength="80"
                        class="form-control form-control-full-width"
                    />
                    <div class="form-error" v-if="errorRole">{{ errorRole }}</div>
                </div>
                <div class="form-group">
                    <button type="submit" :disabled="busy || !roleToCreate" class="btn btn-primary">
                        <i class="fas fa-plus"></i> {{ $t("Add role") }}
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
import ToggleSwitch from "@/components/utils/ToggleSwitch.vue";

type GlobalRoleExtended = GlobalRole & { editing: boolean; dirty: boolean };

export default defineComponent({
    components: {
        ComponentLoader,
        ToggleSwitch,
    },
    name: "RolesPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,

            roles: [] as GlobalRoleExtended[],

            roleToCreate: "",
            errorRole: "",

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

        startEdit: function (role: GlobalRoleExtended) {
            role.editing = true;
        },

        markDirty: function (role: GlobalRoleExtended) {
            role.dirty = true;
        },

        finishEdit: function (role: GlobalRoleExtended) {
            if (!role.dirty) {
                role.editing = false;
                return;
            }

            if (this.busy) {
                return;
            }

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiRolesAdmin.ModifyRole(role.id || "-", { permissions: role.permissions.slice() }))
                .onSuccess(() => {
                    this.busy = false;
                    role.dirty = false;
                    role.editing = false;
                    this.$showSnackBar(this.$t("Role successfully modified!"));
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        badRequest: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Bad request"));
                        },
                        forbidden: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Access denied"));
                            AuthController.CheckAuthStatus();
                        },
                        notFound: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Role not found"));
                            this.load();
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
                    this.busy = false;
                    this.$showMessageModal(this.$t("Error"), err.message);
                });
        },

        deleteRole: function (role: GlobalRoleExtended) {
            this.$askUserConfirmation({
                title: this.$t("Delete role"),
                message: this.$t("Do you want to delete the role $ROLE?").replace("$ROLE", role.id),
                danger: true,
                callback: () => {
                    this.doDeleteRole(role);
                },
            });
        },

        doDeleteRole: function (role: GlobalRoleExtended) {
            if (this.busy) {
                return;
            }

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiRolesAdmin.DeleteRole(role.id))
                .onSuccess(() => {
                    this.busy = false;
                    this.$showSnackBar(this.$t("Role successfully deleted!"));
                    this.load();
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        badRequest: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Bad request"));
                        },
                        forbidden: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Access denied"));
                            AuthController.CheckAuthStatus();
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
                    this.busy = false;
                    this.$showMessageModal(this.$t("Error"), err.message);
                });
        },

        addRole: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            if (this.busy) {
                return;
            }

            this.error = "";
            this.errorRole = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiRolesAdmin.CreateRole({ id: this.roleToCreate, permissions: [] }))
                .onSuccess(() => {
                    this.busy = false;
                    this.roleToCreate = "";
                    this.$showSnackBar(this.$t("Role successfully created") + ": " + this.roleToCreate);
                    this.load();
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        badRequestDuplicated: () => {
                            this.errorRole = this.$t("The role identifier already exists in the list of roles");
                        },
                        badRequestInvalidId: () => {
                            this.errorRole = this.$t(
                                "The role identifier must be lowercase and made only of letters, digits or underscores",
                            );
                        },
                        badRequest: () => {
                            this.error = this.$t("Bad request");
                        },
                        forbidden: () => {
                            this.$showMessageModal(this.$t("Error"), this.$t("Access denied"));
                            AuthController.CheckAuthStatus();
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

        getPermissionDescription: function (p: string) {
            switch (p) {
                case "admin.users.manage":
                    return this.$t("Grants the ability to fully manage users");
                case "admin.roles":
                    return this.$t("Grants the ability to modify roles and permissions");
                case "mod.users":
                    return this.$t("Grants the ability to find users in the platform for moderation or administration tasks");
                case "mod.ban":
                    return this.$t("Grants the ability to ban users");
                case "mod.immune":
                    return this.$t("Grants immunity to moderation punishments");
                default:
                    return this.$t("Undocumented permission");
            }
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

.role-buttons {
    padding-left: 0.5rem;
    padding-top: 0.5rem;
}

.role-buttons button {
    margin-bottom: 0.5rem;
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

.role-body {
    padding-top: 0.5rem;
}
</style>
