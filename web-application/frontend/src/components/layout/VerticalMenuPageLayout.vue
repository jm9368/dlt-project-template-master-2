<template>
    <div class="page-vertical-menu-layout">
        <div class="page-vertical-head">
            <h1>{{ title }}</h1>
            <div class="page-vertical-head-menu">
                <button type="button" @click="openMenu" class="btn btn-primary" :title="$t('Menu')">
                    <i class="fas fa-bars no-margin"></i>
                </button>
            </div>
        </div>
        <div class="page-vertical-rest">
            <div class="page-vertical-menu">
                <div v-if="backRoute" class="page-vertical-menu-group">
                    <div class="page-vertical-menu-group-options">
                        <RouterLink :to="backRoute" class="page-vertical-menu-group-option">
                            <i class="fas fa-arrow-left"></i> <span>{{ backTitle }}</span>
                        </RouterLink>
                    </div>
                </div>
                <div
                    v-for="(group, i) in groups"
                    :key="group.id"
                    class="page-vertical-menu-group"
                    :class="{ disabled: !!group.disabled, 'border-top': i > 0 || !!backRoute }"
                >
                    <div class="page-vertical-menu-group-name">{{ group.name }}</div>
                    <div class="page-vertical-menu-group-options">
                        <RouterLink
                            v-for="(o, j) in group.options"
                            :key="o.id"
                            :to="{ name: $route.name, params: $route.params, query: { tab: o.id } }"
                            class="page-vertical-menu-group-option"
                            :class="{ current: current === o.id, disabled: !!o.disabled, 'space-top': j > 0 }"
                        >
                            <i v-if="o.icon" :class="o.icon"></i> <span>{{ o.name }}</span>
                        </RouterLink>
                    </div>
                </div>
            </div>

            <div class="page-content-inner">
                <slot></slot>
            </div>

            <VerticalMenuModal
                v-if="displayMenuModal"
                v-model:display="displayMenuModal"
                :current="current"
                :groups="groups"
                :title="title"
            ></VerticalMenuModal>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import VerticalMenuModal from "@/components/modals/VerticalMenuModal.vue";
import { RouteLocationRaw } from "vue-router";

interface MenuOption {
    id: string;
    name: string;
    icon: string;
    disabled?: boolean;
}

interface MenuOptionGroup {
    id: string;
    name: string;
    options: MenuOption[];
    disabled?: boolean;
}

export default defineComponent({
    components: {
        VerticalMenuModal,
    },
    name: "VerticalMenuPageLayout",
    emits: ["update:current"],
    props: {
        title: String,
        groups: Array as PropType<MenuOptionGroup[]>,
        current: String,
        backRoute: Object as PropType<RouteLocationRaw>,
        backTitle: String,
    },
    data: function () {
        return {
            displayMenuModal: false,
        };
    },
    methods: {
        openMenu: function () {
            this.displayMenuModal = true;
        },
    },
    mounted: function () {},
    beforeUnmount: function () {},
});
</script>

<style>
@import "@/style/layout/page-nav-vertical.css";
</style>
