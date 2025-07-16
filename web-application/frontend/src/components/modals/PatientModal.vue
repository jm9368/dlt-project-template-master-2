<template>
    <ModalDialogContainer ref="modalContainer" :display="display">
        <form @submit.prevent="submit" class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">
                    {{ createMode ? $t("Create patient") : editMode ? $t("Edit patient") : $t("Patient details") }}
                </div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div>
                    <label>{{ $t("Username") }}</label>
                    <input v-model="form.username" :readonly="!editMode && !createMode" required class="form-control" />
                </div>
                <div>
                    <label>{{ $t("Email") }}</label>
                    <input v-model="form.email" :readonly="!editMode && !createMode" required class="form-control" />
                </div>
                <div>
                    <label>{{ $t("Diseases") }}</label>
                    <input v-model="form.enfermedadesString" :readonly="!editMode && !createMode" class="form-control" placeholder="comma,separated" />
                </div>
                <div v-if="createMode || editMode">
                    <label>{{ $t("Password") }}</label>
                    <input v-model="form.password" type="password" :required="createMode" class="form-control" />
                </div>
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
            </div>
            <div class="modal-footer">
                <button v-if="editMode || createMode" type="submit" class="btn btn-primary">{{ $t("Save") }}</button>
                <button type="button" class="btn btn-secondary" @click="close">{{ $t("Close") }}</button>
            </div>
        </form>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiPatientsAdmin } from "@/api/api-group-patients-admin";
import { Request } from "@asanrom/request-browser";

export default defineComponent({
    name: "PatientModal",
    props: {
        display: Boolean,
        patient: Object,
        editMode: Boolean,
        createMode: Boolean,
    },
    emits: ["close", "saved"],
    data() {
        return {
            form: {
                username: "",
                email: "",
                enfermedadesString: "",
                password: "",
            },
            error: "",
        };
    },
    watch: {
        patient: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.form.username = newVal.username || "";
                    this.form.email = newVal.email || "";
                    this.form.enfermedadesString = (newVal.enfermedades || []).join(", ");
                    this.form.password = "";
                }
            },
        },
    },
    methods: {
        close() {
            this.$emit("close");
        },
        stopPropagationEvent(e) {
            e.stopPropagation();
        },
        submit() {
            this.error = "";
            const enfermedades = this.form.enfermedadesString.split(",").map(e => e.trim()).filter(e => e);
            if (this.createMode) {
                Request.Do(ApiPatientsAdmin.PostAdminPatients({
                    username: this.form.username,
                    email: this.form.email,
                    password: this.form.password,
                    enfermedades,
                }))
                    .onSuccess(() => {
                        this.$emit("saved");
                    })
                    .onRequestError((err, handleErr) => {
                        handleErr(err, {
                            badRequest: () => { this.error = "Datos inválidos o ya existentes."; },
                            serverError: () => { this.error = "Error del servidor."; },
                            networkError: () => { this.error = "Error de red."; },
                        });
                    });
            } else if (this.editMode) {
                Request.Do(ApiPatientsAdmin.PostAdminPatientsId(this.patient.id, {
                    username: this.form.username,
                    email: this.form.email,
                    password: this.form.password,
                    enfermedades,
                }))
                    .onSuccess(() => {
                        this.$emit("saved");
                    })
                    .onRequestError((err, handleErr) => {
                        handleErr(err, {
                            badRequest: () => { this.error = "Datos inválidos o ya existentes."; },
                            serverError: () => { this.error = "Error del servidor."; },
                            networkError: () => { this.error = "Error de red."; },
                        });
                    });
            }
        },
    },
});
</script>