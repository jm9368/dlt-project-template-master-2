<template>
    <div class="content-inner" tabindex="-1">
        <form @submit="submit">
            <h2>{{ $t("Change account language") }}</h2>

            <p>{{ $t("This language is used to contact you via email.") }}</p>

            <div class="form-group">
                <label>{{ $t("Select your language") }}:</label>
                <select class="form-control form-select form-control-full-width auto-focus" v-model="newLocale">
                    <option v-for="l in languages" :key="l.id" :value="l.id">{{ l.name }}</option>
                </select>
            </div>

            <div class="form-group">
                <button type="submit" :disabled="busy || locale === newLocale" class="btn btn-primary">
                    <i class="fas fa-save"></i> {{ $t("Save changes") }}
                </button>
                <div class="form-error" v-if="error">{{ error }}</div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { getUniqueStringId } from "@/utils/unique-id";

import { AuthController } from "@/control/auth";
import { Request } from "@asanrom/request-browser";
import { ApiAccount } from "@/api/api-group-account";

import { AVAILABLE_LANGUAGES } from "@/i18n";

export default defineComponent({
    components: {},
    name: "ChangeLanguagePage",
    setup: function () {
        return {
            saveRequestId: getUniqueStringId(),
        };
    },
    data: function () {
        return {
            locale: AuthController.Locale,
            newLocale: AuthController.Locale,

            languages: AVAILABLE_LANGUAGES.map((l) => {
                return { id: l.id, name: l.name };
            }),

            error: "",
            busy: false,
        };
    },
    methods: {
        onAuthChanged: function () {
            this.locale = AuthController.Locale;
            this.newLocale = AuthController.Locale;
            if (!AuthController.isAuthenticated()) {
                this.$requireLogin();
            }
        },

        submit: function (e: Event) {
            if (e) {
                e.preventDefault();
            }

            if (this.busy) {
                return;
            }

            this.error = "";

            this.busy = true;

            Request.Pending(this.saveRequestId, ApiAccount.ChangeLocale({ locale: this.newLocale }))
                .onSuccess(() => {
                    this.busy = false;
                    AuthController.CheckAuthStatus();
                    this.$showSnackBar(this.$t("Account language successfully changed"));
                })
                .onCancel(() => {
                    this.busy = false;
                })
                .onRequestError((err, handleErr) => {
                    this.busy = false;
                    handleErr(err, {
                        unauthorized: () => {
                            this.$requireLogin();
                        },
                        serverError: () => {
                            this.error = this.$t("Internal server error");
                        },
                        networkError: () => {
                            this.error = this.$t("Could not connect to the server");
                        },
                    });
                })
                .onUnexpectedError((err) => {
                    this.error = err.message;
                    console.error(err);
                    this.busy = false;
                });
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
    beforeUnmount: function () {
        Request.Abort(this.saveRequestId);
    },
});
</script>

<style></style>
