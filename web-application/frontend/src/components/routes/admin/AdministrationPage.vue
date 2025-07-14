<template>
    <div class="page-content" tabindex="-1">
        <VerticalMenuPageLayout
            :title="$t('Administration and moderation')"
            v-model:current="current"
            :groups="[
                {
                    id: 'g-users',
                    disabled: !canUsers,
                    name: $t('Users'),
                    options: [
                        {
                            id: 'users',
                            name: $t('Find users'),
                            icon: 'fas fa-users',
                        },
                    ],
                },
                {
                    id: 'g-roles',
                    name: $t('Roles and permissions'),
                    disabled: !canRoles,
                    options: [
                        {
                            id: 'roles',
                            name: $t('Roles'),
                            icon: 'fas fa-user-gear',
                        },
                    ],
                },
            ]"
        >
            <UsersPage v-if="current === 'users'"></UsersPage>
            <RolesPage v-else-if="current === 'roles'"></RolesPage>
            <NotFoundContent v-else></NotFoundContent>
        </VerticalMenuPageLayout>
    </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import VerticalMenuPageLayout from "@/components/layout/VerticalMenuPageLayout.vue";
import NotFoundContent from "@/components/utils/NotFoundContent.vue";
import { AuthController } from "@/control/auth";
import { HOME_ROUTE } from "@/app-events-plugin";
import ComponentLoader from "@/components/utils/ComponentLoader.vue";

const UsersPage = defineAsyncComponent({
    loader: () => import("./UsersPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const RolesPage = defineAsyncComponent({
    loader: () => import("./RolesPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const REQUIRED_PERMISSIONS = ["mod.users", "admin.roles"];

export default defineComponent({
    components: {
        VerticalMenuPageLayout,
        NotFoundContent,
        UsersPage,
        RolesPage,
    },
    name: "AdministrationPage",
    data: function () {
        return {
            current: (this.$route.query.tab || "users") + "",

            canUsers: AuthController.hasPermission("mod.users"),
            canRoles: AuthController.hasPermission("admin.roles"),
        };
    },
    methods: {
        checkPermission: function () {
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
                return;
            }

            for (const p of REQUIRED_PERMISSIONS) {
                if (AuthController.hasPermission(p)) {
                    return;
                }
            }

            // Not enough permissions
            this.$showMessageModal(this.$t("Access denied"), this.$t("You lack the required permission to visit this page"));
            this.$router.push({ name: HOME_ROUTE });
        },

        onAuthChanged: function () {
            this.canUsers = AuthController.hasPermission("mod.users");
            this.canRoles = AuthController.hasPermission("admin.roles");
        },
    },
    mounted: function () {
        this.$setSubTitle(this.$t("Administration and moderation"));
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));
        this.checkPermission();
    },
    beforeUnmount: function () {},
    watch: {
        $route: function () {
            this.current = (this.$route.query.tab || "users") + "";
        },
    },
});
</script>

<style></style>
