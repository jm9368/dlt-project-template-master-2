<template>
    <div class="password-input-container">
        <div class="password-input">
            <input
                v-model="valState"
                :type="hidden ? 'password' : 'text'"
                :disabled="disabled"
                maxlength="255"
                :name="name"
                :autocomplete="!hidden ? 'off' : isNewPassword ? 'new-password' : ''"
                :class="{ 'auto-focus': !!autoFocus }"
            />
            <button
                type="button"
                tabindex="-1"
                :disabled="disabled"
                class="password-input-hide-btn"
                @click="toggleHide"
                :title="hidden ? $t('Show password') : $t('Hide password')"
            >
                <i v-if="hidden" class="fas fa-eye"></i>
                <i v-else class="fas fa-eye-slash"></i>
            </button>
        </div>

        <div v-if="isNewPassword && !isRepeatedPassword && passwordStrength >= 0" class="password-strength-hint">
            <div class="password-strength-hint-left">
                <div class="password-strength-text">{{ $t("Password strength") }}: {{ getPasswordStrength(passwordStrength) }}</div>
            </div>
            <div class="password-strength-hint-right" :title="getPasswordStrength(passwordStrength)">
                <i v-if="passwordStrength > 2" class="fas fa-check password-strength-ok"></i>
                <i v-else-if="passwordStrength > 0" class="fas fa-triangle-exclamation password-strength-warn"></i>
                <i v-else class="fas fa-times password-strength-error"></i>
            </div>
        </div>

        <div v-if="isNewPassword && !isRepeatedPassword && passwordStrength >= 0 && passwordStrength < 3" class="password-strength-info">
            {{ $t("Your password seems to be weak") }}.
            {{
                $t(
                    "Try using lowercase, uppercase, numbers and symbols, and also increasing your password length to increase its strength.",
                )
            }}
        </div>
    </div>
</template>

<script lang="ts">
import { useVModel } from "@/utils/v-model";
import { defineComponent } from "vue";
import { passwordStrength, Options } from "check-password-strength";

const PASSWORD_STRENGTH_OPTIONS: Options<string> = [
    {
        id: 0,
        value: "Too weak",
        minDiversity: 0,
        minLength: 0,
    },
    {
        id: 1,
        value: "Too weak",
        minDiversity: 0,
        minLength: 8,
    },
    {
        id: 2,
        value: "Weak",
        minDiversity: 2,
        minLength: 8,
    },
    {
        id: 3,
        value: "Medium",
        minDiversity: 3,
        minLength: 10,
    },
    {
        id: 4,
        value: "Medium",
        minDiversity: 4,
        minLength: 8,
    },
    {
        id: 5,
        value: "Strong",
        minDiversity: 4,
        minLength: 10,
    },
    {
        id: 6,
        value: "Strong",
        minDiversity: 3,
        minLength: 12,
    },
];

export default defineComponent({
    name: "PasswordInput",
    emits: ["update:val"],
    props: {
        val: String,
        disabled: Boolean,
        name: String,
        isNewPassword: Boolean,
        autoFocus: Boolean,
        isRepeatedPassword: Boolean,
    },
    setup(props) {
        return {
            valState: useVModel(props, "val"),
        };
    },
    data: function () {
        return {
            hidden: true,
        };
    },
    computed: {
        passwordStrength: function () {
            if (!this.val || !this.isNewPassword || this.isRepeatedPassword) {
                return -1;
            }

            if (this.val.length < 8) {
                return 0;
            }

            const str = passwordStrength(this.val, PASSWORD_STRENGTH_OPTIONS).value;

            switch (str) {
                case "Too weak":
                    return 1;
                case "Weak":
                    return 2;
                case "Medium":
                    return 3;
                case "Strong":
                    return 4;
                default:
                    return -1;
            }
        },
    },
    methods: {
        toggleHide: function () {
            this.hidden = !this.hidden;
            this.$autoFocus();
        },

        getPasswordStrength: function (passwordStrength: number) {
            switch (passwordStrength) {
                case 0:
                    return this.$t("Too weak");
                case 1:
                    return this.$t("Very weak");
                case 2:
                    return this.$t("Weak");
                case 3:
                    return this.$t("Medium");
                case 4:
                    return this.$t("Strong");
                default:
                    return "";
            }
        },
    },
});
</script>

<style scoped>
.password-input {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.password-input input {
    width: 100%;

    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    background-clip: padding-box;

    background: transparent;
    border: none;

    box-shadow: none;

    border: 1px solid var(--theme-border-color);
    color: var(--text-color);
    background: var(--input-bg-color);

    border-radius: 0.25rem;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
}

.password-input input:focus {
    color: var(--text-color);
    background: var(--input-bg-color);
    border: 1px solid var(--theme-border-color);
    outline: 0;
    box-shadow: 0 0 0 0.2rem var(--theme-border-color);
}
.password-input-hide-btn {
    position: absolute;
    right: 0;
    top: 0;
    width: 38px;
    height: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    box-shadow: none;
    cursor: pointer;
    font-size: 18px;
    background: transparent;
    color: var(--text-color);
}

.password-input-hide-btn:disabled {
    opacity: 0.7;
    cursor: default;
}

.password-input-hide-btn:not(:disabled):hover {
    color: var(--theme-btn-hover-color);
}

.password-strength-hint {
    padding-top: 0.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.password-strength-hint-left {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.password-strength-text {
    overflow: hidden;
    text-overflow: ellipsis;
}

.password-strength-hint-right {
    width: 38px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.password-strength-ok {
    color: var(--success-color);
}

.password-strength-warn {
    color: var(--warn-color);
}

.password-strength-error {
    color: var(--error-color);
}

.password-strength-info {
    padding-top: 0.5rem;
}
</style>
