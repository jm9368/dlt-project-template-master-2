<template>
    <div class="content-inner" tabindex="-1">
        <h2>{{ $t("Users") }}</h2>
        <div class="form-group">
            <label>{{ $t("Find user") }}:</label>
            <input
                class="form-control form-control-full-width"
                v-model="filter"
                :placeholder="$t('Filter by identifier, username, email or role (%example_role)') + '...'"
                @input="onFilterChanged"
            />
        </div>
        <div class="form-group">
            <button type="button" class="btn btn-xs btn-primary btn-mr" :disabled="page <= 1" :title="$t('Previous page')" @click="goPrev">
                <i class="fas fa-backward"></i>{{ $t("Prev") }}
            </button>
            <button
                type="button"
                class="btn btn-xs btn-primary btn-mr"
                :disabled="page >= totalPages"
                :title="$t('Next page')"
                @click="goNext"
            >
                <i class="fas fa-forward"></i>{{ $t("Next") }}
            </button>
            <span style="margin-right: 0.5rem; margin-bottom: 0.5rem">{{ $t("Page") }} </span
            ><input
                type="number"
                min="1"
                :max="totalPages"
                step="1"
                v-model.number="page"
                @input="load"
                class="form-control page-input"
            /><span style="margin-left: 0.5rem; margin-bottom: 0.5rem"
                >{{ $t("of") }} {{ totalPages }}. {{ $t("Total") }}: {{ total }} {{ $t("users found") }}.</span
            >
        </div>
        <div class="table-responsive" v-if="!loading">
            <table class="table">
                <thead>
                    <tr>
                        <th>{{ $t("User ID") }}</th>
                        <th>{{ $t("Username") }}</th>
                        <th>{{ $t("Email") }}</th>
                        <th>{{ $t("Role") }}</th>
                        <th>{{ $t("Banned?") }}</th>
                        <th>{{ $t("Creation date") }}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody v-if="loading">
                    <tr>
                        <td colspan="7">{{ $t("Loading") }}...</td>
                    </tr>
                </tbody>
                <tbody v-if="!loading">
                    <tr v-if="users.length === 0">
                        <td colspan="7">{{ $t("Could not find any users with the specified criteria") }}</td>
                    </tr>
                    <tr v-for="user in users" :key="user.id">
                        <td>
                            <router-link :to="{ name: 'admin-user', params: { id: user.id } }">{{ user.id }}</router-link>
                        </td>
                        <td>
                            {{ user.username }}
                        </td>
                        <td>
                            {{ user.email }}
                            <span v-if="user.verified" class="small"> (<i class="fas fa-check icon-margin"></i> {{ $t("Verified") }})</span>
                        </td>
                        <td>
                            {{ user.role || "(" + $t("Default role") + ")" }}
                        </td>
                        <td>
                            {{ user.banned ? $t("Yes") : $t("No") }}
                        </td>
                        <td>{{ renderDate(user.created) }}</td>
                        <td>
                            <router-link :to="{ name: 'admin-user', params: { id: user.id } }" class="btn btn-primary btn-xs"
                                ><i class="fas fa-cog"></i> {{ $t("Manage") }}</router-link
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { Request } from "@asanrom/request-browser";

import { UserAdminListItem } from "@/api/definitions";
import { HOME_ROUTE } from "@/app-events-plugin";
import { renderDateAndTime } from "@/utils/time-utils";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";

const PAGE_SIZE = 25;

export default defineComponent({
    components: {},
    name: "UsersPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            users: [] as UserAdminListItem[],

            filter: "",

            page: 1,
            totalPages: 1,
            total: 0,

            loading: true,
        };
    },
    methods: {
        onFilterChanged: function () {
            Timeouts.Set(this.loadRequestId, 300, () => {
                this.page = 1;
                this.load();
            });
        },

        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            let filter = "";
            let role: string;

            if (this.filter.startsWith("%")) {
                role = this.filter.substring(1).split(" ")[0];
                filter = this.filter.substring(1).split(" ").slice(1).join(" ");
            } else {
                filter = this.filter;
            }

            Request.Pending(this.loadRequestId, ApiUsersAdmin.GetUsers({ page: this.page, q: filter, role: role, pageSize: PAGE_SIZE }))
                .onSuccess((list) => {
                    this.users = list.users;
                    this.page = list.page;
                    this.totalPages = list.totalPages;
                    this.total = list.total;
                    this.loading = false;
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
                    Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                });
        },

        goNext: function () {
            this.page++;
            this.load();
        },

        goPrev: function () {
            this.page--;
            this.load();
        },

        renderDate: function (ts: number) {
            return renderDateAndTime(ts, this.$t);
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
