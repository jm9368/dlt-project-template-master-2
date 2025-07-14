<template>
    <div class="modal-container modal-container-cookies modal-container-opaque no-transition" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lgb" role="document">
            <div class="modal-header">
                <div class="modal-title no-close">{{ $t("Cookies preferences") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Select your language')" @click="selectLanguage">
                    <i class="fas fa-language"></i>
                </button>
                <button type="button" class="modal-close-btn" :title="$t('Change theme')" @click="invertTheme">
                    <i v-if="theme === 'dark'" class="fas fa-sun"></i>
                    <i v-else class="fas fa-moon"></i>
                </button>
            </div>
            <div class="modal-body cookies-modal-body">
                <div class="cookie-option">
                    <div class="cookie-option-title">{{ $t("Accept only essential cookies") }}</div>
                    <div class="cookie-option-desc">
                        {{ $t("We will only use the cookies required for this website to function") }}:
                        <ul class="list-cookie-purposes">
                            <li><i class="fas fa-key"></i> {{ $t("For authentication purposes (in order to keep you logged in)") }}</li>
                            <li><i class="fas fa-hand"></i> {{ $t("In order to prevent spam or abuse of our services") }}</li>
                        </ul>
                    </div>
                    <div class="cookie-option-btn-container">
                        <button @click="acceptOnlyEssentialCookies" type="button" class="btn btn-primary">
                            <i class="fas fa-check"></i> {{ $t("Accept only essential cookies") }}
                        </button>
                    </div>
                </div>
                <div class="cookie-option">
                    <div class="cookie-option-title">{{ $t("Accept all cookies") }}</div>
                    <div class="cookie-option-desc">
                        {{ $t("We will also use cookies for the following purposes") }}:
                        <ul class="list-cookie-purposes">
                            <li><i class="fas fa-chart-column"></i> {{ $t("Improving our services by collecting usage data") }}</li>
                            <li><i class="fas fa-user-plus"></i> {{ $t("Customizing the experience based on your preferences") }}</li>
                            <li><i class="fas fa-rectangle-ad"></i> {{ $t("Showing you advertisements based on your preferences") }}</li>
                        </ul>
                    </div>
                    <div class="cookie-option-btn-container">
                        <button @click="acceptAllCookies" type="button" class="btn btn-primary">
                            <i class="fas fa-check"></i> {{ $t("Accept all cookies") }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer cookies-modal-footer">
                <router-link target="_blank" rel="noopener noreferrer" :to="{ name: 'terms' }">{{ $t("Terms of use") }}</router-link> |
                <router-link target="_blank" rel="noopener noreferrer" :to="{ name: 'cookies' }">{{ $t("Cookies policy") }}</router-link> |
                <router-link target="_blank" rel="noopener noreferrer" :to="{ name: 'privacy' }">{{ $t("Privacy policy") }}</router-link>
            </div>
        </div>

        <ChangeLanguageModal v-if="displayLanguageModal" v-model:display="displayLanguageModal"></ChangeLanguageModal>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ColorThemeName, getTheme, setCookiePreference, setTheme } from "@/control/app-preferences";

import ChangeLanguageModal from "@/components/modals/ChangeLanguageModal.vue";
import { FocusTrap } from "@/utils/focus-trap";
import { useVModel } from "@/utils/v-model";

export default defineComponent({
    components: {
        ChangeLanguageModal,
    },
    name: "CookiesModal",
    props: {
        display: Boolean,
    },
    setup(props) {
        return {
            focusTrap: null as FocusTrap,
            displayStatus: useVModel(props, "display"),
        };
    },
    data: function () {
        return {
            theme: getTheme(),
            displayLanguageModal: false,
        };
    },
    methods: {
        close: function () {
            this.displayStatus = false;
        },

        focusLost: function () {
            if (this.display) {
                this.$el.focus();
            }
        },

        invertTheme: function () {
            setTheme(this.theme === "dark" ? "light" : "dark");
        },

        onThemeChanged: function (t: ColorThemeName) {
            this.theme = t;
        },

        selectLanguage: function () {
            this.displayLanguageModal = true;
        },

        acceptAllCookies: function () {
            setCookiePreference("all");
            this.close();
        },

        acceptOnlyEssentialCookies: function () {
            setCookiePreference("essential");
            this.close();
        },
    },
    mounted: function () {
        this.$listenOnAppEvent("theme-changed", this.onThemeChanged.bind(this));

        this.focusTrap = new FocusTrap(this.$el, this.focusLost.bind(this));

        if (this.display) {
            this.focusTrap.activate();
        }

        this.$autoFocus();
    },
    beforeUnmount: function () {
        if (this.focusTrap) {
            this.focusTrap.destroy();
        }
    },
    watch: {
        display: function () {
            if (this.display) {
                if (this.focusTrap) {
                    this.focusTrap.activate();
                }
            } else {
                if (this.focusTrap) {
                    this.focusTrap.deactivate();
                }
            }
        },
    },
});
</script>

<style scoped>
.cookies-modal-body {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
}

.cookies-modal-body .cookie-option {
    display: flex;
    width: 50%;
    flex-direction: column;
    padding-right: 1rem;
    padding-left: 1rem;
}

@media (max-width: 800px) {
    .cookies-modal-body .cookie-option {
        width: 100%;
    }
}

.cookie-option-title {
    padding-bottom: 1rem;
    font-size: x-large;
    font-weight: bold;
    text-align: center;
}

.cookie-option-desc {
    text-align: left;
    padding-bottom: 1rem;
    flex: 1;
}

.cookie-option-btn-container {
    text-align: left;
    padding-bottom: 1rem;
}

.cookie-option-btn-container .btn {
    width: 100%;
}

.list-cookie-purposes {
    list-style-type: none;
}

.list-cookie-purposes i {
    margin-right: 0.5rem;
}

.list-cookie-purposes li {
    margin-bottom: 0.75rem;
}

.cookies-modal-footer {
    text-align: center;
}
</style>
