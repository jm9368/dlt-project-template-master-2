<template>
    <div class="loading-overlay auth-loading-overlay" :class="{ hidden: !display }">
        <div class="loading-overlay-loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "AuthLoadingOverlay",
    props: {
        display: Boolean,
    },
});
</script>

<style></style>
