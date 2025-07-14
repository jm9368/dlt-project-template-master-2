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
            <div class="modal-header-user-settings-dd">
                <div class="user-settings-dd-image">
                    <img v-if="profileImage" class="usr-image" :src="profileImage" />
                    <img v-else class="usr-image" src="@/assets/user.png" />
                </div>
                <div class="user-settings-dd-names">
                    <div class="user-settings-dd-name">
                        {{ profileName || username }}
                    </div>
                    <div class="user-settings-dd-username">@{{ username }}</div>
                </div>
            </div>

            <div class="modal-body no-padding border-top">
                <div class="settings-list">
                    <RouterLink class="settings-list-item" :to="{ name: 'profile', params: { username: '@' + username } }" @click="close">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("My profile") }}
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div class="modal-body no-padding border-top">
                <div class="settings-list">
                    <div class="settings-list-item" tabindex="0" @keydown="clickOnEnter" @click="openSelectLanguage">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-language"></i>
                        </div>
                        <div class="settings-list-item-caption">{{ $t("Language") }}: {{ renderLanguage(lang, languages) }}</div>
                        <div class="settings-list-item-arrow">
                            <i class="fas fa-angle-right"></i>
                        </div>
                    </div>

                    <div class="settings-list-item" tabindex="0" @keydown="clickOnEnter" @click="openSelectTheme">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-sun" v-if="!isDarkTheme"></i>
                            <i class="fas fa-moon" v-if="isDarkTheme"></i>
                        </div>
                        <div class="settings-list-item-caption">{{ $t("Theme") }}: {{ renderTheme(isDarkTheme) }}</div>
                        <div class="settings-list-item-arrow">
                            <i class="fas fa-angle-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-body no-padding border-top">
                <div class="settings-list">
                    <RouterLink :to="{ name: 'account-settings' }" class="settings-list-item" @click="close">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("Account settings") }}
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div class="modal-body no-padding border-top">
                <div class="settings-list">
                    <div
                        v-if="wallets.length > 0"
                        class="settings-list-item"
                        tabindex="0"
                        @keydown="clickOnEnter"
                        @click="openSelectWallet"
                    >
                        <div class="settings-list-item-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="settings-list-item-caption">{{ $t("Wallet") }}: {{ walletName }}</div>
                        <div class="settings-list-item-arrow">
                            <i class="fas fa-angle-right"></i>
                        </div>
                    </div>
                    <RouterLink
                        v-if="wallets.length === 0"
                        :to="{ name: 'account-settings', query: { tab: 'wallets' } }"
                        class="settings-list-item"
                        @click="close"
                    >
                        <div class="settings-list-item-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("My wallets") }}
                        </div>
                    </RouterLink>
                    <div
                        v-if="walletId && walletAddress"
                        class="settings-list-item"
                        tabindex="0"
                        @keydown="clickOnEnter"
                        @click="copyAddress(walletAddress)"
                    >
                        <div class="settings-list-item-icon">
                            <i class="fas fa-clone"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("Copy wallet address") }}
                        </div>
                    </div>
                    <RouterLink
                        v-if="walletId && walletAddress"
                        :to="{ name: 'wallet', params: { id: walletId } }"
                        class="settings-list-item"
                        @click="close"
                    >
                        <div class="settings-list-item-icon">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("Manage wallet") }}
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div class="modal-body no-padding border-top" v-if="canAdmin">
                <div class="settings-list">
                    <RouterLink :to="{ name: 'admin' }" class="settings-list-item" @click="close">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-hammer"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("Administration and moderation") }}
                        </div>
                    </RouterLink>
                </div>
            </div>

            <div class="modal-body no-padding border-top">
                <div class="settings-list">
                    <div class="settings-list-item" tabindex="0" @keydown="clickOnEnter" @click="logout">
                        <div class="settings-list-item-icon">
                            <i class="fas fa-sign-out"></i>
                        </div>
                        <div class="settings-list-item-caption">
                            {{ $t("Log out") }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AuthController } from "@/control/auth";
import { defineComponent, nextTick } from "vue";
import { useVModel } from "@/utils/v-model";
import { FocusTrap } from "@/utils/focus-trap";
import { AVAILABLE_LANGUAGES } from "@/i18n";
import { getLanguage } from "@/i18n";
import { WalletsController } from "@/control/wallets";
import { getTheme } from "@/control/app-preferences";

const REQUIRED_ADMIN_PERMISSIONS = ["mod.users", "admin.roles"];

export default defineComponent({
    name: "AccountSettingsDropdown",
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
            profileName: AuthController.ProfileName,
            profileImage: AuthController.ProfileImage,
            username: AuthController.Username,
            tfa: AuthController.RequiresTwoFactorAuthentication,
            languages: AVAILABLE_LANGUAGES.map((l) => {
                return { id: l.id, name: l.name };
            }),
            lang: getLanguage(),
            isDarkTheme: getTheme() === "dark",

            walletId: WalletsController.CurrentWalletId,
            walletName: WalletsController.CurrentWalletName,
            walletAddress: WalletsController.CurrentWalletAddress,
            wallets: WalletsController.GetWallets(),

            canAdmin: REQUIRED_ADMIN_PERMISSIONS.filter((p) => AuthController.hasPermission(p)).length > 0,
        };
    },
    methods: {
        open: function () {
            this.displayStatus = true;
            this.lang = getLanguage();
            this.isDarkTheme = getTheme() === "dark";
        },

        close: function () {
            this.displayStatus = false;
        },

        escapeToClose: function (event) {
            if (event.key === "Escape") {
                this.close();
            }
        },

        logout: function () {
            this.$emit("openModal", "logout");
        },

        stopPropagationEvent: function (e) {
            e.stopPropagation();
        },

        onAuthChanged: function () {
            this.username = AuthController.Username;
            this.tfa = AuthController.RequiresTwoFactorAuthentication;
            this.profileImage = AuthController.ProfileImage;
            this.profileName = AuthController.ProfileName;
            this.canAdmin = REQUIRED_ADMIN_PERMISSIONS.filter((p) => AuthController.hasPermission(p)).length > 0;
        },

        clickOnEnter: function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                event.target.click();
            }
        },

        renderLanguage: function (lang, languages) {
            for (const l of languages) {
                if (l.id === lang) {
                    return l.name;
                }
            }
            return "-";
        },

        openSelectLanguage: function () {
            this.close();
            this.$emit("openModal", "change-language");
        },

        renderTheme: function (isDark) {
            if (isDark) {
                return this.$t("Dark");
            } else {
                return this.$t("Light");
            }
        },

        openSelectTheme: function () {
            this.close();
            this.$emit("openModal", "change-theme");
        },

        openSelectWallet: function () {
            this.close();
            this.$emit("openModal", "select-wallet");
        },

        onCurrentWalletChanged: function () {
            this.walletId = WalletsController.CurrentWalletId;
            this.walletName = WalletsController.CurrentWalletName;
            this.walletAddress = WalletsController.CurrentWalletAddress;
        },

        onWalletListChanged: function () {
            this.wallets = WalletsController.GetWallets();
        },

        copyAddress: function (addr: string) {
            navigator.clipboard.writeText(addr);
            this.$showSnackBar(this.$t("Address copied to clipboard!"));
        },
    },
    mounted: function () {
        this.focusTrap = new FocusTrap(this.$el, this.close.bind(this), "top-bar-button-img");
        this.$listenOnAppEvent("current-wallet-changed", this.onCurrentWalletChanged.bind(this));
        this.$listenOnAppEvent("wallet-list-changed", this.onWalletListChanged.bind(this));

        if (this.display) {
            this.onAuthChanged();
            this.focusTrap.activate();
            nextTick(() => {
                this.$el.focus();
            });
        }
    },
    beforeUnmount: function () {
        this.focusTrap.destroy();
    },
    watch: {
        display: function () {
            if (this.display) {
                this.onAuthChanged();
                this.focusTrap.activate();
                nextTick(() => {
                    this.$el.focus();
                });
            } else {
                this.focusTrap.deactivate();
            }
        },
    },
});
</script>

<style scoped>
.modal-header-user-settings-dd {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.75rem;
}

.user-settings-dd-image {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.user-settings-dd-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    background-color: var(--user-profile-image-background);
}

.user-settings-dd-names {
    display: flex;
    flex-direction: column;
    padding-left: 12px;
    width: calc(100% - 48px);
}

.user-settings-dd-username {
    padding: 0.25rem;
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-settings-dd-name {
    padding: 0.25rem;
    font-size: large;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
