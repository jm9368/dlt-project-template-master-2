// API bindings: patients_admin (Auto generated)

"use strict";

import { RequestErrorHandler, RequestParams, CommonErrorHandler } from "@asanrom/request-axios";
import { getApiUrl } from "./utils";
import { PatientListItem, PatientCreateBody, PatientModifyBody } from "./definitions";

export class ApiPatientsAdmin {
    /**
     * Method: GET
     * Path: /admin/patients
     * Gets list of patients (filters sensitive data)
     * @returns The request parameters
     */
    public static GetAdminPatients(): RequestParams<PatientListItem[], CommonErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/admin/patients`),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/patients
     * Creates a patient in both databases
     * @param body Body parameters
     * @returns The request parameters
     */
    public static PostAdminPatients(body: PatientCreateBody): RequestParams<void, PostAdminPatientsErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/patients`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: GET
     * Path: /admin/patients/{id}
     * Gets a patient by id (filters sensitive data)
     * @param id Patient ID
     * @returns The request parameters
     */
    public static GetAdminPatientsId(id: string): RequestParams<PatientListItem, GetAdminPatientsIdErrorHandler> {
        return {
            method: "GET",
            url: getApiUrl(`/admin/patients/${encodeURIComponent(id)}`),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(404, "*", handler.notFound)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: POST
     * Path: /admin/patients/{id}
     * Modifies a patient by id
     * @param id Patient ID
     * @param body Body parameters
     * @returns The request parameters
     */
    public static PostAdminPatientsId(id: string, body: PatientModifyBody): RequestParams<void, PostAdminPatientsIdErrorHandler> {
        return {
            method: "POST",
            url: getApiUrl(`/admin/patients/${encodeURIComponent(id)}`),
            json: body,
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }

    /**
     * Method: DELETE
     * Path: /admin/patients/{id}
     * Deletes a patient by id
     * @param id Patient ID
     * @returns The request parameters
     */
    public static DeleteAdminPatientsId(id: string): RequestParams<void, DeleteAdminPatientsIdErrorHandler> {
        return {
            method: "DELETE",
            url: getApiUrl(`/admin/patients/${encodeURIComponent(id)}`),
            handleError: (err, handler) => {
                new RequestErrorHandler()
                    .add(400, "*", handler.badRequest)
                    .add(500, "*", "serverError" in handler ? handler.serverError : handler.temporalError)
                    .add("*", "*", "networkError" in handler ? handler.networkError : handler.temporalError)
                    .handle(err);
            },
        };
    }
}

/**
 * Error handler for PostAdminPatients
 */
export type PostAdminPatientsErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;
};

/**
 * Error handler for GetAdminPatientsId
 */
export type GetAdminPatientsIdErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 404
     */
    notFound: () => void;
};

/**
 * Error handler for PostAdminPatientsId
 */
export type PostAdminPatientsIdErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;
};

/**
 * Error handler for DeleteAdminPatientsId
 */
export type DeleteAdminPatientsIdErrorHandler = CommonErrorHandler & {
    /**
     * General handler for status = 400
     */
    badRequest: () => void;
};

