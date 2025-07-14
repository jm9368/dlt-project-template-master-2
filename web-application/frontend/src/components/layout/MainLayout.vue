<template>
    <div
        class="main-layout"
        :class="{
            'sidebar-hidden': !sidebarExpanded,
            'sidebar-non-sticky': !sidebarSticky,
            'dark-theme': isDarkTheme,
            'light-theme': !isDarkTheme,
        }"
    >
        <a href="#" @click="skipMainContent" class="skip-main-content">
            <span>{{ $t("Skip to main content") }}</span>
        </a>
        <TopBar @toggle-menu="toggleMenu" @openModal="openModal"></TopBar>
        <MenuSideBar v-model:expanded="sidebarExpanded"></MenuSideBar>
        <div v-if="sidebarExpanded" class="side-bar-overlay" @click="closeSideBar"></div>
        <AuthLoadingOverlay :display="loadingAuth"></AuthLoadingOverlay>
        <router-view v-if="!loadingAuth"></router-view>
        <LoadingOverlay v-if="loadingRoute"></LoadingOverlay>

        <AccountSettingsDropdown
            v-if="displayDropdownAccountSettings"
            v-model:display="displayDropdownAccountSettings"
            @openModal="openModal"
        ></AccountSettingsDropdown>

        <ChangeLanguageDropdown
            v-if="displayDropdownLanguage"
            v-model:display="displayDropdownLanguage"
            @openModal="openModal"
        ></ChangeLanguageDropdown>

        <ChangeLanguageModal v-if="displayModalLanguage" v-model:display="displayModalLanguage"></ChangeLanguageModal>

        <ChangeThemeDropdown
            v-if="displayDropdownTheme"
            v-model:display="displayDropdownTheme"
            @openModal="openModal"
        ></ChangeThemeDropdown>

        <SelectWalletDropdown
            v-if="displayDropdownSelectWallet"
            v-model:display="displayDropdownSelectWallet"
            @openModal="openModal"
        ></SelectWalletDropdown>

        <ProfileModal v-if="displayProfileModal" v-model:display="displayProfileModal" :uid="profileModalUser"></ProfileModal>

        <LogoutModal v-if="displayModalLogout" v-model:display="displayModalLogout"></LogoutModal>

        <MessageModal
            v-if="displayModalMessage"
            v-model:display="displayModalMessage"
            :title="messageModalTitle"
            :message="messageModalMessage"
        ></MessageModal>

        <ConfirmationModal
            v-if="displayConfirmationModal"
            v-model:display="displayConfirmationModal"
            :title="confirmationTitle"
            :message="confirmationMessage"
            :danger="confirmationDanger"
            @confirm="onConfirm"
        >
        </ConfirmationModal>

        <CookiesModal v-if="displayModalCookies" v-model:display="displayModalCookies"></CookiesModal>

        <SnackBar></SnackBar>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TopBar from "@/components/layout/TopBar.vue";
import MenuSideBar from "@/components/layout/MenuSideBar.vue";
import LoadingOverlay from "@/components/layout/LoadingOverlay.vue";
import AuthLoadingOverlay from "@/components/layout/AuthLoadingOverlay.vue";
import SnackBar from "@/components/layout/SnackBar.vue";

import LogoutModal from "@/components/modals/auth/LogoutModal.vue";

import AccountSettingsDropdown from "@/components/dropdowns/account/AccountSettingsDropdown.vue";

import ChangeLanguageDropdown from "@/components/dropdowns/account/ChangeLanguageDropdown.vue";
import ChangeThemeDropdown from "@/components/dropdowns/account/ChangeThemeDropdown.vue";

import SelectWalletDropdown from "@/components/dropdowns/wallet/SelectWalletDropdown.vue";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";

import ProfileModal from "@/components/modals/ProfileModal.vue";

import MessageModal from "@/components/modals/MessageModal.vue";

import ConfirmationModal from "@/components/modals/ConfirmationModal.vue";

import CookiesModal from "@/components/modals/CookiesModal.vue";

import { AuthController } from "@/control/auth";
import { getCookiePreference, getTheme } from "@/control/app-preferences";

export default defineComponent({
    components: {
        TopBar,
        MenuSideBar,
        LoadingOverlay,
        AuthLoadingOverlay,
        SnackBar,
        LogoutModal,
        AccountSettingsDropdown,
        ChangeLanguageDropdown,
        ChangeThemeDropdown,
        MessageModal,
        SelectWalletDropdown,
        ChangeLanguageModal,
        ConfirmationModal,
        ProfileModal,
        CookiesModal,
    },
    name: "MainLayout",
    setup: function () {
        return {
            confirmationCallback: null,
            resizeObserver: null as ResizeObserver,
        };
    },
    data: function () {
        return {
            loadingRoute: false,

            sidebarExpanded: window.innerWidth >= 1000,
            sidebarSticky: true,

            isDarkTheme: false,
            loadingAuth: AuthController.Loading && !AuthController.FirstTimeLoaded,

            displayModalLogout: false,
            displayDropdownAccountSettings: false,

            displayDropdownTheme: false,

            displayDropdownLanguage: false,

            displayDropdownSelectWallet: false,

            displayModalLanguage: false,

            displayModalMessage: false,
            messageModalTitle: "",
            messageModalMessage: "",

            displayConfirmationModal: false,
            confirmationTitle: "",
            confirmationMessage: "",
            confirmationDanger: false,

            displayProfileModal: false,
            profileModalUser: "",

            displayModalCookies: false,
        };
    },
    methods: {
        onAuthStatusUpdate: function () {
            this.displayDropdownAccountSettings = false;

            this.displayModalLogout = false;

            this.displayDropdownLanguage = false;
            this.displayModalLanguage = false;

            this.displayDropdownTheme = false;

            this.displayDropdownSelectWallet = false;
        },

        closeSideBar: function () {
            this.sidebarExpanded = false;
        },

        onAuthLoadingChanged: function () {
            this.loadingAuth = AuthController.Loading && !AuthController.FirstTimeLoaded;
        },

        onThemeChanged: function () {
            this.isDarkTheme = getTheme() === "dark";
        },

        toggleMenu: function () {
            this.sidebarExpanded = !this.sidebarExpanded;
        },

        skipMainContent: function (event) {
            if (event) {
                event.preventDefault();
            }
            const content: any = document.querySelector(".page-content");
            if (content) {
                content.focus();
            }
        },

        showMessage: function (title: string, msg: string) {
            this.messageModalTitle = title;
            this.messageModalMessage = msg;
            this.displayModalMessage = true;
        },

        openModal: function (name: string) {
            switch (name) {
                case "account-settings":
                    this.displayDropdownAccountSettings = !this.displayDropdownAccountSettings;
                    break;
                case "change-language":
                    this.displayDropdownLanguage = true;
                    break;
                case "change-language-modal":
                    this.displayModalLanguage = true;
                    break;
                case "change-theme":
                    this.displayDropdownTheme = true;
                    break;
                case "logout":
                    this.displayModalLogout = true;
                    break;
                case "select-wallet":
                    this.displayDropdownSelectWallet = true;
                    break;
            }
        },

        onRouterLoading: function (l: boolean) {
            this.loadingRoute = l;
        },

        onRouteChanged: function () {
            if (this.$route && this.$route.meta && typeof this.$route.meta === "object") {
                this.sidebarSticky = !!this.$route.meta.sidebarSticky;
                if (this.sidebarSticky) {
                    this.sidebarExpanded = window.innerWidth >= 1000;
                } else {
                    this.sidebarExpanded = false;
                }
            } else {
                this.sidebarExpanded = false;
                this.sidebarSticky = false;
            }

            const cookiePref = getCookiePreference();

            if (!cookiePref && (!this.$route || !(this.$route.name in { terms: 1, privacy: 1, cookies: 1 }))) {
                this.displayModalCookies = true;
            } else {
                this.displayModalCookies = false;
            }
        },

        showConfirmationModal: function (options: { title: string; message: string; danger?: boolean; callback: () => void }) {
            this.displayConfirmationModal = true;
            this.confirmationTitle = options.title;
            this.confirmationMessage = options.message;
            this.confirmationDanger = !!options.danger;
            this.confirmationCallback = options.callback;
        },

        onConfirm: function () {
            if (this.confirmationCallback) {
                this.confirmationCallback();
            }
        },

        onShowProfile: function (uid: string) {
            this.profileModalUser = uid;
            this.displayProfileModal = true;
        },

        onPageResize: function () {
            this.sidebarExpanded = window.innerWidth >= 1000;
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthStatusUpdate.bind(this));

        this.$listenOnAppEvent("auth-status-loading", this.onAuthLoadingChanged.bind(this));

        this.$listenOnAppEvent("theme-changed", this.onThemeChanged.bind(this));
        this.onThemeChanged();

        this.$listenOnAppEvent("msg-modal", this.showMessage.bind(this));
        this.$listenOnAppEvent("ask-confirmation", this.showConfirmationModal.bind(this));
        this.$listenOnAppEvent("show-profile", this.onShowProfile.bind(this));

        this.$listenOnAppEvent("router-load-state-change", this.onRouterLoading.bind(this));

        this.onAuthStatusUpdate();

        this.onRouteChanged();

        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.onPageResize.bind(this));
            this.resizeObserver.observe(this.$el);
        }
    },
    watch: {
        $route: function () {
            this.onRouteChanged();
        },
    },
    beforeUnmount: function () {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },
});
</script>

<style></style>
