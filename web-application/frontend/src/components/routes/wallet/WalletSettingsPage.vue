<template>
    <div class="page-content" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>
        <div v-else-if="notFound">
            <h1>{{ $t("Wallet not found") }}</h1>
            <p>{{ $t("The wallet you are looking for was not found") }}</p>
            <p>
                <RouterLink :to="{ name: 'account-settings', query: { tab: 'wallets' } }" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> {{ $t("Back to wallets list") }}
                </RouterLink>
            </p>
        </div>
        <VerticalMenuPageLayout
            v-else
            :title="$t('Wallet') + ': ' + walletName"
            v-model:current="current"
            :back-route="{ name: 'account-settings', query: { tab: 'wallets' } }"
            :back-title="$t('Back to wallets list')"
            :groups="[
                {
                    id: 'g-wallet',
                    name: $t('Wallet'),
                    options: [
                        {
                            id: 'details',
                            name: $t('Wallet details'),
                            icon: 'fas fa-wallet',
                        },
                        {
                            id: 'name',
                            name: $t('Change name'),
                            icon: 'fas fa-pencil',
                        },
                    ],
                },
                {
                    id: 'g-security',
                    name: $t('Security'),
                    options: [
                        {
                            id: 'password',
                            name: $t('Change password'),
                            icon: 'fas fa-key',
                        },
                        {
                            id: 'key',
                            name: $t('Export key'),
                            icon: 'fas fa-key',
                        },
                    ],
                },
                {
                    id: 'g-danger',
                    name: $t('Danger zone'),
                    options: [
                        {
                            id: 'delete',
                            name: $t('Delete wallet'),
                            icon: 'fas fa-trash-alt',
                        },
                    ],
                },
            ]"
        >
            <WalletDetailsPage
                v-if="current === 'details'"
                :wallet-id="walletId"
                :wallet-address="walletAddress"
                :wallet-name="walletName"
            ></WalletDetailsPage>
            <RenameWalletPage
                v-else-if="current === 'name'"
                :wallet-id="walletId"
                :old-name="walletName"
                @must-reload="load"
            ></RenameWalletPage>
            <ChangePasswordPage v-else-if="current === 'password'" :wallet-id="walletId"></ChangePasswordPage>
            <ExportKeyPage v-else-if="current === 'key'" :wallet-id="walletId" :wallet-address="walletAddress"></ExportKeyPage>
            <DeleteWalletPage v-else-if="current === 'delete'" :wallet-id="walletId" :wallet-address="walletAddress"></DeleteWalletPage>
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
import { ApiWallet } from "@/api/api-group-wallet";

const WalletDetailsPage = defineAsyncComponent({
    loader: () => import("./WalletDetailsPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const RenameWalletPage = defineAsyncComponent({
    loader: () => import("./RenameWalletPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ChangePasswordPage = defineAsyncComponent({
    loader: () => import("./ChangePasswordPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const ExportKeyPage = defineAsyncComponent({
    loader: () => import("./ExportKeyPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

const DeleteWalletPage = defineAsyncComponent({
    loader: () => import("./DeleteWalletPage.vue"),
    loadingComponent: ComponentLoader,
    delay: 1000,
});

export default defineComponent({
    components: {
        VerticalMenuPageLayout,
        NotFoundContent,
        ComponentLoader,
        WalletDetailsPage,
        RenameWalletPage,
        ChangePasswordPage,
        ExportKeyPage,
        DeleteWalletPage,
    },
    name: "WalletSettingsPage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            walletId: (this.$route.params.id || "") + "",
            walletName: "",
            walletAddress: "",

            loading: true,
            notFound: false,

            current: (this.$route.query.tab || "details") + "",
        };
    },
    methods: {
        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            Request.Pending(this.loadRequestId, ApiWallet.GetWallet(this.walletId))
                .onSuccess((wallet) => {
                    this.loading = false;
                    this.notFound = false;

                    this.walletAddress = wallet.address;
                    this.walletName = wallet.name;

                    this.$setSubTitle(this.walletName + " | " + this.$t("Wallet"));
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
    },
    mounted: function () {
        this.$setSubTitle(this.$t("Wallet"));
        this.load();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);
    },
    watch: {
        $route: function () {
            const newWalletId = (this.$route.params.id || "") + "";
            this.current = (this.$route.query.tab || "details") + "";

            if (newWalletId !== this.walletId) {
                this.walletId = newWalletId;
                this.load();
            }
        },
    },
});
</script>

<style></style>
