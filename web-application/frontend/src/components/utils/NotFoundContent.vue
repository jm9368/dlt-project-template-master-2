<template>
    <div class="content-inner" tabindex="-1">
        <h2>{{ $t("Not found") }}</h2>
        <p>{{ $t("The page you are looking for was not found.") }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    components: {},
    name: "NotFoundPage",
});
</script>

<style></style>
