<template>
    <ModalDialogContainer ref="modalContainer" v-model:display="displayStatus">
        <div class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">{{ $t("Log out") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>{{ $t("Do you want to log out of the application?") }}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" @click="logout">
                    <i class="fas fa-sign-out-alt"></i> {{ $t("Log out") }}
                </button>
            </div>
        </div>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { AuthController } from "@/control/auth";
import { defineComponent } from "vue";
import { useVModel } from "@/utils/v-model";

export default defineComponent({
    name: "LogoutModal",
    emits: ["update:display"],
    props: {
        display: Boolean,
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

        logout: function () {
            this.close();
            const router = this.$router;
            AuthController.Logout().then(() => {
                router.push({ name: "login" });
            });
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
