<template>
    <div class="page-content" tabindex="-1">
        <VerticalMenuPageLayout
            :title="$t('Account settings')"
            v-model:current="current"
            :groups="[
                {
                    id: 'g-profile',
                    name: $t('Account'),
                    options: [
                        {
                            id: 'profile',
                            name: $t('Edit profile'),
                            icon: 'fas fa-user',
                        },
                        {
                            id: 'username',
                            name: $t('Change username'),
                            icon: 'fas fa-user-tag',
                        },
                        {
                            id: 'language',
                            name: $t('Select language'),
                            icon: 'fas fa-language',
                        },
                    ],
                },
                {
                    id: 'g-security',
                    name: $t('Security'),
                    options: [
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
                        {
                            id: 'devices',
                            name: $t('Active sessions'),
                            icon: 'fas fa-desktop',
                        },
                    ],
                },
                {
                    id: 'g-wallets',
                    name: $t('Wallets'),
                    options: [
                        {
                            id: 'wallets',
                            name: $t('My wallets'),
                            icon: 'fas fa-wallet',
                        },
                        {
                            id: 'create-wallet',
                            name: $t('Create wallet'),
                            icon: 'fas fa-plus',
                        },
                    ],
                },
                {
                    id: 'g-danger',
                    name: $t('Danger zone'),
                    options: [
                        {
                            id: 'delete-account',
                            name: $t('Delete account'),
                            icon: 'fas fa-trash-alt',
                        },
                    ],
                },
            ]"
        >
            <EditProfilePage v-if="current === 'profile'"></EditProfilePage>
            <ChangeUsernamePage v-else-if="current === 'username'"></ChangeUsernamePage>
            <ChangeLanguagePage v-else-if="current === 'language'"></ChangeLanguagePage>
            <ChangeEmailPage v-else-if="current === 'email'"></ChangeEmailPage>
            <ChangePasswordPage v-else-if="current === 'password'"></ChangePasswordPage>
            <TwoFactorAuthenticationPage v-else-if="current === 'tfa'"></TwoFactorAuthenticationPage>
            <ActiveSessionsPage v-else-if="current === 'devices'"></ActiveSessionsPage>
            <WalletsListPage v-else-if="current === 'wallets'"></WalletsListPage>
            <CreateWalletPage v-else-if="current === 'create-wallet'"></CreateWalletPage>
            <DeleteAccountPage v-else-if="current === 'delete-account'"></DeleteAccountPage>
            <NotFoundContent v-else></NotFoundContent>
        </VerticalMenuPageLayout>
    </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import VerticalMenuPageLayout from "@/components/layout/VerticalMenuPageLayout.vue";
import NotFoundContent from "@/components/utils/NotFoundContent.vue";
import ComponentLoader from "@/components/utils/ComponentLoader.vue";

const EditProfilePage = defineAsyncComponent({
    loader: () => import("./EditProfilePage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangeUsernamePage = defineAsyncComponent({
    loader: () => import("./ChangeUsernamePage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangeLanguagePage = defineAsyncComponent({
    loader: () => import("./ChangeLanguagePage.vue"),
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

const TwoFactorAuthenticationPage = defineAsyncComponent({
    loader: () => import("./TwoFactorAuthenticationPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ActiveSessionsPage = defineAsyncComponent({
    loader: () => import("./ActiveSessionsPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const WalletsListPage = defineAsyncComponent({
    loader: () => import("./WalletsListPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const CreateWalletPage = defineAsyncComponent({
    loader: () => import("./CreateWalletPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const DeleteAccountPage = defineAsyncComponent({
    loader: () => import("./DeleteAccountPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

export default defineComponent({
    components: {
        VerticalMenuPageLayout,
        NotFoundContent,
        EditProfilePage,
        ChangeUsernamePage,
        ChangeLanguagePage,
        ChangeEmailPage,
        ChangePasswordPage,
        TwoFactorAuthenticationPage,
        ActiveSessionsPage,
        WalletsListPage,
        CreateWalletPage,
        DeleteAccountPage,
    },
    name: "AccountSettingsPage",
    data: function () {
        return {
            current: (this.$route.query.tab || "profile") + "",
        };
    },
    methods: {},
    mounted: function () {
        this.$setSubTitle(this.$t("Account settings"));
    },
    beforeUnmount: function () {},
    watch: {
        $route: function () {
            this.current = (this.$route.query.tab || "profile") + "";
        },
    },
});
</script>

<style></style>
