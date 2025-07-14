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
                <div class="modal-title">{{ $t("Select your language") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="goBack">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body no-padding">
                <div class="settings-list">
                    <div
                        v-for="l in languages"
                        :key="l.id"
                        class="settings-list-item"
                        tabindex="0"
                        @keydown="clickOnEnter"
                        @click="changeLocale(l.id)"
                    >
                        <div class="settings-list-item-icon" :class="{ 'check-invisible': l.id !== lang }">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="settings-list-item-caption">{{ l.name }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { useVModel } from "@/utils/v-model";
import { FocusTrap } from "@/utils/focus-trap";
import { AVAILABLE_LANGUAGES, getLanguage, setLanguage } from "@/i18n";

export default defineComponent({
    name: "ChangeLanguageDropdown",
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
            languages: AVAILABLE_LANGUAGES.map((l) => {
                return { id: l.id, name: l.name };
            }),
            lang: getLanguage(),
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

        changeLocale: function (l: string) {
            this.lang = l;
            setLanguage(l);
            this.close();
            this.$emit("openModal", "account-settings");
        },

        goBack: function () {
            this.close();
            this.$emit("openModal", "account-settings");
        },
    },
    mounted: function () {
        this.focusTrap = new FocusTrap(this.$el, this.close.bind(this));
        if (this.display) {
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

<style></style>
