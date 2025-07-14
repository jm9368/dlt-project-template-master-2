<template>
    <ModalDialogContainer ref="modalContainer" v-model:display="displayStatus">
        <div class="modal-dialog modal-lg" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title" v-if="loading">{{ $t("Loading profile") }}...</div>
                <div class="modal-title" v-else-if="notFound">{{ $t("User not found") }}</div>
                <div class="modal-title" v-else>{{ name || username }} (@{{ username }})</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body modal-body-profile">
                <ComponentLoader v-if="loading"></ComponentLoader>
                <div class="user-profile" v-if="!loading && !notFound">
                    <div class="user-profile-header">
                        <div class="user-profile-image">
                            <img v-if="image" class="usr-image" :src="image" />
                            <img v-else class="usr-image" src="@/assets/user.png" />
                        </div>
                        <div class="user-profile-details">
                            <div class="user-profile-name">{{ name || username }}</div>
                            <div class="user-profile-username">@{{ username }}</div>
                            <div class="user-profile-join-date">
                                <i class="fas fa-calendar detail-icon"></i>{{ $t("Join date") }}: {{ renderDate(joinDate) }}
                            </div>

                            <div v-if="bio" class="user-profile-bio"><i class="fas fa-info detail-icon"></i>{{ bio }}</div>

                            <div v-if="location" class="user-profile-bio">
                                <i class="fas fa-location-dot detail-icon"></i>{{ location }}
                            </div>

                            <div v-if="website" class="user-profile-website">
                                <i class="fas fa-link detail-icon"></i>
                                <a :href="website" target="_blank" rel="noopener noreferrer">{{ website }}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="user-profile" v-else>
                    <div class="user-profile-header">
                        <div class="user-profile-image">
                            <img class="usr-image" src="@/assets/user.png" />
                        </div>
                        <div class="user-profile-details">
                            <div class="user-profile-name">{{ $t("User not found") }}</div>
                            <div class="user-profile-error">
                                {{ $t("The user you are looking for does not exist or was deleted from the platform.") }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" v-if="!loading && !notFound">
                <RouterLink
                    :to="{ name: 'profile', params: { username: '@' + username } }"
                    target="_blank"
                    rel="noopener noreferrer"
                    type="button"
                    class="btn btn-primary"
                >
                    <i class="fas fa-arrow-right"></i> {{ $t("Go to profile page") }}
                </RouterLink>
            </div>
            <div class="modal-footer" v-if="!loading && notFound">
                <button type="button" class="btn btn-primary" @click="close">
                    {{ $t("Close") }}
                </button>
            </div>
        </div>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "../../utils/v-model";
import { Timeouts } from "@/utils/timeout";
import { Request } from "@asanrom/request-browser";
import { getUniqueStringId } from "@/utils/unique-id";
import { ApiProfile } from "@/api/api-group-profile";
import ComponentLoader from "@/components/utils/ComponentLoader.vue";
import { renderDate } from "@/utils/time-utils";

export default defineComponent({
    components: {
        ComponentLoader,
    },
    name: "ProfileModal",
    emits: ["update:display"],
    props: {
        display: Boolean,
        uid: String,
    },
    setup(props) {
        return {
            displayStatus: useVModel(props, "display"),
            loadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            loading: true,
            notFound: false,

            username: "",
            joinDate: "",
            name: "",
            bio: "",
            image: "",
            location: "",
            website: "",
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

        renderDate: function (date: string) {
            return renderDate(date, this.$t);
        },

        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            Request.Pending(this.loadRequestId, ApiProfile.GetProfile(this.uid))
                .onSuccess((profile) => {
                    this.loading = false;
                    this.notFound = false;
                    this.image = profile.image;
                    this.name = profile.name;
                    this.username = profile.username;
                    this.joinDate = profile.joinDate;
                    this.bio = profile.bio;
                    this.location = profile.location;
                    this.website = profile.website;
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        notFound: () => {
                            this.loading = false;
                            this.notFound = true;
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
    },
    mounted: function () {
        if (this.display) {
            this.load();
            this.$autoFocus();
        }
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);
    },
    watch: {
        display: function () {
            if (this.display) {
                this.load();
                this.$autoFocus();
            }
        },
        uid: function () {
            this.load();
        },
    },
});
</script>

<style scoped>
.user-profile {
    display: block;
}

.user-profile-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
}

.user-profile-image {
    width: 240px;
    height: 240px;
    border-radius: 50%;
}

@media (max-width: 240px) {
    .user-profile-image {
        width: 100%;
        height: auto;
        aspect-ratio: 1;
    }
}

.user-profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    background-color: var(--user-profile-image-background);
}

.user-profile-details {
    padding: 1rem;
    width: calc(100% - 240px);
}

.user-profile-details div {
    padding-bottom: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 640px) {
    .user-profile-header {
        flex-direction: column;
    }

    .user-profile-details {
        width: 100%;
        align-items: flex-start;
    }
}

.user-profile-name {
    font-weight: bold;
    font-size: xx-large;
}

.user-profile-username {
    font-size: large;
    opacity: 0.75;
}

.detail-icon {
    width: 38px;
}

.user-profile-edit {
    padding-top: 1rem;
}

.modal-body-profile {
    min-height: 240px;
}
</style>
