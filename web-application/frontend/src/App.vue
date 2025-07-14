<template>
    <MainLayout></MainLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MainLayout from "@/components/layout/MainLayout.vue";
import { EVENT_NAME_LOADED_LOCALE, i18nData } from "./i18n";

export default defineComponent({
    name: "App",
    components: {
        MainLayout,
    },
    data: function () {
        return {};
    },
    methods: {
        onLoadedLocale: function (locale: string) {
            this.$updateLocale(locale);
        },
    },
    mounted: function () {
        this.$listenOnAppEvent(EVENT_NAME_LOADED_LOCALE, this.onLoadedLocale.bind(this));

        if (i18nData.locale) {
            this.$updateLocale(i18nData.locale);
        }
    },
});
</script>

<style>
/* Common style */

@import "@/style/main.css";

@import "@/style/theme.css";

@import "@/style/forms.css";

@import "@/style/tables.css";

@import "@/style/modals.css";

@import "@/style/scroll-bar.css";

/* Layout */

@import "@/style/layout/main-layout.css";

@import "@/style/layout/loader.css";

@import "@/style/layout/top-bar.css";

@import "@/style/layout/account-menu.css";

@import "@/style/layout/page.css";

@import "@/style/layout/side-bar.css";

@import "@/style/layout/snack-bar.css";
</style>
