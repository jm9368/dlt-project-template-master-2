<template>
    <div
        class="modal-container modal-container-corner no-transition"
        :class="{ hidden: !display }"
        tabindex="-1"
        role="dialog"
        :aria-hidden="!display"
        @click="close"
        @keydown="escapeToClose"
    >
        <div class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">{{ $t("Select a wallet") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="goBack">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body no-padding">
                <div class="settings-list">
                    <div
                        v-for="w in wallets"
                        :key="w.id"
                        class="settings-list-item"
                        tabindex="0"
                        @keydown="clickOnEnter"
                        @click="selectCurrentWallet(w)"
                    >
                        <div class="settings-list-item-icon" :class="{ 'check-invisible': w.id !== current }">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            <div class="select-wallet-name">{{ w.name || "-" }}</div>
                            <div class="select-wallet-addr">{{ w.address }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "@/utils/v-model";
import { FocusTrap } from "@/utils/focus-trap";
import { WalletsController } from "@/control/wallets";
import { WalletInfo } from "@/api/definitions";

export default defineComponent({
    name: "SelectWalletDropdown",
    emits: ["update:display", "openModal"],
    props: {
        display: Boolean,
    },
    setup(props) {
        return {
            focusTrap: null as FocusTrap,
            displayStatus: useVModel(props, "display"),
        };
    },
    data: function () {
        return {
            current: WalletsController.CurrentWalletId,
            wallets: WalletsController.GetWallets(),
        };
    },
    methods: {
        close: function () {
            this.displayStatus = false;
        },

        escapeToClose: function (event) {
            if (event.key === "Escape") {
                this.close();
            }
        },

        stopPropagationEvent: function (e) {
            e.stopPropagation();
        },

        clickOnEnter: function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                event.target.click();
            }
        },

        onCurrentWalletChanged: function () {
            this.current = WalletsController.CurrentWalletId;
        },

        onWalletListChanged: function () {
            this.wallets = WalletsController.GetWallets();
        },

        goBack: function () {
            this.close();
            this.$emit("openModal", "account-settings");
        },

        selectCurrentWallet: function (w: WalletInfo) {
            WalletsController.SetDefaultWallet(w);
            this.goBack();
        },

        renderWalletAddress: function (a: string) {
            return a.substring(0, 8) + "..." + a.substring(a.length - 8);
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("current-wallet-changed", this.onCurrentWalletChanged.bind(this));

        this.$listenOnAppEvent("wallet-list-changed", this.onWalletListChanged.bind(this));

        this.focusTrap = new FocusTrap(this.$el, this.close.bind(this));

        if (this.display) {
            this.focusTrap.activate();
            this.$autoFocus();
        }
    },
    beforeUnmount: function () {
        this.focusTrap.destroy();
    },
    watch: {
        display: function () {
            if (this.display) {
                this.focusTrap.activate();
                this.$autoFocus();
            } else {
                this.focusTrap.deactivate();
            }
        },
    },
});
</script>

<style></style>
