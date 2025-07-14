<template>
    <div class="content-inner" tabindex="-1">
        <ComponentLoader v-if="loading"></ComponentLoader>

        <form @submit="submit" v-if="!loading">
            <h2>{{ $t("Edit profile") }}</h2>
            <div class="form-group">
                <label>{{ $t("Profile name") }}:</label>
                <input
                    type="text"
                    :disabled="busy"
                    class="form-control form-control-full-width auto-focus"
                    v-model="name"
                    name="profile-name"
                    maxlength="80"
                    @input="markDirty"
                />
                <div class="form-error" v-if="errorName">{{ errorName }}</div>
            </div>
            <div class="form-group" @drop="onDropImage">
                <img v-if="image" class="usr-image" :src="image" />
                <img v-else class="usr-image" src="@/assets/user.png" />
            </div>
            <div class="form-group">
                <input type="file" class="file-hidden file-image" @change="imageFileChanged" name="image-upload" />
                <button
                    type="button"
                    v-if="!busyImage || imageUploadProgress <= 0"
                    :disabled="busyImage"
                    class="btn btn-primary"
                    @click="selectImage"
                >
                    <i class="fas fa-upload"></i> {{ $t("Upload new image") }}
                </button>
                <button type="button" v-if="busyImage && imageUploadProgress > 0" disabled class="btn btn-primary">
                    <i class="fa fa-spinner fa-spin"></i> {{ $t("Uploading image") }}... ({{ imageUploadProgress }}%)
                </button>
                <div class="form-error" v-if="errorImage">{{ errorImage }}</div>
            </div>

            <div class="form-group" v-if="image">
                <button type="button" :disabled="busyImage" class="btn btn-danger" @click="deleteProfileImage">
                    <i class="fas fa-trash-alt"></i> {{ $t("Delete image") }}
                </button>
            </div>

            <div class="form-group">
                <label>{{ $t("Profile description") }}:</label>
                <textarea
                    :disabled="busy"
                    class="form-control form-textarea form-control-full-width"
                    v-model="bio"
                    name="profile-location"
                    rows="5"
                    maxlength="300"
                    @input="markDirty"
                ></textarea>
                <div class="form-error" v-if="errorBio">{{ errorBio }}</div>
            </div>

            <div class="form-group">
                <label>{{ $t("Location") }}:</label>
                <input
                    type="text"
                    :disabled="busy"
                    class="form-control form-control-full-width"
                    v-model="location"
                    name="profile-location"
                    maxlength="100"
                    @input="markDirty"
                />
                <div class="form-error" v-if="errorLocation">{{ errorLocation }}</div>
            </div>

            <div class="form-group">
                <label>{{ $t("Website") }}:</label>
                <input
                    type="text"
                    :disabled="busy"
                    class="form-control form-control-full-width"
                    v-model="website"
                    name="profile-website"
                    maxlength="100"
                    placeholder="https://www.example.com"
                    @input="markDirty"
                />
                <div class="form-error" v-if="errorWebsite">{{ errorWebsite }}</div>
            </div>

            <div class="form-group">
                <button type="submit" :disabled="busy || !dirty" class="btn btn-primary">
                    <i class="fas fa-save"></i> {{ $t("Save changes") }}
                </button>
                <div class="form-error" v-if="errorSave">{{ errorSave }}</div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { ApiProfile } from "@/api/api-group-profile";
import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";

import ComponentLoader from "@/components/utils/ComponentLoader.vue";

const IMAGE_UPLOAD_MAX_SIZE = 20 * 1024 * 1024;

export default defineComponent({
    components: {
        ComponentLoader,
    },
    name: "EditProfilePage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
            imageRequestId: getUniqueStringId(),
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,

            dirty: false,

            busyImage: false,
            imageUploadProgress: 0,
            errorImage: "",

            busy: false,

            id: "",

            name: "",
            errorName: "",

            bio: "",
            errorBio: "",

            image: "",

            location: "",
            errorLocation: "",

            website: "",
            errorWebsite: "",

            errorSave: "",
        };
    },
    methods: {
        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
                return;
            }

            Request.Pending(this.loadRequestId, ApiProfile.GetProfile(AuthController.UID))
                .onSuccess((profile) => {
                    this.loading = false;
                    this.id = profile.id;
                    this.image = profile.image;
                    this.name = profile.name || profile.username;
                    this.bio = profile.bio;
                    this.location = profile.location;
                    this.website = profile.website;

                    this.dirty = false;

                    this.$autoFocus();
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        notFound: () => {
                            // Retry
                            this.$requireLogin();
                        },
                        temporalError: () => {
                            // Retry
                            Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    console.error(err);
                    // Retry
                    Timeouts.Set(this.loadRequestId, 1500, this.load.bind(this));
                });
        },

        submit: function (e: Event) {
            e.preventDefault();

            if (this.busy) {
                return;
            }

            this.errorSave = "";

            this.errorName = "";
            this.errorBio = "";
            this.errorLocation = "";
            this.errorWebsite = "";

            this.busy = true;

            Request.Pending(
                this.saveRequestId,
                ApiProfile.UpdateProfile({ name: this.name, bio: this.bio, location: this.location, website: this.website }),
            )
                .onSuccess(() => {
                    this.busy = false;
                    this.dirty = false;
                    this.$showSnackBar(this.$t("Profile successfully updated!"));
                    AuthController.CheckAuthStatus();
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.errorSave = this.$t("Error") + ": " + this.$t("Unauthorized");
                            this.$requireLogin();
                        },
                        badRequestInvalidName: () => {
                            this.errorName = this.$t("Error") + ": " + this.$t("Invalid profile name");
                        },
                        badRequestInvalidBio: () => {
                            this.errorBio = this.$t("Error") + ": " + this.$t("Invalid profile description");
                        },
                        badRequestInvalidLocation: () => {
                            this.errorLocation = this.$t("Error") + ": " + this.$t("Invalid location");
                        },
                        badRequestInvalidWebsite: () => {
                            this.errorWebsite = this.$t("Error") + ": " + this.$t("Invalid website. Must be a valid URL.");
                        },
                        badRequest: () => {
                            this.errorSave = this.$t("Error") + ": " + this.$t("Bad request");
                        },
                        serverError: () => {
                            this.errorSave = this.$t("Error") + ": " + this.$t("Internal server error");
                        },
                        networkError: () => {
                            this.errorSave = this.$t("Error") + ": " + this.$t("Could not connect to the server");
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.busy = false;
                    console.error(err);
                    this.errorSave = err.message;
                });
        },

        markDirty: function () {
            this.dirty = true;
        },

        selectImage: function () {
            const fileElem = this.$el.querySelector(".file-image");

            if (fileElem) {
                fileElem.value = null;
                fileElem.click();
            }
        },

        imageFileChanged: function (e: Event) {
            const data = (e.target as any).files;
            if (data && data.length > 0) {
                const file = data[0] as File;
                this.uploadNewImage(file);
            }
        },

        onDropImage: function (e: Event) {
            e.preventDefault();
            const data = (e as any).dataTransfer.files;
            if (data && data.length > 0) {
                const file = data[0] as File;
                this.uploadNewImage(file);
            }
        },

        uploadNewImage: function (file: File) {
            if (this.busyImage) {
                return;
            }

            if (file.size > IMAGE_UPLOAD_MAX_SIZE) {
                this.errorImage =
                    this.$t("Error") +
                    ": " +
                    this.$t("The image must not be bigger than $SIZE.").replace("$SIZE", this.renderSize(IMAGE_UPLOAD_MAX_SIZE));
                return;
            }

            this.errorImage = "";
            this.imageUploadProgress = 0;
            this.busyImage = true;

            Request.Pending(this.imageRequestId, ApiProfile.UpdateImage({ image: file }))
                .onSuccess((res) => {
                    this.busyImage = false;
                    this.image = res.url;
                    this.$showSnackBar(this.$t("Profile image successfully changed!"));
                    AuthController.CheckAuthStatus();
                })
                .onUploadProgress((loaded, total) => {
                    this.imageUploadProgress = Math.round((loaded * 100) / total);
                })
                .onRequestError((err, handleErr) => {
                    this.busyImage = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.errorImage = this.$t("Error") + ": " + this.$t("Unauthorized");
                            this.$requireLogin();
                        },
                        badRequest: () => {
                            this.errorImage = this.$t("Error") + ": " + this.$t("Invalid image provided");
                        },
                        serverError: () => {
                            this.errorImage = this.$t("Error") + ": " + this.$t("Internal server error");
                        },
                        networkError: () => {
                            this.errorImage = this.$t("Error") + ": " + this.$t("Could not connect to the server");
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.busyImage = false;
                    console.error(err);
                    this.errorImage = err.message;
                });
        },

        renderSize: function (bytes: number): string {
            if (bytes > 1024 * 1024 * 1024) {
                let gb = bytes / (1024 * 1024 * 1024);
                gb = Math.floor(gb * 100) / 100;
                return gb + " GB";
            } else if (bytes > 1024 * 1024) {
                let mb = bytes / (1024 * 1024);
                mb = Math.floor(mb * 100) / 100;
                return mb + " MB";
            } else if (bytes > 1024) {
                let kb = bytes / 1024;
                kb = Math.floor(kb * 100) / 100;
                return kb + " KB";
            } else {
                return bytes + " Bytes";
            }
        },

        deleteProfileImage: function () {
            if (this.busyImage) {
                return;
            }

            this.$askUserConfirmation({
                title: this.$t("Delete profile image"),
                message: this.$t("Do you want to delete your current profile image?"),
                danger: true,
                callback: () => {
                    if (this.busyImage) {
                        return;
                    }

                    this.errorImage = "";
                    this.imageUploadProgress = 0;
                    this.busyImage = true;

                    Request.Pending(this.imageRequestId, ApiProfile.DeleteImage())
                        .onSuccess(() => {
                            this.busyImage = false;
                            this.$showSnackBar(this.$t("Profile image successfully deleted!"));
                            AuthController.CheckAuthStatus();
                        })
                        .onRequestError((err, handleErr) => {
                            this.busyImage = false;
                            handleErr(err, {
                                unauthorized: () => {
                                    this.errorImage = this.$t("Error") + ": " + this.$t("Unauthorized");
                                    this.$requireLogin();
                                },
                                serverError: () => {
                                    this.errorImage = this.$t("Error") + ": " + this.$t("Internal server error");
                                },
                                networkError: () => {
                                    this.errorImage = this.$t("Error") + ": " + this.$t("Could not connect to the server");
                                },
                            });
                        })
                        .onUnexpectedError((err) => {
                            this.busyImage = false;
                            console.error(err);
                            this.errorImage = err.message;
                        });
                },
            });
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.load.bind(this));

        this.load();
        this.$autoFocus();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);

        Request.Abort(this.imageRequestId);
        Request.Abort(this.saveRequestId);
    },
});
</script>

<style scoped>
.usr-image {
    width: 240px;
    max-width: 100%;
    background-color: var(--user-profile-image-background);
}
</style>
