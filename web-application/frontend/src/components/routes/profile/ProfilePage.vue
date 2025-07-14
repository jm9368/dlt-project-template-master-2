<template>
    <div class="page-content" tabindex="-1">
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

                    <div v-if="location" class="user-profile-bio"><i class="fas fa-location-dot detail-icon"></i>{{ location }}</div>

                    <div v-if="website" class="user-profile-website">
                        <i class="fas fa-link detail-icon"></i>
                        <a :href="website" target="_blank" rel="noopener noreferrer">{{ website }}</a>
                    </div>

                    <div v-if="(selfUserId && selfUserId === id) || canManage" class="user-profile-edit">
                        <RouterLink v-if="selfUserId && selfUserId === id" :to="{ name: 'account-settings', query: { tab: 'profile' } }">
                            <button type="button" class="btn btn-primary btn-sm" :class="{ 'btn-mr': canManage }">
                                <i class="fas fa-pencil"></i> {{ $t("Edit profile") }}
                            </button>
                        </RouterLink>
                        <RouterLink v-if="canManage" :to="{ name: 'admin-user', params: { id: id } }">
                            <button type="button" class="btn btn-primary btn-sm"><i class="fas fa-cog"></i> {{ $t("Manage") }}</button>
                        </RouterLink>
                    </div>
                </div>
            </div>
            <div class="user-profile-body"></div>
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
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ComponentLoader from "@/components/utils/ComponentLoader.vue";
import { getUniqueStringId } from "@/utils/unique-id";
import { Timeouts } from "@/utils/timeout";
import { Request } from "@asanrom/request-browser";
import { AuthController } from "@/control/auth";
import { ApiProfile } from "@/api/api-group-profile";
import { renderDate } from "@/utils/time-utils";

export default defineComponent({
    components: {
        ComponentLoader,
    },
    name: "ProfilePage",
    setup: function () {
        return {
            loadRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            q: "",
            loading: true,

            notFound: false,

            selfUserId: AuthController.UID,
            canManage: AuthController.hasPermission("mod.users"),

            id: "",
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
        load: function () {
            Timeouts.Abort(this.loadRequestId);
            Request.Abort(this.loadRequestId);

            this.loading = true;

            Request.Pending(this.loadRequestId, ApiProfile.GetProfile(this.q))
                .onSuccess((profile) => {
                    this.loading = false;
                    this.notFound = false;
                    this.id = profile.id;
                    this.image = profile.image;
                    this.name = profile.name;
                    this.username = profile.username;
                    this.joinDate = profile.joinDate;
                    this.bio = profile.bio;
                    this.location = profile.location;
                    this.website = profile.website;

                    this.$setSubTitle((profile.name || profile.username) + " (@" + profile.username + ")");
                })
                .onRequestError((err, handleErr) => {
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        notFound: () => {
                            this.loading = false;
                            this.notFound = true;

                            this.$setSubTitle(this.$t("User not found"));
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

        onAuthChanged: function () {
            this.selfUserId = AuthController.UID;
            this.canManage = AuthController.hasPermission("mod.users");
        },

        renderDate: function (date: string) {
            return renderDate(date, this.$t);
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-loading", this.onAuthChanged.bind(this));

        this.q = this.$route.params.username + "";
        this.load();
    },
    beforeUnmount: function () {
        Timeouts.Abort(this.loadRequestId);
        Request.Abort(this.loadRequestId);
    },

    watch: {
        $route: function () {
            const q = this.$route.params.username + "";
            if (this.q !== q) {
                this.q = q;
                this.load();
            }
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
    border-bottom: solid 1px var(--theme-border-color);
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
</style>
