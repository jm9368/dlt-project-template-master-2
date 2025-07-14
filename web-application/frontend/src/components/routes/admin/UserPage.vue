<template>
    <div class="page-content" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>
        <div v-else-if="notFound">
            <h1>{{ $t("User not found") }}</h1>
            <p>{{ $t("The user you are looking for was not found") }}</p>
            <p>
                <RouterLink :to="{ name: 'admin', query: { tab: 'users' } }" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> {{ $t("Back to users list") }}
                </RouterLink>
            </p>
        </div>
        <VerticalMenuPageLayout
            v-else
            :title="$t('User') + ': ' + username"
            v-model:current="current"
            :back-route="{ name: 'admin', query: { tab: 'users' } }"
            :back-title="$t('Back to users list')"
            :groups="[
                {
                    id: 'g-user',
                    name: $t('User'),
                    options: [
                        {
                            id: 'details',
                            name: $t('User details'),
                            icon: 'fas fa-user',
                        },
                        {
                            id: 'sessions',
                            name: $t('Active sessions'),
                            icon: 'fas fa-desktop',
                        },
                    ],
                },
                {
                    id: 'g-mod',
                    name: $t('Moderation'),
                    disabled: !canMod || modImmune,
                    options: [
                        {
                            id: 'moderation',
                            name: $t('Moderation'),
                            icon: 'fas fa-hammer',
                        },
                    ],
                },
                {
                    id: 'g-role',
                    name: $t('Role'),
                    disabled: !canRole || uid === userId,
                    options: [
                        {
                            id: 'role',
                            name: $t('Change role'),
                            icon: 'fas fa-user-cog',
                        },
                    ],
                },
                {
                    id: 'g-manage',
                    name: $t('Management'),
                    disabled: !canManage,
                    options: [
                        {
                            id: 'username',
                            name: $t('Change username'),
                            icon: 'fas fa-user-tag',
                        },
                        {
                            id: 'email',
                            name: $t('Change email'),
                            icon: 'fas fa-envelope',
                        },
                        {
                            id: 'password',
                            name: $t('Change password'),
                            icon: 'fas fa-key',
                        },
                        {
                            id: 'tfa',
                            name: $t('Two factor authentication'),
                            icon: 'fas fa-user-lock',
                        },
                    ],
                },
            ]"
        >
            <UserDetailsPage
                v-if="current === 'details'"
                :user-id="userId"
                :username="username"
                :role="role"
                :email="email"
                :verified="verified"
                :locale="locale"
                :banned="banned"
                :tfa="tfa"
                :mod-immune="modImmune"
                :created="created"
            ></UserDetailsPage>
            <UserSessionsPage v-else-if="current === 'sessions'" :sessions="sessions"></UserSessionsPage>
            <UserModerationPage
                v-else-if="current === 'moderation'"
                :user-id="userId"
                :username="username"
                :email="email"
                :locale="locale"
                :banned="banned"
                :created="created"
                @must-reload="load"
            ></UserModerationPage>
            <UserChangeRolePage v-else-if="current === 'role'" :user-id="userId" :role="role" @must-reload="load"></UserChangeRolePage>
            <ChangeUsernamePage
                v-else-if="current === 'username'"
                :user-id="userId"
                :username="username"
                @must-reload="load"
            ></ChangeUsernamePage>
            <ChangeEmailPage v-else-if="current === 'email'" :user-id="userId" :email="email" @must-reload="load"></ChangeEmailPage>
            <ChangePasswordPage v-else-if="current === 'password'" :user-id="userId" @must-reload="load"></ChangePasswordPage>
            <DisableTwoFactorAuthenticationPage
                v-else-if="current === 'tfa'"
                :user-id="userId"
                :tfa="tfa"
                @must-reload="load"
            ></DisableTwoFactorAuthenticationPage>
            <NotFoundContent v-else></NotFoundContent>
        </VerticalMenuPageLayout>
    </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import VerticalMenuPageLayout from "@/components/layout/VerticalMenuPageLayout.vue";
import NotFoundContent from "@/components/utils/NotFoundContent.vue";
import ComponentLoader from "@/components/utils/ComponentLoader.vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { Request } from "@asanrom/request-browser";
import { ApiUsersAdmin } from "@/api/api-group-users-admin";
import { HOME_ROUTE } from "@/app-events-plugin";
import { AuthController } from "@/control/auth";
import { SessionListItem } from "@/api/definitions";

const UserDetailsPage = defineAsyncComponent({
    loader: () => import("./UserDetailsPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const UserSessionsPage = defineAsyncComponent({
    loader: () => import("./UserSessionsPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const UserModerationPage = defineAsyncComponent({
    loader: () => import("./UserModerationPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const UserChangeRolePage = defineAsyncComponent({
    loader: () => import("./UserChangeRolePage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangeUsernamePage = defineAsyncComponent({
    loader: () => import("./ChangeUsernamePage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangeEmailPage = defineAsyncComponent({
    loader: () => import("./ChangeEmailPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangePasswordPage = defineAsyncComponent({
    loader: () => import("./ChangePasswordPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const DisableTwoFactorAuthenticationPage = defineAsyncComponent({
    loader: () => import("./DisableTwoFactorAuthenticationPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

export default defineComponent({
    components: {
        VerticalMenuPageLayout,
        NotFoundContent,
        ComponentLoader,
        UserDetailsPage,
        UserSessionsPage,
        UserModerationPage,
        UserChangeRolePage,
        ChangeUsernamePage,
        ChangeEmailPage,
        ChangePasswordPage,
        DisableTwoFactorAuthenticationPage,
    },
    name: "UserPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            userId: (this.$route.params.id || "") + "",
            role: "",
            username: "",
            email: "",
            verified: false,
            banned: false,
            created: 0,
            modImmune: false,
            tfa: false,
            locale: "",
            sessions: [] as SessionListItem[],

            loading: true,
            notFound: false,

            current: (this.$route.query.tab || "details") + "",

            uid: AuthController.UID,
            canMod: AuthController.hasPermission("mod.ban"),
            canRole: AuthController.hasPermission("admin.roles"),
            canManage: AuthController.hasPermission("admin.users.manage"),
        };
    },
    methods: {
        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            Request.Pending(this.loadRequestId, ApiUsersAdmin.GetUser(this.userId))
                .onSuccess((user) => {
                    this.loading = false;
                    this.notFound = false;

                    this.username = user.username;
                    this.role = user.role;
                    this.email = user.email;
                    this.verified = user.verified;
                    this.banned = user.banned;
                    this.modImmune = user.modImmune;
                    this.tfa = user.tfa;
                    this.locale = user.locale;
                    this.sessions = user.sessions.slice();
                    this.created = user.created;

                    this.$setSubTitle(this.username + " | " + this.$t("Users management"));
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        notFound: () => {
                            this.loading = false;
                            this.notFound = true;
                        },
                        forbidden: () => {
                            this.$showMessageModal(
                                this.$t("Access denied"),
                                this.$t("You lack the required permission to visit this page"),
                            );
                            this.$router.push({ name: HOME_ROUTE });
                        },
                        temporalError: () => {
                            Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    console.error(err);
                    Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                });
        },

        loadPermissions: function () {
            this.uid = AuthController.UID;
            this.canMod = AuthController.hasPermission("mod.ban");
            this.canRole = AuthController.hasPermission("admin.roles");
            this.canManage = AuthController.hasPermission("admin.users.manage");
        },
    },
    mounted: function () {
        this.$setSubTitle(this.$t("Users management"));
        this.load();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);
    },
    watch: {
        $route: function () {
            const newUserId = (this.$route.params.id || "") + "";
            this.current = (this.$route.query.tab || "details") + "";

            if (newUserId !== this.userId) {
                this.userId = newUserId;
                this.load();
            }
        },
    },
});
</script>

<style></style>
