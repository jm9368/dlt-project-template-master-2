<template>
    <div class="page-content" tabindex="-1">
        <h2>{{ $t("Patients management") }}</h2>
        <button class="btn btn-primary" @click="openCreateModal">
            <i class="fas fa-user-plus"></i> {{ $t("Create patient") }}
        </button>
        <table class="table">
            <thead>
                <tr>
                    <th>{{ $t("ID") }}</th>
                    <th>{{ $t("Username") }}</th>
                    <th>{{ $t("Email") }}</th>
                    <th>{{ $t("Diseases") }}</th>
                    <th>{{ $t("Created") }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="patient in patients" :key="patient.id">
                    <td>{{ patient.id }}</td>
                    <td>{{ patient.username }}</td>
                    <td>{{ patient.email }}</td>
                    <td>{{ patient.enfermedades?.join(', ') }}</td>
                    <td>{{ renderDate(patient.created) }}</td>
                    <td>
                        <button class="btn btn-sm btn-info" @click="openViewModal(patient)">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" @click="openEditModal(patient)">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="openDeleteModal(patient)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Modals -->
        <PatientModal
            v-if="displayModal"
            :patient="selectedPatient"
            :editMode="editMode"
            :createMode="createMode"
            @close="closeModal"
            @saved="onSaved"
        />
        <ConfirmModal
            v-if="displayDeleteModal"
            :message="$t('Are you sure you want to delete this patient?')"
            @confirm="deletePatient"
            @close="displayDeleteModal = false"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiPatientsAdmin } from "@/api/api-group-patients-admin";
import { Request } from "@asanrom/request-browser";
import PatientModal from "@/components/modals/PatientModal.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";

export default defineComponent({
    name: "PatientsPage",
    components: { PatientModal, ConfirmModal },
    data() {
        return {
            patients: [],
            displayModal: false,
            displayDeleteModal: false,
            selectedPatient: null,
            editMode: false,
            createMode: false,
            patientToDelete: null,
        };
    },
    methods: {
        loadPatients() {
            Request.Do(ApiPatientsAdmin.GetAdminPatients())
                .onSuccess((response) => {
                    this.patients = response;
                });
        },
        openViewModal(patient) {
            this.selectedPatient = patient;
            this.editMode = false;
            this.createMode = false;
            this.displayModal = true;
        },
        openEditModal(patient) {
            this.selectedPatient = { ...patient };
            this.editMode = true;
            this.createMode = false;
            this.displayModal = true;
        },
        openCreateModal() {
            this.selectedPatient = { username: "", email: "", enfermedades: [], password: "" };
            this.editMode = false;
            this.createMode = true;
            this.displayModal = true;
        },
        closeModal() {
            this.displayModal = false;
        },
        onSaved() {
            this.displayModal = false;
            this.loadPatients();
        },
        openDeleteModal(patient) {
            this.patientToDelete = patient;
            this.displayDeleteModal = true;
        },
        deletePatient() {
            Request.Do(ApiPatientsAdmin.DeleteAdminPatientsId(this.patientToDelete.id))
                .onSuccess(() => {
                    this.displayDeleteModal = false;
                    this.loadPatients();
                });
        },
        renderDate(ts) {
            return new Date(ts).toLocaleString();
        },
    },
    mounted() {
        this.loadPatients();
    },
});
</script>