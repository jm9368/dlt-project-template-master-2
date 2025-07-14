<template>
    <div class="page-content" tabindex="-1">
        <h1>{{ $t("Not found") }}</h1>
        <p>{{ $t("The page you are looking for was not found.") }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    components: {},
    name: "NotFoundPage",
    mounted: function () {
        this.$setSubTitle(this.$t("Not found"));
    },
});
</script>

<style></style>
