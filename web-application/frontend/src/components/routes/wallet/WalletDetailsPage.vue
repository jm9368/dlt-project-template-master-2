<template>
    <div class="content-inner" tabindex="-1">
        <div>
            <h2>{{ $t("Wallet details") }}</h2>
            <div class="table-responsive">
                <table class="table">
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Wallet ID") }}:</td>
                        <td>{{ walletId }}</td>
                        <td class="td-shrink text-right"></td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Wallet name") }}:</td>
                        <td>
                            {{ walletName }}
                        </td>
                        <td class="td-shrink text-right"></td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Wallet address") }}:</td>
                        <td>
                            {{ walletAddress }} (<a href="javascript:;" @click="copyAddress(walletAddress)"> {{ $t("Copy") }} </a>)
                        </td>
                        <td class="td-shrink text-right"></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AuthController } from "@/control/auth";

export default defineComponent({
    components: {},
    name: "WalletDetailsPage",
    props: {
        walletId: String,
        walletAddress: String,
        walletName: String,
    },
    methods: {
        onAuthChanged: function () {
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
            }
        },

        copyAddress: function (addr: string) {
            navigator.clipboard.writeText(addr);
            this.$showSnackBar(this.$t("Address copied to clipboard!"));
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));

        if (AuthController.isAuthenticated()) {
            this.$autoFocus();
        } else {
            this.$requireLogin();
        }
    },
});
</script>

<style></style>
