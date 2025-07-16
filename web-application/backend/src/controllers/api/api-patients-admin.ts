import Express from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, sendApiError, sendApiResult, sendApiSuccess, noCache, ensureObjectBody } from "../../utils/http-utils";
import { Controller } from "../controller";
import { Patient } from "../../models/users/patient";
import { DataFilter } from "tsbean-orm";
import { insertPatientMongo, updatePatientMongo, deletePatientMongo } from "../../utils/patient-utils";

/**
 * @typedef PatientListItem
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {string[]} enfermedades
 * @property {number} created
 */

/**
 * @typedef PatientCreateBody
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string[]} enfermedades
 */

/**
 * @typedef PatientModifyBody
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string[]} enfermedades
 */

/**
 * Patients admsendApiResult(request, response, { patients: filtered });in API
 * @group patients_admin
 */
export class PatientsAdminController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        application.get(prefix + "/admin/patients", noCache(this.selectAllPatients.bind(this)));
        application.get(prefix + "/admin/patients/:id", noCache(this.selectPatient.bind(this)));
        application.post(prefix + "/admin/patients", ensureObjectBody(this.createPatient.bind(this)));
        application.post(prefix + "/admin/patients/:id", ensureObjectBody(this.modifyPatient.bind(this)));
        application.delete(prefix + "/admin/patients/:id", this.deletePatient.bind(this));
    }

    /**
     * Gets list of patients (filters sensitive data)
     * @route GET /admin/patients
     * @group patients_admin
     * @returns {Array.<PatientListItem>} 200 - List of patients
     * @returns {void} 500 - Internal error
     */
    public async selectAllPatients(request: Express.Request, response: Express.Response) {
        try {
            const patients = await Patient.finder.find(DataFilter.any());
            const filtered = patients.map(p => ({
                id: p.id,
                username: p.username,
                email: p.email,
                enfermedades: p.enfermedades,
                created: p.created,
            }));
            //sendApiResult(request, response, { patients: filtered });
            sendApiResult(request, response, filtered);
        } catch (e) {
            sendApiError(request, response, INTERNAL_SERVER_ERROR, "ERROR", "Error al obtener pacientes");
        }
    }

    /**
     * Gets a patient by id (filters sensitive data)
     * @route GET /admin/patients/{id}
     * @group patients_admin
     * @param {string} id.path.required - Patient ID
     * @returns {PatientListItem.model} 200 - Patient data
     * @returns {void} 404 - Not found
     * @returns {void} 500 - Internal error
     */
    public async selectPatient(request: Express.Request, response: Express.Response) {
        try {
            const id = request.params.id + "";
            const patient = await Patient.finder.findByKey(id);
            if (!patient) {
                sendApiError(request, response, BAD_REQUEST, "NOT_FOUND", "Paciente no encontrado");
                return;
            }
            sendApiResult(request, response, {
                id: patient.id,
                username: patient.username,
                email: patient.email,
                enfermedades: patient.enfermedades,
                created: patient.created,
            });
        } catch (e) {
            sendApiError(request, response, INTERNAL_SERVER_ERROR, "ERROR", "Error al obtener paciente");
        }
    }

    /**
     * Creates a patient in both databases
     * @route POST /admin/patients
     * @group patients_admin
     * @param {PatientCreateBody.model} request.body.required - Patient data
     * @returns {void} 200 - Success
     * @returns {void} 400 - Bad request
     * @returns {void} 500 - Internal error
     */
    public async createPatient(request: Express.Request, response: Express.Response) {
        try {
            const data = request.body;
            if (!data.username || !data.email || !data.password) {
                sendApiError(request, response, BAD_REQUEST, "INVALID_DATA", "Datos obligatorios faltantes");
                return;
            }
            const patient = new Patient({
                id: data.id || "", // Genera un id único si lo necesitas
                username: data.username,
                email: data.email,
                password: data.password,
                enfermedades: data.enfermedades || [],
                created: Date.now(),
            });
            await patient.insert(); // MySQL
            await insertPatientMongo({
                id: patient.id,
                username: patient.username,
                email: patient.email,
                enfermedades: patient.enfermedades,
                created: patient.created,
            });
            sendApiSuccess(request, response);
        } catch (e) {
            sendApiError(request, response, INTERNAL_SERVER_ERROR, "ERROR", "Error al crear paciente");
        }
    }

    /**
     * Modifies a patient by id
     * @route POST /admin/patients/{id}
     * @group patients_admin
     * @param {string} id.path.required - Patient ID
     * @param {PatientModifyBody.model} request.body.required - Patient data
     * @returns {void} 200 - Success
     * @returns {void} 400 - Bad request
     * @returns {void} 500 - Internal error
     */
    public async modifyPatient(request: Express.Request, response: Express.Response) {
        try {
            const id = request.params.id + "";
            const data = request.body;
            const patient = await Patient.finder.findByKey(id);
            if (!patient) {
                sendApiError(request, response, BAD_REQUEST, "NOT_FOUND", "Paciente no encontrado");
                return;
            }
            patient.username = data.username || patient.username;
            patient.email = data.email || patient.email;
            patient.password = data.password || patient.password;
            patient.enfermedades = data.enfermedades || patient.enfermedades;
            await patient.save(); // MySQL
            await updatePatientMongo(patient.id, {
                username: patient.username,
                email: patient.email,
                enfermedades: patient.enfermedades,
                created: patient.created,
            });
            sendApiSuccess(request, response);
        } catch (e) {
            sendApiError(request, response, INTERNAL_SERVER_ERROR, "ERROR", "Error al modificar paciente");
        }
    }

    /**
     * Deletes a patient by id
     * @route DELETE /admin/patients/{id}
     * @group patients_admin
     * @param {string} id.path.required - Patient ID
     * @returns {void} 200 - Success
     * @returns {void} 400 - Bad request
     * @returns {void} 500 - Internal error
     */
    public async deletePatient(request: Express.Request, response: Express.Response) {
        try {
            const id = request.params.id + "";
            const patient = await Patient.finder.findByKey(id);
            if (!patient) {
                sendApiError(request, response, BAD_REQUEST, "NOT_FOUND", "Paciente no encontrado");
                return;
            }
            await patient.delete(); // MySQL
            await deletePatientMongo(patient.id);
            sendApiSuccess(request, response);
        } catch (e) {
            sendApiError(request, response, INTERNAL_SERVER_ERROR, "ERROR", "Error al eliminar paciente");
        }
    }
}