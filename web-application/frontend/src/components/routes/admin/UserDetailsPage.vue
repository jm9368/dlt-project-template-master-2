<template>
    <div class="content-inner" tabindex="-1">
        <div>
            <h2>{{ $t("User details") }}</h2>
            <div class="table-responsive">
                <table class="table">
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("User ID") }}:</td>
                        <td>{{ userId }}</td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Username") }}:</td>
                        <td>
                            {{ username }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Role") }}:</td>
                        <td>
                            {{ role || "(" + $t("Default role") + ")" }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Email") }}:</td>
                        <td>
                            {{ email }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Email verification status") }}:</td>
                        <td>
                            {{ verified ? $t("Verified") : $t("Not verified") }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Language") }}:</td>
                        <td>
                            {{ renderLanguage(locale) }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Creation date") }}:</td>
                        <td>
                            {{ renderDate(created) }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Banned?") }}:</td>
                        <td>
                            {{ banned ? $t("Yes") : $t("No") }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Immune to moderation?") }}:</td>
                        <td>
                            {{ banned ? $t("Yes") : $t("No") }}
                        </td>
                    </tr>
                    <tr>
                        <td class="bold td-shrink one-line">{{ $t("Has two factor authentication enabled?") }}:</td>
                        <td>
                            {{ banned ? $t("Yes") : $t("No") }}
                        </td>
                    </tr>
                </table>
            </div>

            <div class="form-group">
                <button type="button" class="btn btn-primary" @click="openProfile">
                    <i class="fas fa-user"></i> {{ $t("View user profile") }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AuthController } from "@/control/auth";
import { renderDateAndTime } from "@/utils/time-utils";
import { AVAILABLE_LANGUAGES } from "@/i18n";

export default defineComponent({
    components: {},
    name: "UserDetailsPage",
    props: {
        userId: String,
        username: String,
        role: String,
        email: String,
        verified: Boolean,
        locale: String,
        banned: Boolean,
        modImmune: Boolean,
        tfa: Boolean,
        created: Number,
    },
    methods: {
        onAuthChanged: function () {
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
            }
        },

        renderDate: function (ts: number) {
            return renderDateAndTime(ts, this.$t);
        },

        renderLanguage: function (locale: string) {
            for (const l of AVAILABLE_LANGUAGES) {
                if (l.id === locale) {
                    return l.name;
                }
            }

            return locale || "-";
        },

        openProfile: function () {
            this.$showProfileModal(this.userId);
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("auth-status-changed", this.onAuthChanged.bind(this));

        if (AuthController.isAuthenticated()) {
            this.$autoFocus();
        } else {
            this.$requireLogin();
        }
    },
});
</script>

<style></style>
