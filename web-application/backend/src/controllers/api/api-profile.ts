// Reserved for license

"use strict";

import Express from "express";
import { User } from "../../models/users/user";
import { UsersService } from "../../services/users-service";
import { BAD_REQUEST, ensureObjectBody, getFileUploadMiddleware, INTERNAL_SERVER_ERROR, noCache, NOT_FOUND, sendApiError, sendApiResult, sendApiSuccess, sendUnauthorized } from "../../utils/http-utils";
import { validateURL } from "../../utils/text-utils";
import { Controller } from "../controller";
import { UserProfile } from "../../models/users/user-profile";
import { FileStorageService } from "../../services/file-storage";
import fileUpload from "express-fileupload";
import { clearTempFile, moveUploadedFileToTempFile } from "../../utils/file-utils";
import { ImagesService } from "../../services/images-service";

const MAX_NAME_LENGTH = 80;
const MAX_BIO_LENGTH = 300;

const MAX_LOCATION_LENGTH = 100;
const MAX_WEBSITE_LENGTH = 100;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

/**
 * Profile API
 * @group profile
 */
export class ProfileController extends Controller {
    public registerAPI(prefix: string, application: Express.Express): any {
        // Get profile
        application.get(prefix + "/profile/:username", noCache(this.getProfile.bind(this)));

        // Update profile
        application.post(prefix + "/profile", ensureObjectBody(this.updateProfile.bind(this)));

        // Profile image
        application.post(prefix + "/profile/image", getFileUploadMiddleware(MAX_IMAGE_SIZE), ensureObjectBody(this.updateProfileImage.bind(this)));
        application.delete(prefix + "/profile/image", ensureObjectBody(this.deleteProfileImage.bind(this)));
    }

    /**
     * @typedef UserProfileMin
     * @property {string} id - User ID
     * @property {string} username - Username
     * @property {string} name - Full name
     * @property {string} image - Image URL
     */

    /**
     * @typedef UserProfile
     * @property {string} id - User ID
     * @property {string} username - Username
     * @property {string} joinDate - Join Date (YYYY-MM-DD)
     * @property {string} name - Full name
     * @property {string} bio - Bio / Description
     * @property {string} image - Image URL
     * @property {string} location - Location
     * @property {string} website - Website URL
     */

    /**
     * Gets profile
     * Binding: GetProfile
     * @route GET /profile/{username}
     * @group profile
     * @param {string} username.path.required - Username or UID. If username, add the at (@) prefix.
     * @returns {void} 404 - Not found
     * @returns {UserProfile.model} 200 - Profile
     * @security AuthToken
     */
    public async getProfile(request: Express.Request, response: Express.Response) {
        const targetUsername = request.params.username + "";

        let user: User;

        if (targetUsername.startsWith("@")) {
            user = await User.findUserByUsername(targetUsername.substring(1));
        } else {
            user = await User.findUserByUID(targetUsername);
        }

        if (!user) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "NOT_FOUND",
                "User not found",
            );
            return;
        }

        const profile = await UserProfile.findByUser(user.id);

        if (!profile) {
            sendApiError(
                request,
                response,
                NOT_FOUND,
                "NOT_FOUND",
                "Profile not found",
            );
            return;
        }

        sendApiResult(request, response, {
            id: user.id,
            username: user.username,
            joinDate: (new Date(user.created)).toISOString().split("T")[0],
            name: profile.name,
            bio: profile.bio,
            image: FileStorageService.getInstance().getStaticFileURL(profile.image),
            location: profile.location,
            website: profile.website,
        });
    }

    /**
     * @typedef UpdateProfileBody
     * @property {string} name - Full name
     * @property {string} bio - Bio / Description
     * @property {string} location - Location
     * @property {string} website - Website URL
     */

    /**
     * @typedef UpdateProfileBadRequest
     * @property {string} code.required - Error Code:
     *  - INVALID_NAME: Invalid full name. Cannot exceed 80 characters
     *  - INVALID_BIO: Invalid bio. Cannot exceed 300 characters.
     *  - INVALID_LOCATION: Invalid location. Cannot exceed 100 characters.
     *  - INVALID_WEBSITE: Invalid website. Must be a valid URL and cannot exceed 100 characters.
     */

    /**
     * Updates profile
     * Binding: UpdateProfile
     * @route POST /profile
     * @group profile
     * @param {UpdateProfileBody.model} request.body - Request body
     * @returns {UpdateProfileBadRequest.model} 400 - Bad request
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async updateProfile(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const profile = await UserProfile.findByUser(user.id);

        if (request.body.name !== undefined) {
            const newName = (request.body.name || "") + "";

            if (newName.length > MAX_NAME_LENGTH) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_NAME",
                    "The client provided an invalid profile name",
                );
                return;
            }

            profile.name = newName;
        }


        if (request.body.bio !== undefined) {
            const newBio = (request.body.bio || "") + "";

            if (newBio.length > MAX_BIO_LENGTH) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_BIO",
                    "The client provided an invalid bio",
                );
                return;
            }

            profile.bio = newBio;
        }

        if (request.body.location !== undefined) {
            const newLocation = (request.body.location || "") + "";

            if (newLocation.length > MAX_LOCATION_LENGTH) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_LOCATION",
                    "The client provided an invalid location",
                );
                return;
            }

            profile.location = newLocation;
        }

        if (request.body.website !== undefined) {
            const newWebsite = (request.body.website || "") + "";

            if (newWebsite.length > MAX_WEBSITE_LENGTH) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_WEBSITE",
                    "The client provided an invalid website (too long)",
                );
                return;
            }

            if (newWebsite && !validateURL(newWebsite)) {
                sendApiError(
                    request,
                    response,
                    BAD_REQUEST,
                    "INVALID_WEBSITE",
                    "The client provided an invalid website (invalid URL)",
                );
                return;
            }

            profile.website = newWebsite;
        }

        await profile.save();
        await UsersService.getInstance().clearProfileCache(user.id);

        sendApiSuccess(request, response);
    }

    /**
     * @typedef UploadProfileImageResponse
     * @property {string} url - Uploaded image URL
     */

    /**
     * Updates profile image
     * Binding: UpdateImage
     * @route POST /profile/image
     * @group profile
     * @consumes multipart/form-data
     * @param {file} image.formData - Image to upload - Max 20MB
     * @returns {void} 400 - Bad request. Invalid image.
     * @returns {UploadProfileImageResponse.model} 200 - Success
     * @security AuthToken
     */
    public async updateProfileImage(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const profile = await UserProfile.findByUser(user.id);

        let image: fileUpload.UploadedFile;

        if (request.files && request.files.image) {
            if (Array.isArray(request.files.image)) {
                image = request.files.image[0];
            } else {
                image = request.files.image;
            }
        }

        if (!image) {
            // No image (error)
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "NO_IMAGE",
                "The client provided no image file",
            );
            return;
        }

        // Move image to temp file

        const imagePath = await moveUploadedFileToTempFile(image);

        // Probe image

        const probed = await ImagesService.getInstance().probeImage(imagePath);

        if (!probed.valid) {
            clearTempFile(imagePath);
            sendApiError(
                request,
                response,
                BAD_REQUEST,
                "INVALID_IMAGE",
                "The client provided an invalid image file",
            );
            return;
        }

        // Encode and store image

        let imageStorageKey: string;

        try {
            imageStorageKey = await ImagesService.getInstance().encodeResizeAndStoreImage(imagePath, "png", ImagesService.RESOLUTIONS.PROFILE_IMAGES, true);
        } catch (ex) {
            clearTempFile(imagePath);

            request.logger.error(ex);
            sendApiError(
                request,
                response,
                INTERNAL_SERVER_ERROR,
                "FFMPEG_ERROR",
                ex.message,
            );
            return;
        }

        clearTempFile(imagePath);

        if (profile.image) {
            // Delete old image
            const exists = await FileStorageService.getInstance().checkExists(profile.image);
            if (exists) {
                await FileStorageService.getInstance().deleteFile(profile.image);
            }
        }

        profile.image = imageStorageKey;
        await profile.save();

        await UsersService.getInstance().clearProfileCache(user.id);

        sendApiResult(request, response, {
            url: FileStorageService.getInstance().getStaticFileURL(imageStorageKey),
        });
    }

    /**
     * Deletes profile image
     * Binding: DeleteImage
     * @route DELETE /profile/image
     * @group profile
     * @returns {void} 200 - Success
     * @security AuthToken
     */
    public async deleteProfileImage(request: Express.Request, response: Express.Response) {
        const auth = await UsersService.getInstance().auth(request);
        if (!auth.isRegisteredUser()) {
            sendUnauthorized(request, response);
            return;
        }

        const user = auth.user;

        const profile = await UserProfile.findByUser(user.id);

        if (profile && profile.image) {
            const exists = await FileStorageService.getInstance().checkExists(profile.image);
            if (exists) {
                await FileStorageService.getInstance().deleteFile(profile.image);
            }
            profile.image = "";
            await profile.save();

            await UsersService.getInstance().clearProfileCache(user.id);
        }

        sendApiSuccess(request, response);
    }
}

