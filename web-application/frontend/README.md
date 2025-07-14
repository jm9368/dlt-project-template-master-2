# Web application frontend

This folder contains the frontend for the web application, made with [Vue.js](https://vuejs.org/) as the framework, using [Vite](https://vitejs.dev/) as the build tool.

## Requirements

-   [NodeJS](https://nodejs.org/) - Last stable version

## Installation

To install dependencies run:

```sh
npm install
```

## Configuration

You can configure the project using environment variables. You can place those variables inside a `.env` file.

In order to get started, copy `.env.example` into `.env`:

```sh
cp .env.example .env
```

Here is the list of available configuration variables:

| Variable                     | Description                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `DEV_PORT`                   | Port to listen when running in development mode.                                                  |
| `VITE__PLATFORM_NAME`        | The platform name.                                                                                |
| `VITE__PLATFORM_DESCRIPTION` | The platform description.                                                                         |
| `VITE__I18N_LOCALE`          | The default locale for the internationalization plugin. `en` by default.                          |
| `VITE___DEV_TEST_HOST`       | The API server for development mode. This should be the backend base URL.                         |
| `VITE__API_SERVER_HOST`      | The API server for production mode. Since the backend usually serves the fronte, this can be `/`. |
| `VITE__CAPTCHA_SERVICE`      | The captcha service to use. Available ones: `reCAPTCHA`                                           |
| `VITE__RECAPTCHA_SITE_KEY`   | The reCaptcha site identifier, in order to use the Google reCaptcha service.                      |

If you want to add more variables, remember to use the `VITE__` prefix. [Learn more](https://vitejs.dev/guide/env-and-mode#env-files).

## Running in development mode

To run the project in development mode, run:

```sh
npm run serve
```

## Linting, styling and testing the code

In order to stylize the code, tun the following command:

```sh
npm run prettier
```

In order to test the code for errors, run:

```sh
npm test
```

## Building for production

In order to build for production, run:

```sh
npm run build
```

The compiled and bundled result will be placed inside the `dist` folder. That folder should be served as the frontend in production.

## Development guide

Remember to check the documentation for [Vue 3 - Options API](https://vuejs.org/api/options-state.html) and search for more learning material in order to be able to work with the framework.

### Project structure

All the code can be found inside the `src` folder. It is divided in multiple sub-folders for different purposes:

-   The `src/api` folder contains the API bindings. This is auto generated when you run the API binding generation command of the backend.
-   The `src/assets` folder contains any assets like images or fonts to use. You can also place them in the `public` folder.
-   The `src/components` folder contains the Vue components.
-   The `src/control` folder contains control classes to manage the global app state, for example the authentication status or the preferences.
-   The `src/locales` folder contains the translations for the text used in the app.
-   The `src/style` contains the stylesheets, as `.css` files.
-   the `src/utils` contains utility functions you can use from any part of the codebase.

### Using multi-language texts

You can use multi-language text inside components using the `$t` method injected inside every component:

```vue
<div class="settings-list-item-caption">
    {{ $t("Change password") }}
</div>
```

It is usually recommended to write the text in english, and let the translation tool to translate to the appropriate language using the translation files.

The translation files are located inside [src/locales](./src/locales/). They are JSON files named like `locale-{LANG}.json`. The contain an object with the keys mapped to the corresponding translation.

This project has a script to scan the codebase and automatically update the translation files, leaving an empty string for the new found keys. Run it with:

```sh
npm run update-translations
```

Then go to the `.missing.txt` files and translate the missing keys.

After you translate the keys, update the `STATUS=PENDING` to `STATUS=READY` for the `.missing.txt` files that are fully translated. Then, run the following script to apply those missing translations and update the `.json` files with them:

```sh
npm run apply-missing-translations
```

**Important:** Do not update the translations while working with the missing translations files, since it may break the order. The best practice is translating all the added keys for a task as the last commit before making the pull request.

If you want to translate something to en empty string, use a single space instead: `" "`. Also remember that the translations are trimmed, so do not use spaces at the edges of the keys or values.

In case you want to add a new language, follow these steps:

-   Create a file in [src/locales](./src/locales/) named `locale-LANG.json`, being `LANG` the locale code, eg: `en`, `es`, etc.
-   Put inside the file an empty object: `{}` and save it.
-   Edit [src/i18n.ts](./src/i18n.ts). Search for `AVAILABLE_LANGUAGES` and add the entry to the array.
-   Run the command `npm run update-translations`
-   Translate all the keys in the `.missing.txt` file.
-   Set `STATUS=READY` in the `.missing.txt` file.
-   Run `npm run apply-missing-translations`

### Making API requests

In order to make the API requests, the project uses:

-   The [API bindings](./src/api/), automatically generated from the backend with its API documentation.
-   The [request-browser](https://github.com/AgustinSRG/request-browser) wrapper library, that uses the API bindings to make requests using the browser native API.

To make a request, use `Request.Do` or `makeApiRequest` with the corresponding API binding:

```ts
Request.Do(ApiExample.Example({ exampleParameter: 1, otherParameter: "example" }))
    .onSuccess((response) => {
        // Add here code to run when the request finishes. the response contains the parsed data
        console.log("Example field: " + response.exampleResultField);
        console.log("Other field: " + response.otherField);
    })
    .onRequestError((err, handleErr) => {
        // Add here code to run when the request fails

        handleErr(err, {
            exampleError: () => {
                console.log("Request failed: Example error");
            },
            serverError: () => {
                console.log("Request failed: Internal server error");
            },
            networkError: () => {
                console.log("Request failed: Network or unknown error");
            },
        });
    })
    .onCancel(() => {
        // Add here code to run when the request is cancelled
        console.log("The request was cancelled");
    })
    .onUnexpectedError((err) => {
        // Add here code to run for an unexpected error
        // For example: an exception inside the onSuccess handler
        console.error(err);
    });
```

In some cases, you may want to name a request, in order to be able to abort it. For that use `Request.Pending` or `makeNamedApiRequest`:

```ts
Request.Pending("unique-request-name", ApiExample.Example({ exampleParameter: 1, otherParameter: "example" }));
// ...
```

You can abort a named request using `Request.Abort` or `abortNamedApiRequest`.

When using named request inside components, try to use unique identifiers you can create when creating the component, use `getUniqueStringId` fort that:

```ts
// ...

export default defineComponent({
    // ...
    setup(props) {
        return {
            loadRequestId: getUniqueStringId(),
            // ...
        };
    },
    // ...
    methods: {
        // ...

        load: function () {
            // ...
            Request.Pending(this.loadRequestId, ApiExample.Example({ exampleParameter: 1, otherParameter: "example" }));
            // ...
        },

        // ...
    },

    // ...

    beforeUnmount: function () {
        // Abort named requests if the component is removed
        Request.Abort(this.loadRequestId);
    },
});
```

### Using global events

You can use global events by using the control class [AppEvents](./src/control/app-events.ts).

Global events can be useful in order to update multiple parts of the application without making it too complex.

If you want to listen for a global event inside of a component, use the injected `$listenOnAppEvent` method. This is preferred than using `AppEvents.AddEventListener` since it will automatically remove the listener if the component is removed, preventing memory leaks.

### Routes

This project uses [Vue Router](https://router.vuejs.org/guide/) in order to manage the application routes.

In order to add more routes or change the existing ones, modify [src/routes.ts](./src/routes.ts).

### Modals

This project has built-in modals, here is a template:

```vue
<template>
    <ModalDialogContainer ref="modalContainer" v-model:display="displayStatus">
        <form @submit="submit" class="modal-dialog modal-md" role="document" @click="stopPropagationEvent">
            <div class="modal-header">
                <div class="modal-title">{{ $t("Modal title") }}</div>
                <button type="button" class="modal-close-btn" :title="$t('Close')" @click="close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>{{ $t("Modal body") }}</p>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">
                    {{ $t("Submit") }}
                </button>
            </div>
        </form>
    </ModalDialogContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useVModel } from "@/utils/v-model";

export default defineComponent({
    name: "LogoutModal",
    emits: ["update:display"],
    props: {
        display: Boolean,
    },
    setup(props) {
        return {
            displayStatus: useVModel(props, "display"),
        };
    },
    data: function () {
        return {},
    },
    methods: {
        resetAndAutoFocus: function () {
            // Reset modal and focus
            this.$autoFocus();
        },

        close: function () {
            this.$closeModal();
        },

        stopPropagationEvent: function (e) {
            e.stopPropagation();
        },

        submit: function (e: Event) {
            e.preventDefault();
            // ...
        },
    },
    mounted: function () {
        if (this.display) {
            this.resetAndAutoFocus();
        }
    },
    watch: {
        display: function () {
            if (this.display) {
                this.resetAndAutoFocus();
            }
        },
    },
});
</script>

<style></style>
```

Notes:

-   The modal uses the `ModalDialogContainer` component, with a reference named `modalContainer`.
-   In order to close the modal smoothly (with animation), use the `$closeModal` method.
-   You can auto focus a field using the `$autoFocus` method, adding the `auto-focus` class to the field you want to focus.
-   If you want to show a modal on top of a modal, that modal should be included inside the first modal.

### Styles

All the stylesheet files are stored inside the [src/style](./src/style/) folder. In order to add new ones, make sure to import them in the `style` section of a component, or in the main component [src/App.vue](./src/App.vue).

```vue
<style>
@import "@/style/example.css";
</style>
```

In case the style is very specific for the component, you can use `style scoped` to prevent interfering with other styles:

```vue
<style scoped>
.example {
    color: red;
}
</style>
```

Colors for themes are defined as css variables in [src/style/theme.css](./src/style/theme.css), mame sure to use those color to be theme-responsive.

This projects imports [Font Awesome](https://fontawesome.com/) in order to add icons. You can [search for them](https://fontawesome.com/search?o=r&m=free) and use the most appropriate one for each case.
