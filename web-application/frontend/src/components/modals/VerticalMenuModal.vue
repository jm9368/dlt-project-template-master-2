<template>
    <ModalDialogContainer ref="modalContainer" v-model:display="displayStatus">
        <div class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">{{ title }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="page-vertical-menu in-modal">
                    <div
                        v-for="(group, i) in groups"
                        :key="group.id"
                        class="page-vertical-menu-group"
                        :class="{ disabled: !!group.disabled, 'border-top': i > 0 }"
                    >
                        <div class="page-vertical-menu-group-name">{{ group.name }}</div>
                        <div class="page-vertical-menu-group-options">
                            <RouterLink
                                v-for="(o, j) in group.options"
                                :key="o.id"
                                :to="{ name: $route.name, params: $route.params, query: { tab: o.id } }"
                                class="page-vertical-menu-group-option"
                                :class="{ current: current === o.id, 'space-top': j > 0 }"
                                @click="close"
                            >
                                <i v-if="o.icon" :class="o.icon"></i> <span>{{ o.name }}</span>
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { useVModel } from "@/utils/v-model";

interface MenuOption {
    id: string;
    name: string;
    icon: string;
}

interface MenuOptionGroup {
    id: string;
    name: string;
    options: MenuOption[];
    disabled?: boolean;
}

export default defineComponent({
    name: "VerticalMenuModal",
    emits: ["update:display", "select-option"],
    props: {
        display: Boolean,
        title: String,
        groups: Array as PropType<MenuOptionGroup[]>,
        current: String,
    },
    setup(props) {
        return {
            displayStatus: useVModel(props, "display"),
        };
    },
    methods: {
        close: function () {
            this.$closeModal();
        },

        escapeToClose: function (event) {
            if (event.key === "Escape") {
                this.close();
            }
        },

        stopPropagationEvent: function (e) {
            e.stopPropagation();
        },
    },
    mounted: function () {
        if (this.display) {
            this.$autoFocus();
        }
    },
    watch: {
        display: function () {
            if (this.display) {
                this.$autoFocus();
            }
        },
    },
});
</script>

<style></style>
