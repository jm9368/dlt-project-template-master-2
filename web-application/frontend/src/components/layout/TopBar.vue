<template>
    <div class="top-bar" tabindex="-1">
        <div class="top-bar-logo-td">
            <button type="button" class="top-bar-button" :title="$t('Main menu')" @click="clickMenu">
                <i class="fas fa-bars"></i>
            </button>
            <span class="top-bar-title">{{ platformName }}</span>
            <span class="top-bar-title-min">{{ platformName }}</span>
        </div>

        <div class="top-bar-user-td" v-if="loggedIn">
            <span class="top-bar-hello-message">{{ $t("Hello, $USER!").replace("$USER", renderName(profileName)) }}</span>
            <button type="button" class="top-bar-button-img" :title="$t('User settings')" @click="openUserSettings">
                <img v-if="profileImage" class="btn-image" :src="profileImage" />
                <img v-else class="btn-image" src="@/assets/user.png" />
            </button>
        </div>

        <div class="top-bar-user-td" v-if="!loggedIn">
            <button type="button" class="top-bar-button" :title="$t('Select your language')" @click="selectLanguage">
                <i class="fas fa-language"></i>
            </button>
            <button type="button" class="top-bar-button" :title="$t('Change theme')" @click="invertTheme">
                <i v-if="theme === 'dark'" class="fas fa-sun"></i>
                <i v-else class="fas fa-moon"></i>
            </button>
            <button type="button" @click="login" class="btn btn-primary btn-top-bar-login">
                <i class="fas fa-sign-in"></i> {{ $t("Login") }}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { ColorThemeName, getTheme, setTheme } from "@/control/app-preferences";
import { AuthController } from "@/control/auth";
import { defineComponent } from "vue";

export default defineComponent({
    components: {},
    name: "TopBar",
    emits: ["toggle-menu", "openModal"],
    data: function () {
        return {
            platformName: import.meta.env.VITE__PLATFORM_NAME || "Platform",
            loggedIn: AuthController.isAuthenticated(),
            profileImage: AuthController.ProfileImage,
            theme: getTheme(),
            profileName: AuthController.ProfileName || AuthController.Username || "",
        };
    },
    methods: {
        openUserSettings: function () {
            this.$emit("openModal", "account-settings");
        },

        selectLanguage: function () {
            this.$emit("openModal", "change-language-modal");
        },

        invertTheme: function () {
            setTheme(this.theme === "dark" ? "light" : "dark");
        },

        login: function () {
            this.$requireLogin();
        },

        clickMenu: function () {
            this.$emit("toggle-menu");
        },

        onAuthChanged: function () {
            this.loggedIn = AuthController.isAuthenticated();
            this.profileName = AuthController.ProfileName || AuthController.Username || "";
            this.profileImage = AuthController.ProfileImage;
        },

        onThemeChanged: function (t: ColorThemeName) {
            this.theme = t;
        },

        renderName: function (name: string): string {
            return ((name + "").split(" ")[0] + "").split(",")[0] || "???";
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));
        this.$listenOnAppEvent("theme-changed", this.onThemeChanged.bind(this));
    },
    beforeUnmount: function () {},
});
</script>

<style></style>
