<template>
    <ModalDialogContainer ref="modalContainer" v-model:display="displayStatus">
        <div class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">{{ $t("Select your language") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>{{ $t("Select your language") }}:</label>
                    <select class="form-control form-select form-control-full-width" v-model="lang" @change="changeLocale">
                        <option v-for="l in languages" :key="l.id" :value="l.id">{{ l.name }}</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="close"><i class="fas fa-check"></i> {{ $t("Done") }}</button>
            </div>
        </div>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "@/utils/v-model";
import { AVAILABLE_LANGUAGES } from "@/i18n";
import { getLanguage, setLanguage } from "@/i18n";

export default defineComponent({
    name: "ChangeLanguageModal",
    emits: ["update:display"],
    props: {
        display: Boolean,
    },
    setup(props) {
        return {
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

        changeLocale: function () {
            setLanguage(this.lang);
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
